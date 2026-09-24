import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import {
  Button,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink } from "react-router";

import { employeeOptionsQuery } from "../api/employees";
import { addProjectEmployee, projectQuery, removeProjectEmployee } from "../api/projects";
import { invalidateResources, queryClient } from "../api/queryClient";
import type { ProjectDetail } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { fullName } from "../utils/format";
import ErrorState from "./ErrorState";

export default function ProjectTeam({ project }: { project: ProjectDetail }) {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<number | "">("");

  const candidates = useQuery({
    ...employeeOptionsQuery(project.company),
    enabled: Boolean(user),
  });

  // Both endpoints answer with the whole project, so the detail is up to date at once.
  function cacheProject(updated: ProjectDetail) {
    queryClient.setQueryData(projectQuery(project.id).queryKey, updated);
    invalidateResources();
  }

  const addMember = useMutation({
    mutationFn: (employeeId: number) => addProjectEmployee(project.id, employeeId),
    onSuccess: (updated) => {
      setCandidate("");
      cacheProject(updated);
    },
  });

  const removeMember = useMutation({
    mutationFn: (employeeId: number) => removeProjectEmployee(project.id, employeeId),
    onSuccess: cacheProject,
  });

  const memberIds = new Set(project.employees.map((employee) => employee.id));
  const available = candidates.data?.results.filter((employee) => !memberIds.has(employee.id)) ?? [];
  const isBusy = addMember.isPending || removeMember.isPending;
  const error = addMember.error ?? removeMember.error;

  return (
    <>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Team ({project.employees.length})
      </Typography>

      {user && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            size="small"
            label="Add employee"
            value={candidate}
            onChange={(event) => setCandidate(Number(event.target.value) || "")}
            sx={{ minWidth: 280 }}
          >
            {available.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {fullName(employee)} — {employee.position}
              </MenuItem>
            ))}
            {available.length === 0 && (
              <MenuItem disabled value="">
                Everyone in {project.company_name} is already on the team.
              </MenuItem>
            )}
          </TextField>
          <Button
            variant="contained"
            disabled={candidate === ""}
            loading={addMember.isPending}
            onClick={() => {
              if (candidate !== "") {
                addMember.mutate(candidate);
              }
            }}
          >
            Add
          </Button>
        </Stack>
      )}

      {error != null && (
        <Stack sx={{ mb: 2 }}>
          <ErrorState error={error} />
        </Stack>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              {user && <TableCell />}
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
                {user && (
                  <TableCell align="right" sx={{ py: 0 }}>
                    <Tooltip title={`Remove ${fullName(employee)} from the team`}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label={`Remove ${fullName(employee)} from the team`}
                          disabled={isBusy}
                          onClick={() => removeMember.mutate(employee.id)}
                        >
                          <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {project.employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={user ? 3 : 2} align="center" sx={{ py: 4 }}>
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
