import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";

import { PAGE_SIZE } from "../api/client";
import { deleteEmployee, employeeListQuery } from "../api/employees";
import { invalidateResources } from "../api/queryClient";
import type { Employee } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import CompanyFilter from "../components/CompanyFilter";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import EmployeeFormDialog from "../components/EmployeeFormDialog";
import ErrorState from "../components/ErrorState";
import ListPagination from "../components/ListPagination";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import RowActions from "../components/RowActions";
import SearchField from "../components/SearchField";
import { useCrudDialogs } from "../hooks/useCrudDialogs";
import { useListParams } from "../hooks/useListParams";
import { formatDate, fullName } from "../utils/format";

export default function EmployeesPage() {
  const { page, search, getParam, setParam, setPage } = useListParams();
  const company = getParam("company");
  const { user } = useAuth();
  const { form, pendingDelete, openCreate, openEdit, closeForm, askDelete, cancelDelete } =
    useCrudDialogs<Employee>();

  const { data, isPending, error } = useQuery(
    employeeListQuery({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      company: company ? Number(company) : undefined,
    }),
  );

  const remove = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      invalidateResources();
      cancelDelete();
    },
  });

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle={data && `${data.count} total`}
        action={
          user && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              New employee
            </Button>
          )
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <SearchField
          value={search}
          label="Search by name or email"
          onChange={(value) => setParam("search", value)}
        />
        <CompanyFilter value={company} onChange={(value) => setParam("company", value)} />
      </Stack>

      {isPending && <Loading />}
      {error && <ErrorState error={error} />}

      {data && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Hired</TableCell>
                  <TableCell align="right">Projects</TableCell>
                  {user && <TableCell />}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.results.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Link component={RouterLink} to={`/employees/${employee.id}`}>
                        {fullName(employee)}
                      </Link>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/companies/${employee.company}`}>
                        {employee.company_name}
                      </Link>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{formatDate(employee.hire_date)}</TableCell>
                    <TableCell align="right">{employee.projects.length}</TableCell>
                    {user && (
                      <TableCell align="right" sx={{ py: 0 }}>
                        <RowActions
                          label={fullName(employee)}
                          onEdit={() => openEdit(employee)}
                          onDelete={() => askDelete(employee)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {data.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={user ? 7 : 6} align="center" sx={{ py: 4 }}>
                      No employees match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <ListPagination
            count={data.count}
            pageSize={PAGE_SIZE}
            page={page}
            onChange={setPage}
          />
        </>
      )}

      {form && <EmployeeFormDialog employee={form.entity} onClose={closeForm} />}

      {pendingDelete && (
        <ConfirmDeleteDialog
          title="Delete employee?"
          description={`${fullName(pendingDelete)} will be removed from the company and from every project.`}
          error={remove.error}
          isPending={remove.isPending}
          onCancel={cancelDelete}
          onConfirm={() => remove.mutate(pendingDelete.id)}
        />
      )}
    </>
  );
}
