import { useLocalDevStore } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminUser() {
  if (useLocalDevStore()) {
    return { id: "local-dev-admin", email: "local@dev" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
