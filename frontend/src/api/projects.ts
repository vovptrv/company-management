import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { apiClient } from "./client";
import type {
  Paginated,
  Project,
  ProjectDetail,
  ProjectInput,
  ProjectListParams,
} from "./types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (params: ProjectListParams) => [...projectKeys.all, "list", params] as const,
  detail: (id: number) => [...projectKeys.all, "detail", id] as const,
};

export const projectListQuery = (params: ProjectListParams) =>
  queryOptions({
    queryKey: projectKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Project>>("/projects/", { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });

export const projectQuery = (id: number) =>
  queryOptions({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ProjectDetail>(`/projects/${id}/`);
      return data;
    },
  });

export async function createProject(input: ProjectInput): Promise<Project> {
  const { data } = await apiClient.post<Project>("/projects/", input);
  return data;
}

// PATCH, so that a form which does not show the team cannot wipe it.
export async function updateProject(id: number, input: ProjectInput): Promise<Project> {
  const { data } = await apiClient.patch<Project>(`/projects/${id}/`, input);
  return data;
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`/projects/${id}/`);
}

export async function addProjectEmployee(
  projectId: number,
  employeeId: number,
): Promise<ProjectDetail> {
  const { data } = await apiClient.post<ProjectDetail>(
    `/projects/${projectId}/employees/${employeeId}/`,
  );
  return data;
}

export async function removeProjectEmployee(
  projectId: number,
  employeeId: number,
): Promise<ProjectDetail> {
  const { data } = await apiClient.delete<ProjectDetail>(
    `/projects/${projectId}/employees/${employeeId}/`,
  );
  return data;
}
