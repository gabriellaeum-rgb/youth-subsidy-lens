import { Suspense } from 'react';
import type { Metadata } from 'next';
import programsData from '../../../../public/data/programs.json';
import { ProgramDetailView } from '@/components/result/ProgramDetailView';

type ProgramRow = { id: string; 사업명: string };

export function generateStaticParams() {
  return (programsData as ProgramRow[]).map((p) => ({ programId: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programId: string }>;
}): Promise<Metadata> {
  const { programId } = await params;
  const program = (programsData as ProgramRow[]).find((p) => p.id === programId);
  return {
    title: program ? `${program.사업명} · 청년지원금렌즈` : '청년지원금렌즈',
  };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  return (
    <Suspense fallback={null}>
      <ProgramDetailView programId={programId} />
    </Suspense>
  );
}
