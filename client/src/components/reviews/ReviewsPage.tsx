"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquareQuote } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  DEMO_REVIEWS,
  averageRating,
  type Review,
} from "@/lib/demoReviews";
import { ReviewCard } from "./ReviewCard";
import { StarRating } from "./StarRating";

function newReviewId() {
  return `user-${Date.now()}`;
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const avg = useMemo(() => averageRating(reviews), [reviews]);
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !body.trim()) return;

    const entry: Review = {
      id: newReviewId(),
      name: name.trim(),
      university: "Student",
      course: "Smart Study Companion",
      rating,
      title: title.trim(),
      body: body.trim(),
      date: new Date().toISOString().slice(0, 10),
    };

    setReviews((prev) => [entry, ...prev]);
    setName("");
    setTitle("");
    setBody("");
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="page-shell py-6 sm:py-10">
      <BackLink href="/" label="Back to home" className="mb-6" />

      <header className="mb-10 max-w-2xl">
        <FadeIn>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
            Student reviews
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-fg sm:text-4xl">
            What students say
          </h1>
          <p className="mt-3 text-base leading-relaxed text-fg-muted">
            Real feedback from Sri Lankan university students using Smart Study
            Companion for exams, Tamil voice, and mock viva practice.
          </p>
        </FadeIn>
      </header>

      <FadeIn>
        <div className="card mb-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              <MessageSquareQuote className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <p className="font-display text-4xl font-bold text-fg">{avg}</p>
              <StarRating value={avg} size="lg" className="mt-1" />
              <p className="mt-1 text-sm text-fg-muted">
                Based on {reviews.length} reviews · {fiveStarCount} five-star
              </p>
            </div>
          </div>
          <Link href="/signup" className="btn-primary shrink-0 gap-2">
            Try it free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-[1fr,minmax(280px,340px)] lg:items-start">
        <section aria-labelledby="reviews-list-heading">
          <h2 id="reviews-list-heading" className="sr-only">
            All reviews
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {reviews.map((review, i) => (
              <li key={review.id} className="h-full">
                <FadeIn delay={Math.min(i * 0.04, 0.24)} className="h-full">
                  <ReviewCard review={review} />
                </FadeIn>
              </li>
            ))}
          </ul>
        </section>

        <aside className="lg:sticky lg:top-24">
          <FadeIn delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="card space-y-4 p-5 sm:p-6"
              aria-labelledby="write-review-heading"
            >
              <h2
                id="write-review-heading"
                className="font-display text-lg font-bold text-fg"
              >
                Write a review
              </h2>
              <p className="text-sm text-fg-muted">
                Share your experience — demo reviews stay on this page in your
                browser session.
              </p>

              <label className="block text-sm font-medium text-fg">
                Your rating
                <StarRating
                  value={rating}
                  interactive
                  onChange={setRating}
                  className="mt-2"
                />
              </label>

              <label className="block text-sm font-medium text-fg">
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input mt-1.5 w-full"
                  placeholder="Your name"
                  required
                  maxLength={80}
                />
              </label>

              <label className="block text-sm font-medium text-fg">
                Headline
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input mt-1.5 w-full"
                  placeholder="Summarize your experience"
                  required
                  maxLength={120}
                />
              </label>

              <label className="block text-sm font-medium text-fg">
                Review
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="input mt-1.5 min-h-[120px] w-full resize-y"
                  placeholder="What helped you most?"
                  required
                  maxLength={800}
                />
              </label>

              {submitted && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
                  Thanks — your review was added above.
                </p>
              )}

              <button type="submit" className="btn-primary w-full">
                Post review
              </button>
            </form>
          </FadeIn>
        </aside>
      </div>
    </div>
  );
}
