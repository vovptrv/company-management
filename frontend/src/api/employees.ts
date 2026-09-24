import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { apiClient } from "./client";
import type {
  Employee,
  EmployeeDetail,
  EmployeeInput,
  EmployeeListParams,
  Paginated,
} from "./types";

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

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const { data } = await apiClient.post<Employee>("/employees/", input);
  return data;
}

export async function updateEmployee(id: number, input: EmployeeInput): Promise<Employee> {
  const { data } = await apiClient.patch<Employee>(`/employees/${id}/`, input);
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await apiClient.delete(`/employees/${id}/`);
}
