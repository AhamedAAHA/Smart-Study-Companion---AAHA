"use client";

import { useEffect, useRef, ReactNode } from "react";
import clsx from "clsx";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
};

const offsets = {
  up: { y: 32, x: 0 },
  down: { y: -32, x: 0 },
  left: { x: 28, y: 0 },
  right: { x: -28, y: 0 },
  none: { x: 0, y: 0 },
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.7,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    void (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (cancelled || !ref.current) return;

      const { x, y } = offsets[direction];

      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, x, y, immediateRender: false },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration,
            delay,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [delay, direction, duration]);

  return (
    <div ref={ref} className={clsx("scroll-reveal opacity-100", className)}>
      {children}
    </div>
  );
}
