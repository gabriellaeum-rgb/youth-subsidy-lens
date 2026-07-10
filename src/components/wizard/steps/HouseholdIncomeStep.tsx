'use client';

import { Chip } from '@/components/ui/Chip';
import { ko } from '@/i18n/ko';
import { incomeOptionsFor } from '@/lib/medianIncome';
import type { IncomeBracket } from '@/types';

export function HouseholdIncomeStep({
  householdSize,
  incomeBracket,
  onHouseholdChange,
  onIncomeChange,
}: {
  householdSize: number;
  incomeBracket: IncomeBracket;
  onHouseholdChange: (n: number) => void;
  onIncomeChange: (b: IncomeBracket) => void;
}) {
  const options = incomeOptionsFor(householdSize);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-bold text-ink-900 mb-3">{ko.wizard.step4.titleA}</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onHouseholdChange(Math.max(1, householdSize - 1))}
            className="w-12 h-12 rounded-md border border-ink-300 text-h2"
            aria-label="가족 수 줄이기"
          >
            −
          </button>
          <span className="text-h2 font-bold w-12 text-center">{householdSize >= 7 ? '7+' : householdSize}</span>
          <button
            type="button"
            onClick={() => onHouseholdChange(Math.min(7, householdSize + 1))}
            className="w-12 h-12 rounded-md border border-ink-300 text-h2"
            aria-label="가족 수 늘리기"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-h2 font-bold text-ink-900 mb-1">{ko.wizard.step4.titleB}</h2>
        <p className="text-small text-ink-500 mb-3">{ko.wizard.step4.hintB}</p>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={ko.wizard.step4.titleB}>
          {options.map((opt) => (
            <Chip key={opt.value} role="radio" selected={incomeBracket === opt.value} onClick={() => onIncomeChange(opt.value)} className="w-full justify-start !rounded-md text-left">
              {opt.label}
            </Chip>
          ))}
          <Chip role="radio" selected={incomeBracket === 'unknown'} onClick={() => onIncomeChange('unknown')} className="w-full justify-start !rounded-md">
            {ko.wizard.step4.unknownOption}
          </Chip>
        </div>
        {incomeBracket === 'unknown' && <p className="text-small text-ink-500 mt-2">{ko.wizard.step4.unknownBanner}</p>}
      </div>
    </div>
  );
}
