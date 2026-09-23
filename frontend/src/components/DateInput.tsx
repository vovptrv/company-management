import { TextField } from "@mui/material";

type DateInputProps = {
  label: string;
  value: string | null;
  error?: string;
  onChange: (value: string | null) => void;
};

export default function DateInput({ label, value, error, onChange }: DateInputProps) {
  return (
    <TextField
      type="date"
      label={label}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
      error={Boolean(error)}
      helperText={error}
      fullWidth
      // A date input always shows its own placeholder, so the label cannot float over it.
      slotProps={{ inputLabel: { shrink: true } }}
    />
  );
}
