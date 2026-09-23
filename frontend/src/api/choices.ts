import type { Industry, ProjectStatus } from "./types";

export type Choice<T extends string> = { value: T; label: string };

export const INDUSTRY_CHOICES: Choice<Industry>[] = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "media", label: "Media" },
  { value: "other", label: "Other" },
];

export const PROJECT_STATUS_CHOICES: Choice<ProjectStatus>[] = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function industryLabel(value: Industry): string {
  return INDUSTRY_CHOICES.find((choice) => choice.value === value)?.label ?? value;
}

export function projectStatusLabel(value: ProjectStatus): string {
  return PROJECT_STATUS_CHOICES.find((choice) => choice.value === value)?.label ?? value;
}
