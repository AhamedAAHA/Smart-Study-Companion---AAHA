import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeInit } from "@/components/ThemeInit";
import { Navbar } from "@/components/Navbar";
import { PageBackground } from "@/components/PageBackground";
import { SmoothScrollInit } from "@/components/motion/SmoothScrollInit";
import { Tilt3DEnhancer } from "@/components/motion/Tilt3DEnhancer";

export const metadata: Metadata = {
  title: "Smart Study Companion | AI Learning for Sri Lankan Students",
  description:
    "Upload lecture slides, get cheat sheets, flashcards, Tamil explanations, mock viva, and ElevenLabs voice lessons.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-color="teal" suppressHydrationWarning>
      <head>
        <ThemeInit />
      </head>
      <body className="lio-app min-h-screen font-sans text-base">
        <ThemeProvider>
          <SmoothScrollInit />
          <Tilt3DEnhancer />
          <PageBackground />
          <AuthProvider>
            <Navbar />
            <main className="min-h-[50vh] opacity-100">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
