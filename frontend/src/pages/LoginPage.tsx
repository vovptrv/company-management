import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

import { getErrorMessage } from "../api/errors";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => navigate(from, { replace: true }),
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    signInMutation.mutate({ email, password });
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 420, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Sign in
      </Typography>
      <Typography sx={{ mb: 3, color: "text.secondary" }}>
        Browsing is open to everyone. Signing in lets you create, edit and delete records.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {signInMutation.error && (
            <Alert severity="error">{getErrorMessage(signInMutation.error)}</Alert>
          )}

          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button type="submit" variant="contained" size="large" loading={signInMutation.isPending}>
            Sign in
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
