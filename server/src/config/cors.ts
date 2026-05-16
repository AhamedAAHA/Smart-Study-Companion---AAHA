import { env } from "./env";

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/** Netlify production + deploy-preview URLs */
const NETLIFY_ORIGIN =
  /^https:\/\/([a-z0-9][a-z0-9-]*--)?[a-z0-9][a-z0-9-]*\.netlify\.app$/i;

export function isAllowedOrigin(origin: string): boolean {
  const normalized = normalizeOrigin(origin);
  if (env.clientOrigins.includes(normalized)) return true;
  if (env.isProduction && NETLIFY_ORIGIN.test(normalized)) return true;
  if (
    !env.isProduction &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  ) {
    return true;
  }
  return false;
}

export function applyCorsHeaders(
  origin: string | undefined,
  setHeader: (name: string, value: string) => void
): void {
  if (!origin || !isAllowedOrigin(origin)) return;
  setHeader("Access-Control-Allow-Origin", origin);
  setHeader("Access-Control-Allow-Credentials", "true");
}
