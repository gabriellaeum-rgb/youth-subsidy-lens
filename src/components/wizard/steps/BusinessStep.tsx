'use client';

import { Chip } from '@/components/ui/Chip';
import { ko } from '@/i18n/ko';
import { BUSINESS_STATUS_OPTIONS, BUSINESS_INDUSTRY_OPTIONS } from '@/lib/onboardingOptions';
import type { BusinessIndustry, BusinessStatus } from '@/types';

export function BusinessStep({
  status,
  industry,
  onChange,
}: {
  status: BusinessStatus | null;
  industry: BusinessIndustry | null;
  onChange: (status: BusinessStatus | null, industry: BusinessIndustry | null) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-bold text-ink-900 mb-3">{ko.wizard.step8.titleStatus}</h2>
        <div className="flex flex-col gap-2" role="radiogroup">
          {BUSINESS_STATUS_OPTIONS.map((opt) => (
            <Chip key={opt.value} role="radio" selected={status === opt.value} onClick={() => onChange(opt.value, industry)} className="w-full justify-start !rounded-md">
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-h2 font-bold text-ink-900 mb-3">{ko.wizard.step8.titleIndustry}</h2>
        <div className="flex flex-col gap-2" role="radiogroup">
          {BUSINESS_INDUSTRY_OPTIONS.map((opt) => (
            <Chip key={opt.value} role="radio" selected={industry === opt.value} onClick={() => onChange(status, opt.value)} className="w-full justify-start !rounded-md">
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
