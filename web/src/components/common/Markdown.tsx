"use client";

import dynamic from "next/dynamic";
import Skeleton from "@mui/material/Skeleton";

// react-markdown + remark-gfm + remark-math + rehype-katex + the KaTeX
// stylesheet are a large, purely presentational bundle that only the AI tutor
// transcript ever needs. Keep it out of every route's first-load JS and load it
// on the client the moment a rendered reply first appears. A two-line skeleton
// stands in for the beat before the chunk lands.
const LazyMarkdown = dynamic(
  () => import("./Markdown.impl").then((m) => m.Markdown),
  {
    ssr: false,
    loading: () => (
      <>
        <Skeleton width="90%" />
        <Skeleton width="70%" />
      </>
    ),
  },
);

export function Markdown({ children }: { children: string }) {
  return <LazyMarkdown>{children}</LazyMarkdown>;
}
