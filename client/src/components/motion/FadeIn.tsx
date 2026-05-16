"use client";

import { useEffect, useRef, ReactNode } from "react";
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  duration = 0.65,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const { x, y } = offsets[direction];

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        x,
        y,
        duration,
        delay,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
          once: true,
        },
      });
    }, el);

    const fallback = window.setTimeout(() => {
      gsap.set(el, { opacity: 1, x: 0, y: 0 });
    }, 2500);

    return () => {
      window.clearTimeout(fallback);
      ctx.revert();
    };
  }, [delay, direction, duration]);

  return (
    <div ref={ref} className={clsx(className)}>
      {children}
    </div>
  );
}
