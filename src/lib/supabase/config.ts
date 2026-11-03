/** True when all Supabase env vars needed for production data access are set. */
export function isSupabaseReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

/** Persist to `.data/` on disk (no Supabase credentials required). */
export function useLocalDevStore(): boolean {
  if (process.env.USE_LOCAL_STORE === "true") return true;
  return !isSupabaseReady();
}
