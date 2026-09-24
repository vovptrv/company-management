import { Stack } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { createEmployee, updateEmployee } from "../api/employees";
import { getFieldErrors } from "../api/errors";
import { invalidateResources } from "../api/queryClient";
import type { Employee, EmployeeDetail, EmployeeInput } from "../api/types";
import CompanySelect from "./CompanySelect";
import DateInput from "./DateInput";
import FormDialog from "./FormDialog";
import TextInput from "./TextInput";

const FIELDS = ["company", "first_name", "last_name", "email", "position", "hire_date"];

type EmployeeFormDialogProps = {
  employee: Employee | EmployeeDetail | null;
  onClose: () => void;
};

export default function EmployeeFormDialog({ employee, onClose }: EmployeeFormDialogProps) {
  const [values, setValues] = useState<EmployeeInput>({
    company: employee?.company ?? "",
    first_name: employee?.first_name ?? "",
    last_name: employee?.last_name ?? "",
    email: employee?.email ?? "",
    position: employee?.position ?? "",
    hire_date: employee?.hire_date ?? null,
  });

  const save = useMutation({
    mutationFn: () => (employee ? updateEmployee(employee.id, values) : createEmployee(values)),
    onSuccess: () => {
      invalidateResources();
      onClose();
    },
  });

  const errors = save.error ? getFieldErrors(save.error, FIELDS) : {};

  function setValue<K extends keyof EmployeeInput>(name: K, value: EmployeeInput[K]) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  return (
    <FormDialog
      title={employee ? "Edit employee" : "New employee"}
      errors={errors}
      isPending={save.isPending}
      onClose={onClose}
      onSubmit={() => save.mutate()}
    >
      <Stack direction="row" spacing={2}>
        <TextInput
          label="First name"
          value={values.first_name}
          error={errors.first_name}
          onChange={(value) => setValue("first_name", value)}
          required
          autoFocus
        />
        <TextInput
          label="Last name"
          value={values.last_name}
          error={errors.last_name}
          onChange={(value) => setValue("last_name", value)}
          required
        />
      </Stack>
      <TextInput
        label="Email"
        value={values.email}
        error={errors.email}
        onChange={(value) => setValue("email", value)}
        type="email"
        required
      />
      <TextInput
        label="Position"
        value={values.position}
        error={errors.position}
        onChange={(value) => setValue("position", value)}
        required
      />
      <CompanySelect
        value={values.company}
        error={errors.company}
        onChange={(value) => setValue("company", value)}
      />
      <DateInput
        label="Hire date"
        value={values.hire_date}
        error={errors.hire_date}
        onChange={(value) => setValue("hire_date", value)}
      />
    </FormDialog>
  );
}
