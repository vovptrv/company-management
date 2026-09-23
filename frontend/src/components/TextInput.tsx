import { TextField } from "@mui/material";

type TextInputProps = {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "email" | "url";
  autoFocus?: boolean;
};

export default function TextInput({
  label,
  value,
  error,
  onChange,
  required,
  multiline,
  type = "text",
  autoFocus,
}: TextInputProps) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={error}
      required={required}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      type={type}
      autoFocus={autoFocus}
      fullWidth
    />
  );
}
