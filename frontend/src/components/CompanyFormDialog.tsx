import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { INDUSTRY_CHOICES } from "../api/choices";
import { createCompany, updateCompany } from "../api/companies";
import { getFieldErrors } from "../api/errors";
import { invalidateResources } from "../api/queryClient";
import type { Company, CompanyInput } from "../api/types";
import ChoiceInput from "./ChoiceInput";
import FormDialog from "./FormDialog";
import TextInput from "./TextInput";

const FIELDS = ["name", "industry", "email", "website", "description"];

type CompanyFormDialogProps = {
  company: Company | null;
  onClose: () => void;
};

export default function CompanyFormDialog({ company, onClose }: CompanyFormDialogProps) {
  const [values, setValues] = useState<CompanyInput>({
    name: company?.name ?? "",
    industry: company?.industry ?? "",
    email: company?.email ?? "",
    website: company?.website ?? "",
    description: company?.description ?? "",
  });

  const save = useMutation({
    mutationFn: () => (company ? updateCompany(company.id, values) : createCompany(values)),
    onSuccess: () => {
      invalidateResources();
      onClose();
    },
  });

  const errors = save.error ? getFieldErrors(save.error, FIELDS) : {};

  function setValue<K extends keyof CompanyInput>(name: K, value: CompanyInput[K]) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  return (
    <FormDialog
      title={company ? "Edit company" : "New company"}
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
      <ChoiceInput
        label="Industry"
        value={values.industry}
        choices={INDUSTRY_CHOICES}
        error={errors.industry}
        onChange={(value) => setValue("industry", value)}
      />
      <TextInput
        label="Email"
        value={values.email}
        error={errors.email}
        onChange={(value) => setValue("email", value)}
        type="email"
      />
      <TextInput
        label="Website"
        value={values.website}
        error={errors.website}
        onChange={(value) => setValue("website", value)}
        type="url"
      />
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
