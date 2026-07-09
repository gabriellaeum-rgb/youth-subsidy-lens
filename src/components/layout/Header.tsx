import Link from 'next/link';
import { ko } from '@/i18n/ko';

/**
 * Text logotype, not the gradient image lockup — verified empirically (design_spec_v3
 * §C's own fallback rule) that the raster wordmark is illegible at 32px header height.
 * The brand mark instead gets a small line-icon nod in the landing hero (LandingView).
 */
export function Header() {
  return (
    <header className="h-14 flex items-center px-5 md:px-6 max-w-content mx-auto w-full">
      <Link href="/" className="font-bold text-h3 text-ink-900">
        {ko.app.name}
      </Link>
    </header>
  );
}
