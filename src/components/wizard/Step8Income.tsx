'use client';

import { ko } from '@/i18n/ko';
import { InputField } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';

type Props = {
  value?: number;
  onChange: (value: number | undefined) => void;
};

export function Step8Income({ value, onChange }: Props) {
  const t = ko.wizard.step8;
  const idkSelected = value === undefined;

  return (
    <div className="flex flex-col gap-3">
      <InputField
        id="income-input"
        label={t.title}
        hideLabel
        unit={t.unit}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={idkSelected}
        value={value ?? ''}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, '');
          onChange(digits === '' ? undefined : Number.parseInt(digits, 10));
        }}
      />
      <div role="radiogroup" aria-label={t.idk} className="flex flex-wrap gap-2">
        <Chip role="radio" selected={idkSelected} onClick={() => onChange(undefined)}>
          {t.idk}
        </Chip>
      </div>
    </div>
  );
}
