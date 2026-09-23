export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Industry =
  | "technology"
  | "finance"
  | "healthcare"
  | "education"
  | "retail"
  | "media"
  | "other";

export type ProjectStatus = "planned" | "active" | "completed";

export type Company = {
  id: number;
  name: string;
  description: string;
  industry: Industry;
  email: string;
  website: string;
  created_at: string;
  updated_at: string;
};

export type Employee = {
  id: number;
  company: number;
  company_name: string;
  projects: number[];
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  hire_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: number;
  company: number;
  company_name: string;
  employees: number[];
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

/** Nested shapes returned by the detail endpoints instead of plain ids. */
export type EmployeeProject = Pick<Project, "id" | "name" | "status">;
export type ProjectEmployee = Pick<Employee, "id" | "first_name" | "last_name" | "position">;

export type EmployeeDetail = Omit<Employee, "projects"> & { projects: EmployeeProject[] };
export type ProjectDetail = Omit<Project, "employees"> & { employees: ProjectEmployee[] };

export type ListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
};

export type CompanyListParams = ListParams & { industry?: string };
export type EmployeeListParams = ListParams & { company?: number };
export type ProjectListParams = ListParams & { company?: number; status?: string };
