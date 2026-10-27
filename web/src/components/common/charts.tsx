"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * Chart wrappers over the shadcn chart (Recharts). Colours come from the
 * --chart-1 to --chart-5 tokens, which switch with prefers-color-scheme, so
 * every chart is correct in light and dark without any JavaScript.
 *
 * Each chart renders inside a <figure> with a visible title and a visually
 * hidden data table, so screen reader users get the numbers, not a picture.
 */

export type ChartSeries = {
  /** Key in each data row. */
  key: string;
  label: string;
  /** Token slot 1 to 5. Defaults to the series position. */
  tone?: 1 | 2 | 3 | 4 | 5;
};

type Datum = Record<string, string | number>;

function toConfig(series: ChartSeries[]): ChartConfig {
  return Object.fromEntries(
    series.map((s, index) => [
      s.key,
      { label: s.label, color: `var(--chart-${s.tone ?? (index % 5) + 1})` },
    ]),
  );
}

type FigureProps = {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  table: React.ReactNode;
};

function ChartFigure({
  title,
  description,
  className,
  children,
  table,
}: FigureProps) {
  return (
    <figure
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground",
        className,
      )}
    >
      <figcaption className="flex flex-col gap-0.5">
        <span className="text-base font-semibold">{title}</span>
        {description ? (
          <span className="text-sm text-muted-foreground">{description}</span>
        ) : null}
      </figcaption>
      <div aria-hidden="true">{children}</div>
      <div className="sr-only">{table}</div>
    </figure>
  );
}

function DataSummary({
  title,
  xKey,
  xLabel,
  series,
  data,
}: {
  title: string;
  xKey: string;
  xLabel: string;
  series: ChartSeries[];
  data: Datum[];
}) {
  return (
    <table>
      <caption>{title}</caption>
      <thead>
        <tr>
          <th scope="col">{xLabel}</th>
          {series.map((s) => (
            <th key={s.key} scope="col">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={String(row[xKey])}>
            <th scope="row">{row[xKey]}</th>
            {series.map((s) => (
              <td key={s.key}>{row[s.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type CartesianChartProps = {
  title: string;
  description?: string;
  data: Datum[];
  /** Key of the category axis, for example "week". */
  xKey: string;
  /** Header for the category column in the accessible table. */
  xLabel?: string;
  series: ChartSeries[];
  className?: string;
};

export function BarChart({
  title,
  description,
  data,
  xKey,
  xLabel = xKey,
  series,
  className,
}: CartesianChartProps) {
  return (
    <ChartFigure
      title={title}
      description={description}
      className={className}
      table={
        <DataSummary
          title={title}
          xKey={xKey}
          xLabel={xLabel}
          series={series}
          data={data}
        />
      }
    >
      <ChartContainer config={toConfig(series)} className="aspect-auto h-56">
        <RechartsBarChart data={data} margin={{ left: -16, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {series.length > 1 ? (
            <ChartLegend content={<ChartLegendContent />} />
          ) : null}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={`var(--color-${s.key})`}
              radius={4}
            />
          ))}
        </RechartsBarChart>
      </ChartContainer>
    </ChartFigure>
  );
}

export function LineChart({
  title,
  description,
  data,
  xKey,
  xLabel = xKey,
  series,
  className,
}: CartesianChartProps) {
  return (
    <ChartFigure
      title={title}
      description={description}
      className={className}
      table={
        <DataSummary
          title={title}
          xKey={xKey}
          xLabel={xLabel}
          series={series}
          data={data}
        />
      }
    >
      <ChartContainer config={toConfig(series)} className="aspect-auto h-56">
        <RechartsLineChart data={data} margin={{ left: -16, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {series.length > 1 ? (
            <ChartLegend content={<ChartLegendContent />} />
          ) : null}
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </RechartsLineChart>
      </ChartContainer>
    </ChartFigure>
  );
}

type DonutChartProps = {
  title: string;
  description?: string;
  /** One slice per entry. */
  slices: {
    key: string;
    label: string;
    value: number;
    tone?: ChartSeries["tone"];
  }[];
  className?: string;
};

export function DonutChart({
  title,
  description,
  slices,
  className,
}: DonutChartProps) {
  const config = toConfig(slices);
  const data = slices.map((slice) => ({
    key: slice.key,
    label: slice.label,
    value: slice.value,
  }));
  return (
    <ChartFigure
      title={title}
      description={description}
      className={className}
      table={
        <table>
          <caption>{title}</caption>
          <tbody>
            {slices.map((slice) => (
              <tr key={slice.key}>
                <th scope="row">{slice.label}</th>
                <td>{slice.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ChartContainer config={config} className="mx-auto aspect-square h-56">
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="key" hideLabel />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius="60%"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={`var(--color-${entry.key})`}
                className="stroke-card"
              />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="key" />} />
        </PieChart>
      </ChartContainer>
    </ChartFigure>
  );
}
