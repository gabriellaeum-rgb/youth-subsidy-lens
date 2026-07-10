import Link from 'next/link';
import { ko } from '@/i18n/ko';

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center gap-4 px-5">
      <h1 className="text-h1 font-bold text-ink-900">{ko.emptyGlobal.notFoundTitle}</h1>
      <p className="text-body text-ink-500">{ko.emptyGlobal.notFoundSub}</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center min-h-12 px-5 rounded-md bg-primary text-primary-ink font-semibold hover:bg-primary-hover focus-visible:outline-none focus-visible:shadow-focus"
      >
        {ko.emptyGlobal.notFoundCta}
      </Link>
    </div>
  );
}
