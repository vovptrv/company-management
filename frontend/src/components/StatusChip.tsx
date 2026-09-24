import { Chip } from "@mui/material";

import { projectStatusLabel } from "../api/choices";
import type { ProjectStatus } from "../api/types";

const STATUS_COLORS: Record<ProjectStatus, "default" | "info" | "success"> = {
  planned: "default",
  active: "info",
  completed: "success",
};

export default function StatusChip({ status }: { status: ProjectStatus }) {
  return <Chip size="small" color={STATUS_COLORS[status]} label={projectStatusLabel(status)} />;
}
