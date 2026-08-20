"use server";

import { createClient } from "@/lib/supabase/server";
import { mensagemErroAmigavel } from "@/lib/erroAmigavel";
import type { PerguntaCustom, ModeloPerguntaCustom } from "@/lib/perguntasCustom";

export async function criarPerguntaCustom(dados: {
  relatorioId: string;
  rotulo: string;
  formato: string;
  modelo: ModeloPerguntaCustom;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login de novo.", pergunta: null };

  const { count } = await supabase
    .from("perguntas_custom")
    .select("id", { count: "exact", head: true })
    .eq("relatorio_id", dados.relatorioId);

  const { data, error } = await supabase
    .from("perguntas_custom")
    .insert({
      relatorio_id: dados.relatorioId,
      rotulo: dados.rotulo.trim(),
      formato: dados.formato.trim() || null,
      tipo: dados.modelo,
      ordem: count ?? 0,
      criado_por: user.id,
    })
    .select("id, relatorio_id, rotulo, formato, modelo:tipo, ordem")
    .single();

  if (error) return { error: mensagemErroAmigavel(error), pergunta: null };
  return { error: null, pergunta: data as unknown as PerguntaCustom };
}

export async function atualizarPerguntaCustom(
  id: string,
  dados: { rotulo: string; formato: string; modelo: ModeloPerguntaCustom },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("perguntas_custom")
    .update({
      rotulo: dados.rotulo.trim(),
      formato: dados.formato.trim() || null,
      tipo: dados.modelo,
    })
    .eq("id", id);

  if (error) return { error: mensagemErroAmigavel(error) };
  return { error: null };
}

export async function excluirPerguntaCustom(id: string, relatorioId: string) {
  const supabase = await createClient();

  await supabase
    .from("respostas")
    .delete()
    .eq("relatorio_id", relatorioId)
    .eq("campo_id", `custom:${id}`);

  const { error } = await supabase.from("perguntas_custom").delete().eq("id", id);
  if (error) return { error: mensagemErroAmigavel(error) };
  return { error: null };
}

export async function reordenarPerguntasCustom(itens: { id: string; ordem: number }[]) {
  const supabase = await createClient();

  for (const item of itens) {
    const { error } = await supabase
      .from("perguntas_custom")
      .update({ ordem: item.ordem })
      .eq("id", item.id);
    if (error) return { error: mensagemErroAmigavel(error) };
  }

  return { error: null };
}
