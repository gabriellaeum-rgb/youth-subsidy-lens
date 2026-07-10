import Link from 'next/link';

/**
 * Design spec v4 §3.1: 56px fixed header, logo lockup image (left) + service name.
 * The source lockup PNG (docs/youthfundlens_logo.png) is a vertically-stacked
 * icon+wordmark at 1264x848 — unusable whole at a 32px header height (the wordmark
 * would be unreadably small), so this crops just the icon mark via object-position
 * math (icon bounding box ~[360,60]-[920,620] within the source) and pairs it with
 * a real text node for the name, which is legible at any size (§3.1's own fallback
 * rule, applied proactively rather than after an illegibility test).
 */
export function Header({ backHref }: { backHref?: string } = {}) {
  return (
    <header className="sticky top-0 z-[100] h-14 flex items-center gap-2 px-5 bg-white border-b border-[color:var(--color-border)]">
      {backHref ? (
        <Link href={backHref} className="text-sm text-ink-500 mr-1" aria-label="뒤로">
          &lt;
        </Link>
      ) : null}
      <Link href="/" className="flex items-center gap-2 min-w-0">
        <span
          aria-hidden
          style={{ width: 32, height: 32, overflow: 'hidden', position: 'relative', flexShrink: 0, borderRadius: 6 }}
        >
          <img
            src="/logo-lockup.png"
            alt=""
            style={{
              position: 'absolute',
              width: '72.23px',
              height: '48.46px',
              left: '-20.57px',
              top: '-3.43px',
              maxWidth: 'none',
            }}
          />
        </span>
        <span className="font-bold text-h3 text-ink-900 truncate" style={{ fontFamily: 'var(--font-sans)' }}>
          청년지원금렌즈
        </span>
      </Link>
    </header>
  );
}
