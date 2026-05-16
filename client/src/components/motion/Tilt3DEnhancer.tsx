"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  TILT_3D_SELECTOR,
  applyTilt,
  findTiltTarget,
  prefersReducedMotion,
  resetTilt,
} from "@/lib/tilt3d";

function markTiltTargets(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>(TILT_3D_SELECTOR).forEach((el) => {
    if (el.closest(".glass-card-3d") || el.hasAttribute("data-tilt-skip")) return;
    el.classList.add("tilt-3d");
  });
}

export function Tilt3DEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    markTiltTargets();

    let active: HTMLElement | null = null;
    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;

    const flush = () => {
      raf = 0;
      if (active) applyTilt(active, pendingX, pendingY);
    };

    const onMove = (e: MouseEvent) => {
      const target = findTiltTarget(e.target);
      pendingX = e.clientX;
      pendingY = e.clientY;

      if (target !== active) {
        if (active) resetTilt(active);
        active = target;
      }

      if (!active) return;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const onLeave = () => {
      if (active) {
        resetTilt(active);
        active = null;
      }
      if (raf) cancelAnimationFrame(raf);
    };

    const observer = new MutationObserver(() => markTiltTargets());
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      observer.disconnect();
      if (active) resetTilt(active);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
