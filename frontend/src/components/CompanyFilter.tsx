import { MenuItem, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { companyOptionsQuery } from "../api/companies";

type CompanyFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function CompanyFilter({ value, onChange }: CompanyFilterProps) {
  const { data } = useQuery(companyOptionsQuery());

  return (
    <TextField
      select
      size="small"
      label="Company"
      value={data ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      sx={{ minWidth: 220 }}
    >
      <MenuItem value="">All companies</MenuItem>
      {data?.results.map((company) => (
        <MenuItem key={company.id} value={String(company.id)}>
          {company.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
