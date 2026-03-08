import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string, message?: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(message ?? `Missing ${name}`);
  }
  return value;
}

export function createServerSupabaseClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) for server routes."
    );
  }

  const serviceRoleKey = requireEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local for server routes."
  );

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
