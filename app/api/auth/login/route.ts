import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { senha } = await request.json();

  if (typeof senha !== "string" || senha.length === 0 || senha !== process.env.PAINEL_SENHA) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const email = process.env.AUTH_SHARED_EMAIL;
  const password = process.env.AUTH_SHARED_PASSWORD;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Login não configurado. Avise quem administra o app." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: "Não foi possível entrar. Tente de novo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
