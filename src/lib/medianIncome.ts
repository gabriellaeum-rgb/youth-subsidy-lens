import medianIncome2026 from '../../config/median_income_2026.json';
import type { IncomeBracket } from '@/types';

type Brackets = { p50: number; p75: number; p100: number; p200: number };

function bracketsFor(householdSize: number): Brackets {
  const clamped = Math.min(7, Math.max(1, householdSize));
  const base = (medianIncome2026.brackets as Record<string, Brackets>)[String(clamped)]!;
  if (householdSize <= 7) return base;
  const extra = medianIncome2026.extraPersonIncrement * (householdSize - 7);
  return {
    p50: base.p50 + Math.round(extra * 0.5),
    p75: base.p75 + Math.round(extra * 0.75),
    p100: base.p100 + extra,
    p200: base.p200 + extra * 2,
  };
}

function won(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

/** Dynamic income-bracket options for onboarding Q4-B, per household size (design spec §4.6). */
export function incomeOptionsFor(householdSize: number): { value: IncomeBracket; label: string }[] {
  const b = bracketsFor(householdSize);
  return [
    { value: '0-50', label: `0원 ~ ${won(b.p50)} (중위소득 0~50%)` },
    { value: '51-75', label: `${won(b.p50 + 1)} ~ ${won(b.p75)} (중위소득 51~75%)` },
    { value: '76-100', label: `${won(b.p75 + 1)} ~ ${won(b.p100)} (중위소득 76~100%)` },
    { value: '101-200', label: `${won(b.p100 + 1)} ~ ${won(b.p200)} (중위소득 101~200%)` },
    { value: '200+', label: `${won(b.p200 + 1)} 이상 (중위소득 200% 초과)` },
  ];
}
