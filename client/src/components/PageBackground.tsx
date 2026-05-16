"use client";

export function PageBackground() {
  return (
    <div
      aria-hidden
      className="lio-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="lio-bg-grid" />
      <div className="lio-bg-glow lio-bg-glow-1" />
      <div className="lio-bg-glow lio-bg-glow-2" />
      <div className="lio-bg-glow lio-bg-glow-3" />
      <div className="lio-bg-vignette" />
    </div>
  );
}
