"use client";

import { usePathname } from "next/navigation";

export function PageMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main key={pathname} className="page-shell opacity-100">
      {children}
    </main>
  );
}
