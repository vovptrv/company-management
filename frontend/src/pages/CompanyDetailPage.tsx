import {
  Box,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router";

import { industryLabel, projectStatusLabel } from "../api/choices";
import { companyQuery, deleteCompany } from "../api/companies";
import { employeeListQuery } from "../api/employees";
import { projectListQuery } from "../api/projects";
import { invalidateResources } from "../api/queryClient";
import type { Company } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import CompanyFormDialog from "../components/CompanyFormDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import DetailActions from "../components/DetailActions";
import ErrorState from "../components/ErrorState";
import Field from "../components/Field";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import { useCrudDialogs } from "../hooks/useCrudDialogs";
import { EMPTY_VALUE, formatDate, fullName } from "../utils/format";

const PREVIEW_SIZE = 5;

export default function CompanyDetailPage() {
  const companyId = Number(useParams().companyId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { form, pendingDelete, openEdit, closeForm, askDelete, cancelDelete } =
    useCrudDialogs<Company>();

  const { data: company, isPending, error } = useQuery(companyQuery(companyId));
  const employees = useQuery(
    employeeListQuery({ company: companyId, page_size: PREVIEW_SIZE, ordering: "last_name" }),
  );
  const projects = useQuery(projectListQuery({ company: companyId, page_size: PREVIEW_SIZE }));

  const remove = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      navigate("/companies", { replace: true });
      invalidateResources();
    },
  });

  if (isPending) {
    return <Loading />;
  }
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <PageHeader
        title={company.name}
        subtitle={industryLabel(company.industry)}
        action={
          user && (
            <DetailActions
              onEdit={() => openEdit(company)}
              onDelete={() => askDelete(company)}
            />
          )
        }
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          {company.description && <Typography>{company.description}</Typography>}
          <Stack direction="row" spacing={6} sx={{ flexWrap: "wrap", rowGap: 2 }}>
            <Field label="Email">{company.email || EMPTY_VALUE}</Field>
            <Field label="Website">
              {company.website ? (
                <Link href={company.website} target="_blank" rel="noopener">
                  {company.website}
                </Link>
              ) : (
                EMPTY_VALUE
              )}
            </Field>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section
            title="Employees"
            count={employees.data?.count}
            viewAllTo={`/employees?company=${companyId}`}
          >
            {employees.error && <ErrorState error={employees.error} />}
            {employees.data?.results.length === 0 && (
              <Typography sx={{ color: "text.secondary" }}>No employees yet.</Typography>
            )}
            <List dense disablePadding>
              {employees.data?.results.map((employee) => (
                <ListItem key={employee.id} disableGutters>
                  <ListItemText
                    primary={
                      <Link component={RouterLink} to={`/employees/${employee.id}`}>
                        {fullName(employee)}
                      </Link>
                    }
                    secondary={employee.position}
                  />
                </ListItem>
              ))}
            </List>
          </Section>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Section
            title="Projects"
            count={projects.data?.count}
            viewAllTo={`/projects?company=${companyId}`}
          >
            {projects.error && <ErrorState error={projects.error} />}
            {projects.data?.results.length === 0 && (
              <Typography sx={{ color: "text.secondary" }}>No projects yet.</Typography>
            )}
            <List dense disablePadding>
              {projects.data?.results.map((project) => (
                <ListItem key={project.id} disableGutters>
                  <ListItemText
                    primary={
                      <Link component={RouterLink} to={`/projects/${project.id}`}>
                        {project.name}
                      </Link>
                    }
                    secondary={`${projectStatusLabel(project.status)} · starts ${formatDate(project.start_date)}`}
                  />
                </ListItem>
              ))}
            </List>
          </Section>
        </Grid>
      </Grid>

      {form && <CompanyFormDialog company={form.entity} onClose={closeForm} />}

      {pendingDelete && (
        <ConfirmDeleteDialog
          title="Delete company?"
          description={`${pendingDelete.name}, its employees and its projects will be removed.`}
          error={remove.error}
          isPending={remove.isPending}
          onCancel={cancelDelete}
          onConfirm={() => remove.mutate(pendingDelete.id)}
        />
      )}
    </>
  );
}

type SectionProps = {
  title: string;
  count?: number;
  viewAllTo: string;
  children: ReactNode;
};

function Section({ title, count, viewAllTo, children }: SectionProps) {
  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1,
        }}
      >
        <Typography variant="h6">
          {title}
          {count !== undefined && ` (${count})`}
        </Typography>
        <Link component={RouterLink} to={viewAllTo}>
          View all
        </Link>
      </Box>
      {children}
    </Paper>
  );
}
