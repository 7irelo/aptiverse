import { cn } from "@/lib/utils";

const tones = {
  primary: "stroke-primary",
  citron: "stroke-citron-surface",
  success: "stroke-success",
  warning: "stroke-warning",
  achievement: "stroke-achievement",
  wellbeing: "stroke-wellbeing",
} as const;

type ProgressRingProps = {
  /** Progress from 0 to max. Values outside the range are clamped. */
  value: number;
  max?: number;
  /** Accessible name, for example "Mathematics mastery". */
  label: string;
  /** Diameter in pixels. */
  size?: number;
  strokeWidth?: number;
  tone?: keyof typeof tones;
  /** Text in the middle. Defaults to the rounded percentage. */
  centerLabel?: string;
  className?: string;
};

/**
 * Circular progress drawn in SVG. Exposed to assistive tech as a progressbar
 * with its value, so the visual ring is purely decorative.
 */
export function ProgressRing({
  value,
  max = 100,
  label,
  size = 72,
  strokeWidth = 8,
  tone = "primary",
  centerLabel,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? Math.round((clamped / max) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={`${percent}%`}
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            tones[tone],
            "transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none",
          )}
        />
      </svg>
      <span
        aria-hidden="true"
        className="absolute text-sm font-semibold tabular-nums"
      >
        {centerLabel ?? `${percent}%`}
      </span>
    </div>
  );
}
