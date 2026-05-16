"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { bindLenisToScrollTrigger } from "@/lib/lenisScroll";
import { animatePageEnter, initScrollAnimations } from "@/lib/scrollAnimations";

import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isWalkRoute(pathname: string): boolean {
  return pathname.startsWith("/walk");
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.remove("lenis", "lenis-smooth");

    if (prefersReducedMotion() || isWalkRoute(pathname)) {
      return;
    }

    let lenis: Lenis | null = null;
    let onTick: ((time: number) => void) | null = null;
    let unbindLenis: (() => void) | null = null;
    let cleanupScroll = () => {};
    let initTimer: number | undefined;

    try {
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
        cleanupScroll = initScrollAnimations();
        animatePageEnter(document.querySelector("main"));
      }, 80);
    } catch (err) {
      console.warn("Smooth scroll disabled:", err);
      lenis?.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    }

    return () => {
      if (initTimer) window.clearTimeout(initTimer);
      cleanupScroll();
      if (onTick) gsap.ticker.remove(onTick);
      unbindLenis?.();
      lenis?.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    };
  }, [pathname]);

  return <>{children}</>;
}
