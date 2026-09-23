import {
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router";

import { employeeQuery } from "../api/employees";
import ErrorState from "../components/ErrorState";
import Field from "../components/Field";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import StatusChip from "../components/StatusChip";
import { formatDate, fullName } from "../utils/format";

export default function EmployeeDetailPage() {
  const employeeId = Number(useParams().employeeId);

  const { data: employee, isPending, error } = useQuery(employeeQuery(employeeId));

  if (isPending) {
    return <Loading />;
  }
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <PageHeader title={fullName(employee)} subtitle={employee.position} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={6} sx={{ flexWrap: "wrap", rowGap: 2 }}>
          <Field label="Company">
            <Link component={RouterLink} to={`/companies/${employee.company}`}>
              {employee.company_name}
            </Link>
          </Field>
          <Field label="Email">
            <Link href={`mailto:${employee.email}`}>{employee.email}</Link>
          </Field>
          <Field label="Hired">{formatDate(employee.hire_date)}</Field>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Projects ({employee.projects.length})
        </Typography>

        {employee.projects.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>
            Not assigned to any project yet.
          </Typography>
        ) : (
          <List dense disablePadding>
            {employee.projects.map((project) => (
              <ListItem
                key={project.id}
                disableGutters
                secondaryAction={<StatusChip status={project.status} />}
              >
                <ListItemText
                  primary={
                    <Link component={RouterLink} to={`/projects/${project.id}`}>
                      {project.name}
                    </Link>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </>
  );
}
