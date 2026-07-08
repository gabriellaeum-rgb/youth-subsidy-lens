import Link from 'next/link';
import { ko } from '@/i18n/ko';

export function Footer() {
  return (
    <footer className="border-t border-ink-100 mt-8">
      <nav
        aria-label="footer"
        className="max-w-content mx-auto px-5 md:px-6 py-6 flex flex-wrap gap-4 text-small text-ink-500"
      >
        <Link href="/about" className="hover:text-ink-700 hover:underline">
          {ko.footer.method}
        </Link>
        <Link href="/about#data" className="hover:text-ink-700 hover:underline">
          {ko.footer.data}
        </Link>
        <Link href="/about#feedback" className="hover:text-ink-700 hover:underline">
          {ko.footer.feedback}
        </Link>
      </nav>
    </footer>
  );
}
