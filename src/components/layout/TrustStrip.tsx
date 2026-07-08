import { Lock, Clock, Glasses } from 'lucide-react';
import { ko } from '@/i18n/ko';

export function TrustStrip() {
  const items = [
    { icon: Lock, label: ko.landing.trust.login },
    { icon: Clock, label: ko.landing.trust.time },
    { icon: Glasses, label: ko.landing.trust.anon },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-small text-ink-500">
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <Icon size={16} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
