import { Link, Paper, Stack, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useNavigate, useParams } from "react-router";

import { deleteProject, projectQuery } from "../api/projects";
import { invalidateResources } from "../api/queryClient";
import type { ProjectDetail } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import DetailActions from "../components/DetailActions";
import ErrorState from "../components/ErrorState";
import Field from "../components/Field";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import ProjectFormDialog from "../components/ProjectFormDialog";
import ProjectTeam from "../components/ProjectTeam";
import StatusChip from "../components/StatusChip";
import { useCrudDialogs } from "../hooks/useCrudDialogs";
import { formatDate } from "../utils/format";

export default function ProjectDetailPage() {
  const projectId = Number(useParams().projectId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { form, pendingDelete, openEdit, closeForm, askDelete, cancelDelete } =
    useCrudDialogs<ProjectDetail>();

  const { data: project, isPending, error } = useQuery(projectQuery(projectId));

  const remove = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      navigate("/projects", { replace: true });
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
        title={project.name}
        action={
          user && (
            <DetailActions
              onEdit={() => openEdit(project)}
              onDelete={() => askDelete(project)}
            />
          )
        }
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          {project.description && <Typography>{project.description}</Typography>}
          <Stack direction="row" spacing={6} sx={{ flexWrap: "wrap", rowGap: 2 }}>
            <Field label="Company">
              <Link component={RouterLink} to={`/companies/${project.company}`}>
                {project.company_name}
              </Link>
            </Field>
            <Field label="Status">
              <StatusChip status={project.status} />
            </Field>
            <Field label="Start">{formatDate(project.start_date)}</Field>
            <Field label="End">{formatDate(project.end_date)}</Field>
          </Stack>
        </Stack>
      </Paper>

      <ProjectTeam project={project} />

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
