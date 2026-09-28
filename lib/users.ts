import type { User } from "@clerk/backend";
import { createAdminClient, hasSupabaseSecretKey } from "@/lib/supabase/admin";

export function clerkDisplayName(user: User, email: string) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.username || email;
}

export function clerkEmail(user: User) {
  return (
    user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function syncClerkUser(user: User) {
  const email = clerkEmail(user);

  if (!email) {
    return { ok: false as const, error: "This account has no email address to save." };
  }

  if (!hasSupabaseSecretKey()) {
    return {
      ok: false as const,
      error:
        "Add SUPABASE_SECRET_KEY to .env.local, then restart the dev server. The publishable key can read users, but row-level security blocks inserts.",
    };
  }

  const name = clerkDisplayName(user, email);
  const supabase = createAdminClient();
  const existing = await supabase.from("users").select("id").eq("email", email).limit(1);

  if (existing.error) {
    return { ok: false as const, error: existing.error.message };
  }

  if (existing.data?.[0]) {
    const updated = await supabase.from("users").update({ name }).eq("id", existing.data[0].id);
    if (updated.error) {
      return { ok: false as const, error: updated.error.message };
    }
    return { ok: true as const, name, email };
  }

  const inserted = await supabase.from("users").insert({ name, email });
  if (inserted.error) {
    return { ok: false as const, error: inserted.error.message };
  }

  return { ok: true as const, name, email };
}
