import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import type { ReactNode } from "react";

import { NON_FIELD_ERROR } from "../api/errors";
import type { FieldErrors } from "../api/errors";

type FormDialogProps = {
  title: string;
  errors: FieldErrors;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
};

export default function FormDialog({
  title,
  errors,
  isPending,
  onClose,
  onSubmit,
  children,
}: FormDialogProps) {
  return (
    <Dialog open fullWidth maxWidth="sm" onClose={isPending ? undefined : onClose}>
      <Box
        component="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {errors[NON_FIELD_ERROR] && (
              <Alert severity="error">{errors[NON_FIELD_ERROR]}</Alert>
            )}
            {children}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={isPending}>
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
