import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { apiClient } from "./client";
import type { Paginated, Project, ProjectDetail, ProjectListParams } from "./types";

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
