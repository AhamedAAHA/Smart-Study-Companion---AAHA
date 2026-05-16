import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { safeScrollTriggerRefresh } from "./scrollTriggerSafe";

gsap.registerPlugin(ScrollTrigger);

const REVEAL_SELECTOR = [
  "[data-scroll]",
  ".scroll-reveal",
  "main h1",
  "main h2",
  "main section",
  "main .card",
  "main .widget-card",
  "main .page-shell",
].join(",");

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initScrollAnimations(): () => void {
  if (prefersReducedMotion()) return () => {};

  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>(REVEAL_SELECTOR).forEach((el, i) => {
      if (el.closest("[data-scroll-skip]")) return;
      if (el.closest(".glass-card-3d")) return;

      const stagger = Math.min((i % 10) * 0.04, 0.4);

      gsap.fromTo(
        el,
        { y: 36, autoAlpha: 0, immediateRender: false },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          delay: stagger,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    });

    safeScrollTriggerRefresh();
  });

  return () => ctx.revert();
}

export function animatePageEnter(main: HTMLElement | null): void {
  if (!main || prefersReducedMotion()) return;

  gsap.fromTo(
    main,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: "power3.out",
      clearProps: "transform",
    }
  );
}
