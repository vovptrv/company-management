import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { apiClient } from "./client";
import type { Company, CompanyListParams, Paginated } from "./types";

// Every company at once, for the dropdowns that must offer all of them.
const OPTIONS_PAGE_SIZE = 100;

export const companyKeys = {
  all: ["companies"] as const,
  list: (params: CompanyListParams) => [...companyKeys.all, "list", params] as const,
  detail: (id: number) => [...companyKeys.all, "detail", id] as const,
};

export const companyListQuery = (params: CompanyListParams) =>
  queryOptions({
    queryKey: companyKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Company>>("/companies/", { params });
      return data;
    },
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
  });

export const companyOptionsQuery = () =>
  companyListQuery({ page_size: OPTIONS_PAGE_SIZE, ordering: "name" });

export const companyQuery = (id: number) =>
  queryOptions({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Company>(`/companies/${id}/`);
      return data;
    },
  });
