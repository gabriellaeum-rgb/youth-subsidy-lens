import { createClient } from '@supabase/supabase-js';

/**
 * Hardcoded per project decision: this is a static-export app (output: 'export')
 * with no server runtime, so there is no `.env.local` to read at request time.
 * The key below is the public "publishable" key — safe for client bundles, it
 * only allows what Row Level Security policies (see database/schema.sql) permit.
 */
const SUPABASE_PROJECT_ID = 'wkxnbtqvzewdjkmwusyq';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_jV7C-Q2E2LmYyQfJMvboyg_vZNYrWQT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
