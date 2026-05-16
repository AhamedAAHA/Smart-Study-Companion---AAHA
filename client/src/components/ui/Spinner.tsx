import clsx from "clsx";

export function Spinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-10 w-10 border-[3px]",
  };

  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-brand-500 border-t-transparent",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
