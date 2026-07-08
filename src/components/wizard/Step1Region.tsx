'use client';

import * as React from 'react';
import { ko } from '@/i18n/ko';
import { SIDO_LIST, SIDO_SHORT, SIGUNGU_BY_SIDO, type Sido } from '@/lib/regions';
import { Chip } from '@/components/ui/Chip';
import { X } from 'lucide-react';

type Props = {
  sido?: string;
  sigungu?: string;
  onChange: (sido: string, sigungu: string | undefined) => void;
  error?: string;
};

export function Step1Region({ sido, sigungu, onChange, error }: Props) {
  const [sidoQuery, setSidoQuery] = React.useState('');
  const [sigunguQuery, setSigunguQuery] = React.useState('');
  const t = ko.wizard.step1;

  const filteredSido = SIDO_LIST.filter(
    (s) => s.includes(sidoQuery) || SIDO_SHORT[s].includes(sidoQuery),
  );
  const sigunguOptions = sido ? SIGUNGU_BY_SIDO[sido as Sido] ?? [] : [];
  const filteredSigungu = sigunguOptions.filter((s) => s.includes(sigunguQuery));

  if (sido) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-pill bg-primary-tint text-primary px-4 py-2 text-body font-semibold">
            {SIDO_SHORT[sido as Sido] ?? sido} · 시/군/구 선택
            <button
              type="button"
              aria-label="시/도 다시 선택"
              onClick={() => onChange('', undefined)}
              className="focus-visible:outline-none focus-visible:shadow-focus rounded-full"
            >
              <X size={16} />
            </button>
          </span>
        </div>
        <div aria-live="polite" className="sr-only">
          {t.ariaSidoSelected(SIDO_SHORT[sido as Sido] ?? sido)}
        </div>
        {sigunguOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={sigunguQuery}
              onChange={(e) => setSigunguQuery(e.target.value)}
              placeholder={t.searchSigungu}
              className="w-full min-h-[44px] rounded-md border border-ink-300 px-4 text-body focus:outline-none focus:border-primary focus:shadow-focus"
            />
            <div role="radiogroup" aria-label="시/군/구 (선택)" className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {filteredSigungu.map((sg) => (
                <Chip key={sg} role="radio" selected={sigungu === sg} onClick={() => onChange(sido, sg)}>
                  {sg}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={sidoQuery}
        onChange={(e) => setSidoQuery(e.target.value)}
        placeholder={t.searchSido}
        className="w-full min-h-[44px] rounded-md border border-ink-300 px-4 text-body focus:outline-none focus:border-primary focus:shadow-focus"
      />
      <div role="radiogroup" aria-label={t.title} className="flex flex-wrap gap-2">
        {filteredSido.map((s) => (
          <Chip key={s} role="radio" selected={false} onClick={() => onChange(s, undefined)}>
            {SIDO_SHORT[s]}
          </Chip>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-small text-danger mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
