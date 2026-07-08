import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResultsView } from '@/components/result/ResultsView';

export const metadata: Metadata = {
  title: '청년지원금렌즈 · 결과 보기',
  description: '입력하신 프로필로 자격되는 정부 지원금 목록입니다.',
};

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsView />
    </Suspense>
  );
}
