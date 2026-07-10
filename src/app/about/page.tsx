import type { Metadata } from 'next';
import Link from 'next/link';
import { ko } from '@/i18n/ko';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: '청년지원금렌즈 · 이 서비스에 대해',
  description: ko.about.intro,
};

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <div className="max-w-column mx-auto w-full px-5 py-6 flex flex-col gap-8">
        <Link href="/" className="text-body text-ink-700 hover:text-ink-900 font-medium w-fit">
          {ko.about.homeLink}
        </Link>

        <div>
          <h1 className="text-h1 font-bold text-ink-900 mb-3">{ko.about.title}</h1>
          <p className="text-body text-ink-700 leading-relaxed">{ko.about.intro}</p>
        </div>

        <div id="data">
          <h2 className="text-h2 font-bold text-ink-900 mb-2">{ko.about.dataH2}</h2>
          <p className="text-body text-ink-700 leading-relaxed">{ko.about.dataBody}</p>
        </div>

        <div>
          <h2 className="text-h2 font-bold text-ink-900 mb-2">{ko.about.methodH2}</h2>
          <p className="text-body text-ink-700 leading-relaxed">{ko.about.methodBody}</p>
        </div>

        <div>
          <h2 className="text-h2 font-bold text-ink-900 mb-2">{ko.about.notH2}</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-body text-ink-700">
            {ko.about.notBullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        <div id="feedback">
          <h2 className="text-h2 font-bold text-ink-900 mb-2">{ko.about.feedbackH2}</h2>
          <p className="text-body text-ink-700 leading-relaxed mb-3">{ko.about.feedbackBody}</p>
          <a
            href="mailto:feedback@youthfundlens.kr"
            className="text-primary font-medium hover:underline"
          >
            {ko.about.feedbackLinkLabel}
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
