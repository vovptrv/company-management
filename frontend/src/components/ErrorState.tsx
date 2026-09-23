import { Alert } from "@mui/material";

import { getErrorMessage } from "../api/errors";

export default function ErrorState({ error }: { error: unknown }) {
  return <Alert severity="error">{getErrorMessage(error)}</Alert>;
}
