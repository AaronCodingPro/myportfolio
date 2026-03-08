import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string, message?: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(message ?? `Missing ${name}`);
  }
  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createServerSupabaseClient() {
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
