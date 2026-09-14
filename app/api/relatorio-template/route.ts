import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Serve o template cru pra prévia ao vivo no navegador — quem pede precisa
// estar logado (mesma regra de qualquer outra rota do app), mas não depende
// de nenhum relatório específico.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login de novo." }, { status: 401 });
  }

  const caminhoTemplate = path.join(process.cwd(), "lib/relatorioHtml/template.html");
  const template = await readFile(caminhoTemplate, "utf8");

  return new NextResponse(template, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
