import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { obterIdentidadeAtual } from "@/lib/identidade";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: relatorioId } = await params;
  const {
    campo_id: campoId,
    valor,
    atualizado_em_esperado: atualizadoEmEsperado,
  } = await request.json();

  if (typeof campoId !== "string" || !campoId) {
    return NextResponse.json({ error: "campo_id é obrigatório." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login de novo." }, { status: 401 });
  }

  // Conflito de edição simultânea (seção 11): se o cliente sabe de uma versão
  // e o banco já tem outra mais nova, não sobrescreve calado.
  if (atualizadoEmEsperado) {
    const { data: atual } = await supabase
      .from("respostas")
      .select("valor, atualizado_em")
      .eq("relatorio_id", relatorioId)
      .eq("campo_id", campoId)
      .maybeSingle();

    if (atual && atual.atualizado_em !== atualizadoEmEsperado) {
      return NextResponse.json(
        { conflito: true, valor: atual.valor, atualizado_em: atual.atualizado_em },
        { status: 409 },
      );
    }
  }

  const { data, error } = await supabase
    .from("respostas")
    .upsert(
      {
        relatorio_id: relatorioId,
        campo_id: campoId,
        valor: valor ?? null,
        atualizado_por: user.id,
        atualizado_por_nome: await obterIdentidadeAtual(),
      },
      { onConflict: "relatorio_id,campo_id" },
    )
    .select("atualizado_em")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ atualizado_em: data.atualizado_em });
}
