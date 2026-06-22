"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";

export type EditTab = {
  /** stable key, used for tab value */
  key: string;
  label: React.ReactNode;
  icon?: React.ReactElement;
  /** Optional disabled flag (e.g. permission-gated tabs) */
  disabled?: boolean;
  /** The panel content rendered when this tab is active. */
  content: React.ReactNode;
};

export type EditWithTabsProps = {
  tabs: EditTab[];
  /** Controlled active tab key. If omitted, internal state is used. */
  active?: string;
  onChange?: (key: string) => void;
  /** Default active key when uncontrolled. Defaults to the first tab's key. */
  defaultTab?: string;
  /** Slot rendered above the tab strip (e.g. a back button, breadcrumb). */
  header?: React.ReactNode;
  /** Render the tab strip + panel inside a Card. Default true. */
  wrapInCard?: boolean;
};

// Edit-with-tabs layout — a tab strip pinned to the top of an edit area
// with one panel per tab. Each tab renders its own form / list / chart
// independently so they keep state across navigation within the page.
// Mirrors the Euphoria.v4 'edit with tabs' pattern (TextInput sections
// grouped by tab) for any resource-edit screen.
export function EditWithTabs({
  tabs,
  active,
  onChange,
  defaultTab,
  header,
  wrapInCard = true,
}: EditWithTabsProps) {
  const [internal, setInternal] = useState<string>(defaultTab ?? tabs[0]?.key ?? "");
  const value = active ?? internal;

  const handleChange = (_: unknown, next: string) => {
    if (active === undefined) setInternal(next);
    onChange?.(next);
  };

  const activeTab = tabs.find((t) => t.key === value) ?? tabs[0];

  const body = (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((t) => (
            <Tab
              key={t.key}
              value={t.key}
              label={t.label}
              icon={t.icon}
              iconPosition="start"
              disabled={t.disabled}
              sx={{ minHeight: 48, textTransform: "none", fontWeight: 500 }}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ p: { xs: 2, md: 3 } }}>{activeTab?.content}</Box>
    </>
  );

  return (
    <>
      {header}
      {wrapInCard ? <Card sx={{ overflow: "visible" }}>{body}</Card> : body}
    </>
  );
}
