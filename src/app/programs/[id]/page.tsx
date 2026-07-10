import { Suspense } from 'react';
import type { Metadata } from 'next';
import benefitsList from '../../../../public/data/benefits_list.json';
import { ProgramDetailView } from '@/components/result/ProgramDetailView';

// Read once at module load (build time under output:'export') — reused by both
// generateStaticParams and generateMetadata instead of re-reading per page.
type ListRow = { id: string; name: string };
const rows = benefitsList as ListRow[];
const byId = new Map(rows.map((r) => [r.id, r]));

export function generateStaticParams() {
  return rows.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const row = byId.get(id);
  return { title: row ? `${row.name} · 청년지원금렌즈` : '청년지원금렌즈' };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <ProgramDetailView serviceId={id} />
    </Suspense>
  );
}
