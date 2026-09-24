import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
      <Typography variant="h4">Page not found</Typography>
      <Button component={Link} to="/" variant="contained">
        Back to companies
      </Button>
    </Stack>
  );
}
