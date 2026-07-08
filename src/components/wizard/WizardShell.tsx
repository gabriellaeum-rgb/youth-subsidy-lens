'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ko } from '@/i18n/ko';
import type { Profile } from '@/types';
import {
  EDUCATION_OPTIONS,
  MAJOR_OPTIONS,
  MARITAL_OPTIONS,
  EMPLOYMENT_OPTIONS,
} from '@/types';
import {
  DEFAULT_WIZARD_DATA,
  clearProfileFromSession,
  clearWizardDraft,
  loadProfileFromSession,
  loadWizardDraft,
  saveProfileToSession,
  saveWizardDraft,
  serializeProfile,
  type WizardData,
} from '@/lib/profile';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Step1Region } from './Step1Region';
import { Step2Age } from './Step2Age';
import { SingleEnumStep } from './SingleEnumStep';
import { Step7Specialization } from './Step7Specialization';
import { Step8Income } from './Step8Income';
import { ResetConfirmModal } from './ResetConfirmModal';

const TITLE_ID = 'step-title';

export function WizardShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = Number.parseInt(searchParams.get('step') ?? '1', 10);
  const step = Number.isFinite(stepParam) && stepParam >= 1 && stepParam <= 8 ? stepParam : 1;

  const [data, setData] = React.useState<WizardData>(DEFAULT_WIZARD_DATA);
  const [hydrated, setHydrated] = React.useState(false);
  const [ageError, setAgeError] = React.useState<string | undefined>(undefined);
  const [sidoError, setSidoError] = React.useState<string | undefined>(undefined);
  const [resetOpen, setResetOpen] = React.useState(false);

  React.useEffect(() => {
    const draft = loadWizardDraft();
    const full = loadProfileFromSession();
    if (draft) {
      setData(draft);
    } else if (full) {
      setData({
        sido: full.region.sido,
        sigungu: full.region.sigungu,
        age: full.age,
        education: full.education,
        major: full.major,
        marital: full.marital,
        employment: full.employment,
        specialization: full.specialization,
        incomeManwon: full.incomeManwon,
      });
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => saveWizardDraft(data), 300);
    return () => clearTimeout(t);
  }, [data, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!Number.isFinite(stepParam) || stepParam < 1 || stepParam > 8) {
      router.replace('/onboarding?step=1');
      return;
    }
    if (step >= 2 && !data.sido) {
      router.replace('/onboarding?step=1');
      return;
    }
    if (step >= 3 && data.age === undefined) {
      router.replace('/onboarding?step=2');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, step, stepParam, data.sido, data.age]);

  function goTo(n: number) {
    router.push(`/onboarding?step=${n}`);
  }

  function handleNext() {
    if (step === 1) {
      if (!data.sido) {
        setSidoError(ko.wizard.step1.errorSido);
        return;
      }
      setSidoError(undefined);
      goTo(2);
      return;
    }
    if (step === 2) {
      if (data.age === undefined) {
        setAgeError(ko.wizard.step2.errorBlank);
        return;
      }
      if (data.age < 15 || data.age > 99) {
        setAgeError(ko.wizard.step2.errorRange);
        return;
      }
      setAgeError(undefined);
      goTo(3);
      return;
    }
    if (step < 8) {
      goTo(step + 1);
      return;
    }
    // step 8 — finish
    const profile: Profile = {
      region: { sido: data.sido!, sigungu: data.sigungu },
      age: data.age!,
      education: data.education,
      major: data.major,
      marital: data.marital,
      employment: data.employment,
      specialization: data.specialization,
      incomeManwon: data.incomeManwon,
    };
    saveProfileToSession(profile);
    clearWizardDraft();
    const sp = serializeProfile(profile);
    router.push(`/results?${sp.toString()}`);
  }

  function handleBack() {
    if (step > 1) goTo(step - 1);
  }

  function handleResetConfirm() {
    clearProfileFromSession();
    clearWizardDraft();
    setData(DEFAULT_WIZARD_DATA);
    setResetOpen(false);
    router.replace('/onboarding?step=1');
  }

  if (!hydrated) return null;

  const stepMeta = getStepMeta(step);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-20 bg-bg border-b border-ink-100">
        <div className="max-w-content mx-auto px-5 md:px-6 h-14 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-body text-ink-700 hover:text-ink-900 focus-visible:outline-none focus-visible:shadow-focus rounded-md -ml-2 px-2 py-1"
            >
              <ChevronLeft size={20} aria-hidden />
              {ko.wizard.back}
            </button>
          ) : (
            <span />
          )}
          <Button variant="link" onClick={() => setResetOpen(true)}>
            {ko.wizard.reset}
          </Button>
        </div>
        <div className="max-w-content mx-auto px-5 md:px-6 pb-3">
          <ProgressBar step={step} />
        </div>
      </div>

      <div className="flex-1 max-w-column mx-auto w-full px-5 md:px-0 py-6 flex flex-col gap-4">
        <div>
          <h1 id={TITLE_ID} className="text-h1 font-bold text-ink-900">
            {stepMeta.title}
          </h1>
          {stepMeta.hint && <p className="text-small text-ink-500 mt-1">{stepMeta.hint}</p>}
        </div>

        {step === 1 && (
          <>
            <Step1Region
              sido={data.sido}
              sigungu={data.sigungu}
              onChange={(sido, sigungu) => {
                setData((d) => ({ ...d, sido: sido || undefined, sigungu }));
                if (sido) setSidoError(undefined);
              }}
              error={sidoError}
            />
            <p className="text-small text-ink-500">{ko.wizard.privacyMicro}</p>
          </>
        )}
        {step === 2 && (
          <Step2Age
            value={data.age}
            onChange={(age) => {
              setData((d) => ({ ...d, age }));
              setAgeError(undefined);
            }}
            error={ageError}
          />
        )}
        {step === 3 && (
          <SingleEnumStep
            legendId={TITLE_ID}
            options={EDUCATION_OPTIONS}
            value={data.education}
            onChange={(education) => setData((d) => ({ ...d, education }))}
          />
        )}
        {step === 4 && (
          <SingleEnumStep
            legendId={TITLE_ID}
            options={MAJOR_OPTIONS}
            value={data.major}
            onChange={(major) => setData((d) => ({ ...d, major }))}
          />
        )}
        {step === 5 && (
          <SingleEnumStep
            legendId={TITLE_ID}
            options={MARITAL_OPTIONS}
            value={data.marital}
            onChange={(marital) => setData((d) => ({ ...d, marital }))}
          />
        )}
        {step === 6 && (
          <SingleEnumStep
            legendId={TITLE_ID}
            options={EMPLOYMENT_OPTIONS}
            value={data.employment}
            onChange={(employment) => setData((d) => ({ ...d, employment }))}
          />
        )}
        {step === 7 && (
          <Step7Specialization
            legendId={TITLE_ID}
            value={data.specialization}
            onChange={(specialization) => setData((d) => ({ ...d, specialization }))}
          />
        )}
        {step === 8 && (
          <Step8Income
            value={data.incomeManwon}
            onChange={(incomeManwon) => setData((d) => ({ ...d, incomeManwon }))}
          />
        )}
      </div>

      <div
        className="sticky bottom-0 px-5 md:px-6 pt-4 pb-4"
        style={{
          background: 'linear-gradient(180deg, transparent, var(--color-bg) 24px)',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="max-w-column mx-auto">
          <Button size="lg" fullWidth onClick={handleNext}>
            {step === 8 ? ko.wizard.finish : ko.wizard.next}
          </Button>
        </div>
      </div>

      <ResetConfirmModal open={resetOpen} onCancel={() => setResetOpen(false)} onConfirm={handleResetConfirm} />
    </div>
  );
}

function getStepMeta(step: number): { title: string; hint?: string } {
  switch (step) {
    case 1:
      return { title: ko.wizard.step1.title, hint: ko.wizard.step1.hint };
    case 2:
      return { title: ko.wizard.step2.title, hint: ko.wizard.step2.hint };
    case 3:
      return { title: ko.wizard.step3.title, hint: ko.wizard.step3.hint };
    case 4:
      return { title: ko.wizard.step4.title, hint: ko.wizard.step4.hint };
    case 5:
      return { title: ko.wizard.step5.title, hint: ko.wizard.step5.hint };
    case 6:
      return { title: ko.wizard.step6.title, hint: ko.wizard.step6.hint };
    case 7:
      return { title: ko.wizard.step7.title, hint: ko.wizard.step7.hint };
    case 8:
    default:
      return { title: ko.wizard.step8.title, hint: ko.wizard.step8.hint };
  }
}
