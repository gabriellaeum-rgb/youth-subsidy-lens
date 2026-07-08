'use client';

import { ko } from '@/i18n/ko';
import { InputField } from '@/components/ui/Input';

type Props = {
  value?: number;
  onChange: (value: number | undefined) => void;
  error?: string;
};

export function Step2Age({ value, onChange, error }: Props) {
  const t = ko.wizard.step2;
  return (
    <InputField
      id="age-input"
      label={t.title}
      hideLabel
      error={error}
      unit={t.unit}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value ?? ''}
      onChange={(e) => {
        const digits = e.target.value.replace(/[^0-9]/g, '');
        onChange(digits === '' ? undefined : Number.parseInt(digits, 10));
      }}
    />
  );
}
