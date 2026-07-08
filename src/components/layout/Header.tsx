import Link from 'next/link';
import { ko } from '@/i18n/ko';

export function Header() {
  return (
    <header className="h-14 flex items-center px-5 md:px-6 max-w-content mx-auto w-full">
      <Link href="/" className="font-bold text-h3 text-ink-900">
        {ko.app.name}
      </Link>
    </header>
  );
}
