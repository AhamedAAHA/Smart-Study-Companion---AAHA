import { ScrollTrigger } from "gsap/ScrollTrigger";

export function safeScrollTriggerRefresh(): void {
  if (typeof window === "undefined") return;
  try {
    ScrollTrigger.refresh(true);
  } catch {
    /* ignore SecurityError during Lenis teardown */
  }
}
