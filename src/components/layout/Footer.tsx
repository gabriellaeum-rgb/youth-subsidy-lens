import Link from 'next/link';
import { ko } from '@/i18n/ko';

export function Footer() {
  return (
    <footer className="mt-4" style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
      <p className="text-xs text-ink-500 px-5 mb-3">{ko.landing.disclaimer}</p>
      <nav aria-label="footer" className="px-5 flex flex-wrap gap-4 text-xs text-ink-500">
        <Link href="/about" className="hover:text-ink-700 hover:underline">
          {ko.footer.methodology}
        </Link>
        <Link href="/about#data" className="hover:text-ink-700 hover:underline">
          {ko.footer.dataSource}
        </Link>
        <Link href="/about#feedback" className="hover:text-ink-700 hover:underline">
          {ko.footer.feedback}
        </Link>
      </nav>
    </footer>
  );
}
