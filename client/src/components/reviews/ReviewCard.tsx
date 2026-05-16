import type { Review } from "@/lib/demoReviews";
import { StarRating } from "./StarRating";

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ReviewCard({ review }: { review: Review }) {
  const initials = review.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="card card-interactive flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-semibold text-white"
            aria-hidden
          >
            {initials}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-fg">{review.name}</h3>
            <p className="truncate text-xs text-fg-muted">
              {review.university} · {review.course}
            </p>
          </div>
        </div>
        <time className="shrink-0 text-xs text-fg-muted" dateTime={review.date}>
          {formatReviewDate(review.date)}
        </time>
      </div>

      <StarRating value={review.rating} className="mt-4" />

      <h4 className="mt-3 font-semibold text-fg">{review.title}</h4>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{review.body}</p>
    </article>
  );
}

