import clsx from "clsx";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const styles = {
  error:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200",
  info: "border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-500/30 dark:bg-brand-950/30 dark:text-brand-200",
};

const icons = {
  error: AlertCircle,
  warning: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof styles;
  className?: string;
}) {
  const Icon = icons[variant];
  return (
    <div
      className={clsx(
        "flex gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm",
        styles[variant],
        className
      )}
      role="alert"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
