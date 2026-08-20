import { NextResponse } from "next/server";
import { isEmailDominioPermitido } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (typeof email !== "string" || !isEmailDominioPermitido(email)) {
    return NextResponse.json(
      { error: "Use um e-mail @letsmarketing.com.br." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const origin = new URL(request.url).origin;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
