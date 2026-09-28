import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

export function hasSupabaseSecretKey() {
  return Boolean(supabaseSecretKey());
}

export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const key = supabaseSecretKey();

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY. The publishable key cannot write to the users table.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function supabaseSecretKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}
