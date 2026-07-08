/**
 * No-op unless NEXT_PUBLIC_ANALYTICS_ENABLED=true. No PII, no profile field values —
 * only interaction shape. Ships disabled by default.
 */
type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

const ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

export function track(event: string, payload?: AnalyticsPayload): void {
  if (!ENABLED) return;
  if (typeof window === 'undefined') return;
  // Intentionally no-op transport in MVP — wire a cookieless provider (Plausible/Umami)
  // here when CEO approves analytics (design spec §13).
  void event;
  void payload;
}
