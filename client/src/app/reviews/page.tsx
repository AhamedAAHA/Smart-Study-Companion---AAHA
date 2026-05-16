import type { Metadata } from "next";
import { ReviewsPage } from "@/components/reviews/ReviewsPage";

export const metadata: Metadata = {
  title: "Student reviews | Smart Study Companion",
  description:
    "Read what Sri Lankan university students say about Smart Study Companion — cheat sheets, Tamil voice, and mock viva practice.",
};

export default function ReviewsRoutePage() {
  return <ReviewsPage />;
}
