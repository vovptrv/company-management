import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  children: ReactNode;
};

export default function Field({ label, children }: FieldProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Typography component="div">{children}</Typography>
    </Box>
  );
}
