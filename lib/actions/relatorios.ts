"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mensagemErroAmigavel } from "@/lib/erroAmigavel";
import { obterIdentidadeAtual } from "@/lib/identidade";

export async function criarRelatorio(dados: { cliente: string; ano: number; squad_id: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada. Faça login de novo." };

  const nomeAtual = await obterIdentidadeAtual();

  const { data, error } = await supabase
    .from("relatorios")
    .insert({
      cliente: dados.cliente.trim(),
      ano: dados.ano,
      squad_id: dados.squad_id,
      criado_por: user.id,
      criador_nome: nomeAtual,
    })
    .select("id")
    .single();

  if (error) {
    return { error: mensagemErroAmigavel(error, "Já existe um relatório desse cliente nesse ano.") };
  }

  revalidatePath("/");
  return { error: null, id: data.id as string };
}

export async function moverRelatorioSquad(relatorioId: string, novoSquadId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("relatorios")
    .update({ squad_id: novoSquadId })
    .eq("id", relatorioId);

  if (error) return { error: mensagemErroAmigavel(error) };

  revalidatePath("/");
  return { error: null };
}

export async function excluirRelatorio(relatorioId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login de novo." };

  const nomeAtual = await obterIdentidadeAtual();

  const { data: relatorio, error: erroBusca } = await supabase
    .from("relatorios")
    .select("criador_nome")
    .eq("id", relatorioId)
    .maybeSingle();

  if (erroBusca) return { error: mensagemErroAmigavel(erroBusca) };
  if (!relatorio) return { error: "Relatório não encontrado." };
  if (!nomeAtual || relatorio.criador_nome !== nomeAtual) {
    return { error: "Só quem criou este relatório pode excluí-lo." };
  }

  const { error } = await supabase.from("relatorios").delete().eq("id", relatorioId);
  if (error) return { error: mensagemErroAmigavel(error) };

  revalidatePath("/");
  return { error: null };
}
