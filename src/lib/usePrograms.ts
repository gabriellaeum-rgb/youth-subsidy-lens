'use client';

import * as React from 'react';
import type { Program } from '@/types';
import { supabase } from '@/lib/supabaseClient';

type ProgramsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; programs: Program[] };

/** Fetches the program dataset from the Supabase `programs` table once on mount. */
export function usePrograms(): ProgramsState {
  const [state, setState] = React.useState<ProgramsState>({ status: 'loading' });

  React.useEffect(() => {
    let cancelled = false;
    supabase
      .from('programs')
      .select('*')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setState({ status: 'error' });
          return;
        }
        setState({ status: 'ready', programs: data as Program[] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
