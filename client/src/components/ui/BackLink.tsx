import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

type BackLinkProps = {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
};

const baseClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-slate-100 hover:text-fg dark:hover:bg-slate-800/70";

export function BackLink({
  href,
  onClick,
  label = "Back",
  className,
}: BackLinkProps) {
  const classes = clsx(baseClass, className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
