import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Stack, Tooltip } from "@mui/material";

type RowActionsProps = {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
};

export default function RowActions({ label, onEdit, onDelete }: RowActionsProps) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
      <Tooltip title={`Edit ${label}`}>
        <IconButton size="small" aria-label={`Edit ${label}`} onClick={onEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={`Delete ${label}`}>
        <IconButton size="small" color="error" aria-label={`Delete ${label}`} onClick={onDelete}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
