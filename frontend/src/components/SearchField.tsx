import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

const DEBOUNCE_MS = 300;

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export default function SearchField({ value, onChange, label = "Search" }: SearchFieldProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) {
      return;
    }
    const timeout = setTimeout(() => onChange(draft), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [draft, value, onChange]);

  return (
    <TextField
      size="small"
      label={label}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      sx={{ minWidth: 240 }}
    />
  );
}
