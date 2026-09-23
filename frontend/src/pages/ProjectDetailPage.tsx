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
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router";

import { projectQuery } from "../api/projects";
import ErrorState from "../components/ErrorState";
import Field from "../components/Field";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import StatusChip from "../components/StatusChip";
import { formatDate, fullName } from "../utils/format";

export default function ProjectDetailPage() {
  const projectId = Number(useParams().projectId);

  const { data: project, isPending, error } = useQuery(projectQuery(projectId));

  if (isPending) {
    return <Loading />;
  }
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <PageHeader title={project.name} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          {project.description && <Typography>{project.description}</Typography>}
          <Stack direction="row" spacing={6} sx={{ flexWrap: "wrap", rowGap: 2 }}>
            <Field label="Company">
              <Link component={RouterLink} to={`/companies/${project.company}`}>
                {project.company_name}
              </Link>
            </Field>
            <Field label="Status">
              <StatusChip status={project.status} />
            </Field>
            <Field label="Start">{formatDate(project.start_date)}</Field>
            <Field label="End">{formatDate(project.end_date)}</Field>
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Team ({project.employees.length})
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {project.employees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/employees/${employee.id}`}>
                    {fullName(employee)}
                  </Link>
                </TableCell>
                <TableCell>{employee.position}</TableCell>
              </TableRow>
            ))}
            {project.employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                  Nobody is assigned to this project yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
