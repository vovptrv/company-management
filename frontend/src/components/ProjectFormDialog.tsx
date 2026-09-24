import { Stack } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { PROJECT_STATUS_CHOICES } from "../api/choices";
import { getFieldErrors } from "../api/errors";
import { createProject, updateProject } from "../api/projects";
import { invalidateResources } from "../api/queryClient";
import type { Project, ProjectDetail, ProjectInput } from "../api/types";
import ChoiceInput from "./ChoiceInput";
import CompanySelect from "./CompanySelect";
import DateInput from "./DateInput";
import FormDialog from "./FormDialog";
import TextInput from "./TextInput";

const FIELDS = ["company", "name", "status", "start_date", "end_date", "description"];

type ProjectFormDialogProps = {
  project: Project | ProjectDetail | null;
  onClose: () => void;
};

export default function ProjectFormDialog({ project, onClose }: ProjectFormDialogProps) {
  const [values, setValues] = useState<ProjectInput>({
    company: project?.company ?? "",
    name: project?.name ?? "",
    status: project?.status ?? "planned",
    start_date: project?.start_date ?? null,
    end_date: project?.end_date ?? null,
    description: project?.description ?? "",
  });

  const save = useMutation({
    mutationFn: () => (project ? updateProject(project.id, values) : createProject(values)),
    onSuccess: () => {
      invalidateResources();
      onClose();
    },
  });

  const errors = save.error ? getFieldErrors(save.error, FIELDS) : {};

  function setValue<K extends keyof ProjectInput>(name: K, value: ProjectInput[K]) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  return (
    <FormDialog
      title={project ? "Edit project" : "New project"}
      errors={errors}
      isPending={save.isPending}
      onClose={onClose}
      onSubmit={() => save.mutate()}
    >
      <TextInput
        label="Name"
        value={values.name}
        error={errors.name}
        onChange={(value) => setValue("name", value)}
        required
        autoFocus
      />
      <CompanySelect
        value={values.company}
        error={errors.company}
        onChange={(value) => setValue("company", value)}
      />
      <ChoiceInput
        label="Status"
        value={values.status}
        choices={PROJECT_STATUS_CHOICES}
        error={errors.status}
        onChange={(value) => setValue("status", value)}
      />
      <Stack direction="row" spacing={2}>
        <DateInput
          label="Start date"
          value={values.start_date}
          error={errors.start_date}
          onChange={(value) => setValue("start_date", value)}
        />
        <DateInput
          label="End date"
          value={values.end_date}
          error={errors.end_date}
          onChange={(value) => setValue("end_date", value)}
        />
      </Stack>
      <TextInput
        label="Description"
        value={values.description}
        error={errors.description}
        onChange={(value) => setValue("description", value)}
        multiline
      />
    </FormDialog>
  );
}
