'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ko } from '@/i18n/ko';
import type { Profile } from '@/types';
import {
  DEFAULT_WIZARD_DRAFT,
  clearWizardDraft,
  loadWizardDraft,
  saveProfileToSession,
  saveWizardDraft,
  type WizardDraft,
} from '@/lib/profile';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Header } from '@/components/layout/Header';
import { SidoStep, SigunguStep } from './steps/RegionSteps';
import { BirthYearStep, GenderStep } from './steps/BasicSteps';
import { HouseholdIncomeStep } from './steps/HouseholdIncomeStep';
import { FlagCheckboxGroup } from './FlagCheckboxGroup';
import { BusinessStep } from './steps/BusinessStep';
import { InterestsStep } from './steps/InterestsStep';
import { STATUS_OPTIONS, HOUSEHOLD_OPTIONS, PREGNANCY_OPTIONS } from '@/lib/onboardingOptions';

const STEP_ORDER = ['1', '1b', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
type Step = (typeof STEP_ORDER)[number];

const PROGRESS_N: Record<Step, number> = { '1': 1, '1b': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9 };
const BACK_TARGET: Record<Step, Step | null> = { '1': null, '1b': '1', '2': '1b', '3': '2', '4': '3', '5': '4', '6': '5', '7': '6', '8': '7', '9': '8' };

function nextStep(current: Step, draft: WizardDraft): Step {
  const idx = STEP_ORDER.indexOf(current);
  let n = idx + 1;
  while (n < STEP_ORDER.length) {
    const candidate = STEP_ORDER[n]!;
    if (candidate === '8' && !draft.statusFlags?.includes('business')) {
      n += 1;
      continue;
    }
    return candidate;
  }
  return '9';
}

function prevStep(current: Step, draft: WizardDraft): Step {
  let target = BACK_TARGET[current];
  if (target === '8' && !draft.statusFlags?.includes('business')) target = BACK_TARGET['8'];
  return target ?? '1';
}

export function OnboardingShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step') as Step | null;
  const step: Step = stepParam && STEP_ORDER.includes(stepParam) ? stepParam : '1';

  const [draft, setDraft] = React.useState<WizardDraft>(DEFAULT_WIZARD_DRAFT);
  const [hydrated, setHydrated] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    setDraft(loadWizardDraft());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => saveWizardDraft(draft), 300);
    return () => clearTimeout(t);
  }, [draft, hydrated]);

  function goTo(s: Step) {
    router.push(`/onboarding?step=${s}`);
  }

  function handleBack() {
    if (step === '1') {
      router.push('/');
      return;
    }
    goTo(prevStep(step, draft));
  }

  function finish() {
    const profile: Profile = {
      onboardingV: '5.0',
      region: { sido: draft.region!.sido, sigungu: draft.region!.sigungu ?? null },
      birthYear: draft.birthYear!,
      gender: draft.gender ?? 'undisclosed',
      householdSize: draft.householdSize ?? 1,
      incomeBracket: draft.incomeBracket ?? 'unknown',
      statusFlags: draft.statusFlags ?? [],
      householdFlags: draft.householdFlags ?? [],
      pregnancyFlags: draft.pregnancyFlags ?? [],
      business: draft.business ?? null,
      interests: draft.interests ?? [],
    };
    saveProfileToSession(profile);
    clearWizardDraft();
    router.push('/results');
  }

  function handleNext() {
    setError(undefined);
    if (step === '1' && !draft.region?.sido) {
      setError(ko.wizard.step1.errorSido);
      return;
    }
    if (step === '2' && !draft.birthYear) {
      return;
    }
    if ((step === '5' && !draft.statusFlags?.length) || (step === '6' && !draft.householdFlags?.length)) {
      return;
    }
    const n = nextStep(step, draft);
    if (step === '9') {
      finish();
      return;
    }
    goTo(n);
  }

  if (!hydrated) return null;

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <div className="flex items-center gap-3 px-5 py-3">
        <button type="button" onClick={handleBack} className="text-sm text-ink-700 shrink-0">
          {ko.wizard.back}
        </button>
        <div className="flex-1">
          <ProgressBar step={PROGRESS_N[step]} total={9} />
        </div>
      </div>

      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        {step === '1' && (
          <>
            <h1 className="text-h1 font-bold text-ink-900">{ko.wizard.step1.title}</h1>
            <p className="text-small text-ink-500 mt-2 mb-6">{ko.wizard.step1.hint}</p>
            <SidoStep
              value={draft.region?.sido ?? ''}
              onChange={(sido) => {
                setDraft((d) => ({ ...d, region: { sido, sigungu: null } }));
                setError(undefined);
                goTo('1b');
              }}
            />
            {error && <p className="text-small text-danger mt-2">{error}</p>}
            <p className="text-caption text-ink-500 mt-6">{ko.wizard.privacyMicro}</p>
          </>
        )}

        {step === '1b' && draft.region?.sido && (
          <SigunguStep
            sido={draft.region.sido}
            value={draft.region.sigungu ?? null}
            onChange={(sigungu) => setDraft((d) => ({ ...d, region: { sido: d.region!.sido, sigungu } }))}
            onBackToSido={() => goTo('1')}
          />
        )}

        {step === '2' && (
          <>
            <h1 className="text-h1 font-bold text-ink-900">{ko.wizard.step2.title}</h1>
            <p className="text-small text-ink-500 mt-2 mb-6">{ko.wizard.step2.hint}</p>
            <BirthYearStep value={draft.birthYear} onChange={(birthYear) => setDraft((d) => ({ ...d, birthYear }))} />
          </>
        )}

        {step === '3' && (
          <>
            <h1 className="text-h1 font-bold text-ink-900">{ko.wizard.step3.title}</h1>
            <p className="text-small text-ink-500 mt-2 mb-6">{ko.wizard.step3.hint}</p>
            <GenderStep value={draft.gender ?? 'undisclosed'} onChange={(gender) => setDraft((d) => ({ ...d, gender }))} />
          </>
        )}

        {step === '4' && (
          <HouseholdIncomeStep
            householdSize={draft.householdSize ?? 1}
            incomeBracket={draft.incomeBracket ?? 'unknown'}
            onHouseholdChange={(householdSize) => setDraft((d) => ({ ...d, householdSize }))}
            onIncomeChange={(incomeBracket) => setDraft((d) => ({ ...d, incomeBracket }))}
          />
        )}

        {step === '5' && (
          <>
            <h1 className="text-h1 font-bold text-ink-900 mb-6">{ko.wizard.step5.title}</h1>
            <FlagCheckboxGroup options={STATUS_OPTIONS} selected={draft.statusFlags ?? []} onChange={(statusFlags) => setDraft((d) => ({ ...d, statusFlags }))} />
          </>
        )}

        {step === '6' && (
          <>
            <h1 className="text-h1 font-bold text-ink-900 mb-6">{ko.wizard.step6.title}</h1>
            <FlagCheckboxGroup options={HOUSEHOLD_OPTIONS} selected={draft.householdFlags ?? []} onChange={(householdFlags) => setDraft((d) => ({ ...d, householdFlags }))} />
          </>
        )}

        {step === '7' && (
          <>
            <h1 className="text-h1 font-bold text-ink-900 mb-6">{ko.wizard.step7.title}</h1>
            <FlagCheckboxGroup options={PREGNANCY_OPTIONS} selected={draft.pregnancyFlags ?? []} onChange={(pregnancyFlags) => setDraft((d) => ({ ...d, pregnancyFlags }))} />
          </>
        )}

        {step === '8' && (
          <BusinessStep
            status={draft.business?.status ?? null}
            industry={draft.business?.industry ?? null}
            onChange={(status, industry) =>
              setDraft((d) => ({ ...d, business: status && industry ? { status, industry } : null }))
            }
          />
        )}

        {step === '9' && (
          <>
            <h1 className="text-h1 font-bold text-ink-900">{ko.wizard.step9.title}</h1>
            <p className="text-small text-ink-500 mt-2 mb-6">{ko.wizard.step9.hint}</p>
            <InterestsStep selected={draft.interests ?? []} onChange={(interests) => setDraft((d) => ({ ...d, interests }))} />
          </>
        )}
      </div>

      <div
        className="sticky bottom-0 px-5 pt-3 bg-white"
        style={{ boxShadow: 'var(--shadow-sticky-cta)', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <Button size="lg" fullWidth onClick={handleNext}>
          {step === '9' ? ko.wizard.finish : ko.wizard.next}
        </Button>
      </div>
    </div>
  );
}
