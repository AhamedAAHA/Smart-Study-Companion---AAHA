import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Only explicitly marked elements — never auto-hide page shells */
const REVEAL_SELECTOR = "[data-scroll], .scroll-reveal";

export function initScrollAnimations(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>(REVEAL_SELECTOR).forEach((el, i) => {
      if (el.closest("[data-scroll-skip]")) return;

      const stagger = Math.min((i % 8) * 0.05, 0.35);

      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.75,
        delay: stagger,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none none",
          once: true,
        },
      });
    });

    ScrollTrigger.refresh();
  });

  return () => ctx.revert();
}
