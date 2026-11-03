import { useLocalDevStore } from "@/lib/supabase/config";

export function LocalDevBanner() {
  if (!useLocalDevStore()) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
      Local development mode — data is stored in <code className="rounded bg-white px-1 text-amber-950">.data/store.json</code>.
      Add Supabase keys to <code className="rounded bg-white px-1 text-amber-950">.env.local</code> for production persistence.
    </div>
  );
}
