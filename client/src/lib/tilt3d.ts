export const TILT_3D_SELECTOR = [
  ".card",
  ".card-interactive",
  ".landing-feature-card",
  ".study-tool-card",
  ".landing-cta-panel",
  ".section-glass",
  ".widget-card",
  ".result-panel",
  "main .card",
  "main .widget-card",
  "main .section-glass",
  "main .study-tool-card",
  "main .result-panel",
  "main .glass-panel",
  ".auth-card",
  ".dashboard-stat",
].join(",");

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function applyTilt(
  el: HTMLElement,
  clientX: number,
  clientY: number,
  intensity = 9
): void {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const x = (clientX - rect.left) / rect.width - 0.5;
  const y = (clientY - rect.top) / rect.height - 0.5;
  const rotateX = (-y * intensity).toFixed(2);
  const rotateY = (x * intensity).toFixed(2);

  el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.012)`;
}

export function resetTilt(el: HTMLElement): void {
  el.style.transform = "";
}

export function findTiltTarget(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const hit = node.closest(TILT_3D_SELECTOR);
  if (!hit || !(hit instanceof HTMLElement)) return null;
  if (hit.classList.contains("glass-card-3d") || hit.closest(".glass-card-3d")) {
    return null;
  }
  if (hit.hasAttribute("data-tilt-skip")) return null;
  return hit;
}
