import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Link,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";

import { PROJECT_STATUS_CHOICES } from "../api/choices";
import { PAGE_SIZE } from "../api/client";
import { deleteProject, projectListQuery } from "../api/projects";
import { invalidateResources } from "../api/queryClient";
import type { Project } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import CompanyFilter from "../components/CompanyFilter";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import ErrorState from "../components/ErrorState";
import ListPagination from "../components/ListPagination";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import ProjectFormDialog from "../components/ProjectFormDialog";
import RowActions from "../components/RowActions";
import SearchField from "../components/SearchField";
import StatusChip from "../components/StatusChip";
import { useCrudDialogs } from "../hooks/useCrudDialogs";
import { useListParams } from "../hooks/useListParams";
import { formatDate } from "../utils/format";

export default function ProjectsPage() {
  const { page, search, getParam, setParam, setPage } = useListParams();
  const company = getParam("company");
  const status = getParam("status");
  const { user } = useAuth();
  const { form, pendingDelete, openCreate, openEdit, closeForm, askDelete, cancelDelete } =
    useCrudDialogs<Project>();

  const { data, isPending, error } = useQuery(
    projectListQuery({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      company: company ? Number(company) : undefined,
      status: status || undefined,
    }),
  );

  const remove = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      invalidateResources();
      cancelDelete();
    },
  });

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle={data && `${data.count} total`}
        action={
          user && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              New project
            </Button>
          )
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <SearchField
          value={search}
          label="Search by name"
          onChange={(value) => setParam("search", value)}
        />
        <CompanyFilter value={company} onChange={(value) => setParam("company", value)} />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(event) => setParam("status", event.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {PROJECT_STATUS_CHOICES.map((choice) => (
            <MenuItem key={choice.value} value={choice.value}>
              {choice.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {isPending && <Loading />}
      {error && <ErrorState error={error} />}

      {data && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell align="right">Team</TableCell>
                  {user && <TableCell />}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.results.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Link component={RouterLink} to={`/projects/${project.id}`}>
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/companies/${project.company}`}>
                        {project.company_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={project.status} />
                    </TableCell>
                    <TableCell>{formatDate(project.start_date)}</TableCell>
                    <TableCell>{formatDate(project.end_date)}</TableCell>
                    <TableCell align="right">{project.employees.length}</TableCell>
                    {user && (
                      <TableCell align="right" sx={{ py: 0 }}>
                        <RowActions
                          label={project.name}
                          onEdit={() => openEdit(project)}
                          onDelete={() => askDelete(project)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {data.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={user ? 7 : 6} align="center" sx={{ py: 4 }}>
                      No projects match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <ListPagination
            count={data.count}
            pageSize={PAGE_SIZE}
            page={page}
            onChange={setPage}
          />
        </>
      )}

      {form && <ProjectFormDialog project={form.entity} onClose={closeForm} />}

      {pendingDelete && (
        <ConfirmDeleteDialog
          title="Delete project?"
          description={`${pendingDelete.name} will be removed. Its employees stay in the company.`}
          error={remove.error}
          isPending={remove.isPending}
          onCancel={cancelDelete}
          onConfirm={() => remove.mutate(pendingDelete.id)}
        />
      )}
    </>
  );
}
