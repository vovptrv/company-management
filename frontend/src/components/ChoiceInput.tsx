import { MenuItem, TextField } from "@mui/material";

import type { Choice } from "../api/choices";

type ChoiceInputProps<T extends string> = {
  label: string;
  value: T | "";
  choices: Choice<T>[];
  error?: string;
  onChange: (value: T) => void;
};

export default function ChoiceInput<T extends string>({
  label,
  value,
  choices,
  error,
  onChange,
}: ChoiceInputProps<T>) {
  return (
    <TextField
      select
      required
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      error={Boolean(error)}
      helperText={error}
      fullWidth
    >
      {choices.map((choice) => (
        <MenuItem key={choice.value} value={choice.value}>
          {choice.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
