'use client';

import * as React from 'react';
import type { Benefit, BenefitDetail } from '@/types';
import { setJaCols } from '@/lib/matching';

type BenefitsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; benefits: Benefit[] };

let cache: Benefit[] | null = null;
let cachePromise: Promise<Benefit[]> | null = null;
let shardCount = 24; // overwritten from _meta.json; matches scripts/build-dataset.mjs SHARD_COUNT

async function loadDataset(): Promise<Benefit[]> {
  if (cache) return cache;
  if (!cachePromise) {
    cachePromise = (async () => {
      const [listRes, metaRes] = await Promise.all([
        fetch('/data/benefits_list.json'),
        fetch('/data/_meta.json'),
      ]);
      if (!listRes.ok || !metaRes.ok) throw new Error('dataset fetch failed');
      const [list, meta] = await Promise.all([listRes.json(), metaRes.json()]);
      setJaCols(meta.jaCols as string[]);
      if (typeof meta.shardCount === 'number') shardCount = meta.shardCount;
      cache = list as Benefit[];
      return cache;
    })();
  }
  return cachePromise;
}

// Must mirror scripts/build-dataset.mjs `shardFor()` exactly (same hash, same modulus).
function shardFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % shardCount;
}

const shardCache = new Map<number, Promise<Record<string, BenefitDetail>>>();

async function loadShard(n: number): Promise<Record<string, BenefitDetail>> {
  if (!shardCache.has(n)) {
    shardCache.set(
      n,
      fetch(`/data/detail-shard-${n}.json`).then((res) => {
        if (!res.ok) throw new Error('shard fetch failed');
        return res.json();
      }),
    );
  }
  return shardCache.get(n)!;
}

/** Loads public/data/benefits_list.json once (module-level cache across the app's
 * client-side lifetime — the 8,255-row dataset is fetched a single time). */
export function useBenefits(): BenefitsState {
  const [state, setState] = React.useState<BenefitsState>(cache ? { status: 'ready', benefits: cache } : { status: 'loading' });

  React.useEffect(() => {
    if (cache) {
      setState({ status: 'ready', benefits: cache });
      return;
    }
    let cancelled = false;
    loadDataset()
      .then((benefits) => {
        if (!cancelled) setState({ status: 'ready', benefits });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

const detailCache = new Map<string, BenefitDetail>();

export function useBenefitDetail(id: string | null) {
  const [state, setState] = React.useState<{ status: 'loading' | 'error' | 'ready'; detail?: BenefitDetail }>({ status: 'loading' });

  React.useEffect(() => {
    if (!id) return;
    if (detailCache.has(id)) {
      setState({ status: 'ready', detail: detailCache.get(id) });
      return;
    }
    let cancelled = false;
    loadDataset() // ensures shardCount is loaded from _meta.json before hashing
      .then(() => loadShard(shardFor(id)))
      .then((shard) => {
        if (cancelled) return;
        const detail = shard[id];
        if (!detail) throw new Error('id not found in shard');
        detailCache.set(id, detail);
        setState({ status: 'ready', detail });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
