import { MenuItem, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { companyOptionsQuery } from "../api/companies";

type CompanySelectProps = {
  value: number | "";
  error?: string;
  onChange: (value: number | "") => void;
};

export default function CompanySelect({ value, error, onChange }: CompanySelectProps) {
  const { data } = useQuery(companyOptionsQuery());

  return (
    <TextField
      select
      required
      label="Company"
      value={data ? value : ""}
      onChange={(event) => onChange(Number(event.target.value) || "")}
      error={Boolean(error)}
      helperText={error}
      fullWidth
    >
      {data?.results.map((company) => (
        <MenuItem key={company.id} value={company.id}>
          {company.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
