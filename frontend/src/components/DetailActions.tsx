import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Button, Stack } from "@mui/material";

type DetailActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function DetailActions({ onEdit, onDelete }: DetailActionsProps) {
  return (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
        Edit
      </Button>
      <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
        Delete
      </Button>
    </Stack>
  );
}
