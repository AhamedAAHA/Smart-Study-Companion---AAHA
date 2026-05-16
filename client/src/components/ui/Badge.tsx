import clsx from "clsx";

const variants = {
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  error: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  info: "bg-brand-100 text-brand-800 dark:bg-brand-950/50 dark:text-brand-300",
  neutral:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
