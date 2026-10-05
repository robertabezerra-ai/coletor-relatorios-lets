import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { IDENTIDADE_COOKIE } from "@/lib/identidadeCookie";

// Sai pelo servidor numa navegação comum: encerra a sessão, apaga o nome e
// manda para o login. Fazer isso por server action depois do signOut no
// navegador caía na tela de erro, porque o middleware recusava a action de
// quem já não tinha sessão.
export async function POST() {
  const supabase = await createClient();
  // scope "local": a conta do Supabase é compartilhada por toda a equipe —
  // um signOut "global" aqui derrubaria a sessão de todo mundo.
  await supabase.auth.signOut({ scope: "local" });

  const store = await cookies();
  store.delete(IDENTIDADE_COOKIE);

  return new NextResponse(null, { status: 303, headers: { Location: "/login" } });
}
