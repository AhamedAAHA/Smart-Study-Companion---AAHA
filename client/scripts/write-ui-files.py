from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

PageBackground = '''"use client";

export function PageBackground() {
  return (
    <motion-safe
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <span className="mesh-blob mesh-blob-1" />
      <span className="mesh-blob mesh-blob-2" />
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(248,250,252,0.85))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,0.9))]" />
    </motion-safe>
  );
}
'''.replace("motion-safe", "div")

(ROOT / "components" / "PageBackground.tsx").write_text(PageBackground, encoding="utf-8")
print("written")
