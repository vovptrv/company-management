import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { apiClient } from "./client";
import type { Employee, EmployeeDetail, EmployeeListParams, Paginated } from "./types";

const OPTIONS_PAGE_SIZE = 100;

export const employeeKeys = {
  all: ["employees"] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.all, "list", params] as const,
  detail: (id: number) => [...employeeKeys.all, "detail", id] as const,
};

export const employeeListQuery = (params: EmployeeListParams) =>
  queryOptions({
    queryKey: employeeKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Employee>>("/employees/", { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });

export const employeeOptionsQuery = (company: number) =>
  employeeListQuery({ company, page_size: OPTIONS_PAGE_SIZE, ordering: "last_name" });

export const employeeQuery = (id: number) =>
  queryOptions({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<EmployeeDetail>(`/employees/${id}/`);
      return data;
    },
  });
