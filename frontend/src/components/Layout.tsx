import LogoutIcon from "@mui/icons-material/Logout";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { Link, NavLink, Outlet, useLocation } from "react-router";

import { useAuth } from "../auth/AuthContext";

const NAV_ITEMS = [
  { label: "Companies", path: "/companies" },
  { label: "Employees", path: "/employees" },
  { label: "Projects", path: "/projects" },
];

export default function Layout() {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ mr: 4, color: "inherit", textDecoration: "none" }}
          >
            Company Management
          </Typography>

          <Box component="nav" sx={{ display: "flex", gap: 1 }}>
            {NAV_ITEMS.map(({ label, path }) => (
              <Button
                key={path}
                component={NavLink}
                to={path}
                color="inherit"
                sx={{ "&.active": { backgroundColor: "rgba(255, 255, 255, 0.16)" } }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isLoading &&
            (user ? (
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Typography variant="body2">{user.email}</Typography>
                <Button color="inherit" startIcon={<LogoutIcon />} onClick={signOut}>
                  Sign out
                </Button>
              </Stack>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/login"
                state={{ from: location.pathname + location.search }}
              >
                Sign in
              </Button>
            ))}
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
