"use client";

import { Star } from "lucide-react";
import clsx from "clsx";

type StarRatingProps = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
};

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const iconClass = sizeMap[size];

  return (
    <div
      className={clsx("inline-flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Rating" : `${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(value);

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange?.(starValue)}
              className="rounded p-0.5 text-amber-400 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              <Star
                className={clsx(
                  iconClass,
                  filled ? "fill-amber-400" : "fill-transparent opacity-40"
                )}
              />
            </button>
          );
        }

        return (
          <Star
            key={starValue}
            className={clsx(
              iconClass,
              filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300 dark:text-slate-600"
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

