"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScrollAnimations } from "@/lib/scrollAnimations";

import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Walk mode needs native scroll + stable layout for audio UI */
function isWalkRoute(pathname: string): boolean {
  return pathname.startsWith("/walk");
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || isWalkRoute(pathname)) return;

    let lenis: Lenis | null = null;
    let onTick: ((time: number) => void) | null = null;

    try {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      onTick = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.refresh();
    } catch (err) {
      console.warn("Smooth scroll disabled:", err);
      lenis?.destroy();
      lenisRef.current = null;
    }

    return () => {
      if (onTick) gsap.ticker.remove(onTick);
      lenis?.destroy();
      lenisRef.current = null;
      ScrollTrigger.refresh();
    };
  }, [pathname]);

  useEffect(() => {
    if (isWalkRoute(pathname)) return;

    let cleanupAnimations = () => {};
    const t = window.setTimeout(() => {
      ScrollTrigger.refresh();
      cleanupAnimations = initScrollAnimations();
    }, 150);

    return () => {
      window.clearTimeout(t);
      cleanupAnimations();
    };
  }, [pathname]);

  return <>{children}</>;
}
