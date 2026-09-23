import {
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
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";

import { PAGE_SIZE } from "../api/client";
import { employeeListQuery } from "../api/employees";
import CompanyFilter from "../components/CompanyFilter";
import ErrorState from "../components/ErrorState";
import ListPagination from "../components/ListPagination";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import SearchField from "../components/SearchField";
import { useListParams } from "../hooks/useListParams";
import { formatDate, fullName } from "../utils/format";

export default function EmployeesPage() {
  const { page, search, getParam, setParam, setPage } = useListParams();
  const company = getParam("company");

  const { data, isPending, error } = useQuery(
    employeeListQuery({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      company: company ? Number(company) : undefined,
    }),
  );

  return (
    <>
      <PageHeader title="Employees" subtitle={data && `${data.count} total`} />

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
                  </TableRow>
                ))}
                {data.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
    </>
  );
}
