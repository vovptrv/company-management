import {
  Link,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";

import { INDUSTRY_CHOICES, industryLabel } from "../api/choices";
import { PAGE_SIZE } from "../api/client";
import { companyListQuery } from "../api/companies";
import ErrorState from "../components/ErrorState";
import ListPagination from "../components/ListPagination";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import SearchField from "../components/SearchField";
import { useListParams } from "../hooks/useListParams";
import { EMPTY_VALUE } from "../utils/format";

export default function CompaniesPage() {
  const { page, search, getParam, setParam, setPage } = useListParams();
  const industry = getParam("industry");

  const { data, isPending, error } = useQuery(
    companyListQuery({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      industry: industry || undefined,
    }),
  );

  return (
    <>
      <PageHeader title="Companies" subtitle={data && `${data.count} total`} />

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <SearchField
          value={search}
          label="Search by name"
          onChange={(value) => setParam("search", value)}
        />
        <TextField
          select
          size="small"
          label="Industry"
          value={industry}
          onChange={(event) => setParam("industry", event.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All industries</MenuItem>
          {INDUSTRY_CHOICES.map((choice) => (
            <MenuItem key={choice.value} value={choice.value}>
              {choice.label}
            </MenuItem>
          ))}
        </TextField>
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
                  <TableCell>Industry</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Website</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.results.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>
                      <Link component={RouterLink} to={`/companies/${company.id}`}>
                        {company.name}
                      </Link>
                    </TableCell>
                    <TableCell>{industryLabel(company.industry)}</TableCell>
                    <TableCell>{company.email || EMPTY_VALUE}</TableCell>
                    <TableCell>
                      {company.website ? (
                        <Link href={company.website} target="_blank" rel="noopener">
                          {company.website}
                        </Link>
                      ) : (
                        EMPTY_VALUE
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {data.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      No companies match the current filters.
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
