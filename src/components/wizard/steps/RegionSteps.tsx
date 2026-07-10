'use client';

import * as React from 'react';
import { SIDO_LIST, SIGUNGU_BY_SIDO } from '@/lib/regions';
import { Chip } from '@/components/ui/Chip';
import { ko } from '@/i18n/ko';

export function SidoStep({ value, onChange }: { value: string; onChange: (sido: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={ko.wizard.step1.title}>
      {SIDO_LIST.map((sido) => (
        <Chip key={sido} role="radio" selected={value === sido} onClick={() => onChange(sido)} className="justify-center px-2">
          {sido}
        </Chip>
      ))}
    </div>
  );
}

export function SigunguStep({
  sido,
  value,
  onChange,
  onBackToSido,
}: {
  sido: string;
  value: string | null;
  onChange: (sigungu: string | null) => void;
  onBackToSido: () => void;
}) {
  const [query, setQuery] = React.useState('');
  const all = SIGUNGU_BY_SIDO[sido as keyof typeof SIGUNGU_BY_SIDO] ?? [];
  const filtered = query ? all.filter((s) => s.includes(query)) : all;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Chip role="checkbox" selected onClick={onBackToSido}>
          {sido} · 시/군/구 선택 ✕
        </Chip>
      </div>
      {all.length > 0 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ko.wizard.step1b.searchPlaceholder}
          className="h-11 px-4 rounded-md border border-ink-300 text-body"
          style={{ fontSize: 16 }}
        />
      )}
      {all.length > 0 && filtered.length === 0 && (
        <p className="text-body text-ink-500 text-center py-4">{ko.wizard.step1b.emptyResult(query)}</p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {filtered.map((sg) => (
          <Chip key={sg} role="radio" selected={value === sg} onClick={() => onChange(value === sg ? null : sg)} className="justify-center px-2 text-sm">
            {sg}
          </Chip>
        ))}
      </div>
      <button type="button" onClick={() => onChange(null)} className="text-small text-primary text-center mt-2">
        {ko.wizard.step1b.skipLink}
      </button>
    </div>
  );
}
