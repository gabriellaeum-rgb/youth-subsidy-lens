import { Suspense } from 'react';
import type { Metadata } from 'next';
import { WizardShell } from '@/components/wizard/WizardShell';

export const metadata: Metadata = {
  title: '청년지원금렌즈 · 프로필 입력',
  description: '8가지 프로필을 입력하면 자격되는 정부 지원금을 찾아드려요.',
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <WizardShell />
    </Suspense>
  );
}
