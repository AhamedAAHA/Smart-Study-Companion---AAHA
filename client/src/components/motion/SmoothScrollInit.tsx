"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isWalkRoute(pathname: string): boolean {
  return pathname.startsWith("/walk");
}

/** Sets up Lenis + GSAP on the client only. Does not wrap children (SSR-safe). */
export function SmoothScrollInit() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.remove("lenis", "lenis-smooth");

    if (prefersReducedMotion() || isWalkRoute(pathname)) {
      return;
    }

    let cancelled = false;
    let lenis: import("lenis").default | null = null;
    let onTick: ((time: number) => void) | null = null;
    let unbindLenis: (() => void) | null = null;
    let cleanupScroll = () => {};
    let initTimer: number | undefined;

    void (async () => {
      try {
        const [{ default: Lenis }, gsapMod, stMod, { bindLenisToScrollTrigger }, scrollMod] =
          await Promise.all([
            import("lenis"),
            import("gsap"),
            import("gsap/ScrollTrigger"),
            import("@/lib/lenisScroll"),
            import("@/lib/scrollAnimations"),
          ]);

        if (cancelled) return;

        const gsap = gsapMod.default;
        const { ScrollTrigger } = stMod;
        gsap.registerPlugin(ScrollTrigger);

        lenis = new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1,
        });

        document.documentElement.classList.add("lenis", "lenis-smooth");
        unbindLenis = bindLenisToScrollTrigger(lenis);

        onTick = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        initTimer = window.setTimeout(() => {
          if (cancelled) return;
          cleanupScroll = scrollMod.initScrollAnimations();
          scrollMod.animatePageEnter(document.querySelector("main"));
        }, 80);
      } catch (err) {
        console.warn("Smooth scroll disabled:", err);
        lenis?.destroy();
        document.documentElement.classList.remove("lenis", "lenis-smooth");
      }
    })();

    return () => {
      cancelled = true;
      if (initTimer) window.clearTimeout(initTimer);
      cleanupScroll();
      if (onTick) {
        void import("gsap").then((m) => m.default.ticker.remove(onTick!));
      }
      unbindLenis?.();
      lenis?.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    };
  }, [pathname]);

  return null;
}
