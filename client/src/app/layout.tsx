import type { Metadata } from "next";
import { Inter, Literata } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { PageBackground } from "@/components/PageBackground";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-display",
});

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
    <html
      lang="en"
      data-color="teal"
      className={`dark ${inter.variable} ${literata.variable}`}
      suppressHydrationWarning
    >
      <body className="lio-app min-h-screen font-sans">
        <ThemeProvider>
          <SmoothScrollProvider>
            <PageBackground />
            <AuthProvider>
              <Navbar />
              <main>{children}</main>
            </AuthProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
