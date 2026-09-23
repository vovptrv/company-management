import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, NavLink, Outlet } from "react-router";

const NAV_ITEMS = [
  { label: "Companies", path: "/companies" },
  { label: "Employees", path: "/employees" },
  { label: "Projects", path: "/projects" },
];

export default function Layout() {
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
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
