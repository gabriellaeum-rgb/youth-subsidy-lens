'use client';

import * as React from 'react';
import { ko } from '@/i18n/ko';
import { SPECIALIZATION_OPTIONS, type Specialization } from '@/types';
import { Chip } from '@/components/ui/Chip';
import { useExclusiveMultiSelect } from '@/lib/useExclusiveMultiSelect';

type Props = {
  legendId: string;
  value: Specialization[];
  onChange: (v: Specialization[]) => void;
};

export function Step7Specialization({ legendId, value, onChange }: Props) {
  const [selected, toggle] = useExclusiveMultiSelect<Specialization>(value, '제한없음');

  React.useEffect(() => {
    onChange(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-labelledby={legendId} className="flex flex-wrap gap-2">
        {SPECIALIZATION_OPTIONS.map((opt) => (
          <Chip key={opt} role="checkbox" showCheck selected={selected.includes(opt)} onClick={() => toggle(opt)}>
            {opt}
          </Chip>
        ))}
      </div>
      <p className="text-small text-ink-500">{ko.wizard.privacyMicroSpec}</p>
    </div>
  );
}
