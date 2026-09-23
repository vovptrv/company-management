import {
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
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";

import { PROJECT_STATUS_CHOICES } from "../api/choices";
import { PAGE_SIZE } from "../api/client";
import { projectListQuery } from "../api/projects";
import CompanyFilter from "../components/CompanyFilter";
import ErrorState from "../components/ErrorState";
import ListPagination from "../components/ListPagination";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import SearchField from "../components/SearchField";
import StatusChip from "../components/StatusChip";
import { useListParams } from "../hooks/useListParams";
import { formatDate } from "../utils/format";

export default function ProjectsPage() {
  const { page, search, getParam, setParam, setPage } = useListParams();
  const company = getParam("company");
  const status = getParam("status");

  const { data, isPending, error } = useQuery(
    projectListQuery({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      company: company ? Number(company) : undefined,
      status: status || undefined,
    }),
  );

  return (
    <>
      <PageHeader title="Projects" subtitle={data && `${data.count} total`} />

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
                  </TableRow>
                ))}
                {data.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
    </>
  );
}
