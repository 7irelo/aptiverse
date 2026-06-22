"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export type Crumb = { label: string; href?: string };

export type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  meta?: React.ReactNode;
};

export function PageHeader({ title, description, breadcrumbs, actions, meta }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1.5, fontSize: "0.8125rem" }}
        >
          {breadcrumbs.map((c, i) =>
            c.href && i < breadcrumbs.length - 1 ? (
              <Link key={i} href={c.href} style={{ color: "inherit", opacity: 0.7 }}>
                {c.label}
              </Link>
            ) : (
              <Typography key={i} variant="body2" color="text.primary">
                {c.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" component="h1" sx={{ mb: description ? 0.75 : 0 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
              {description}
            </Typography>
          )}
          {meta && <Box sx={{ mt: 1.5 }}>{meta}</Box>}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1.25} alignItems="center" flexShrink={0}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
