import { ko } from '@/i18n/ko';

export function DisclaimerStrip() {
  return (
    <p className="text-small text-ink-500 leading-relaxed max-w-column mx-auto text-center">
      {ko.landing.disclaimer}
    </p>
  );
}
