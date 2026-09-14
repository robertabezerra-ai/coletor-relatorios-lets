import { createClient } from "@/lib/supabase/server";
import type { RelatorioPainel } from "@/lib/types";

export async function listarRelatoriosPainel(): Promise<RelatorioPainel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("relatorios_painel")
    .select("*")
    .order("cliente");

  if (error) throw error;
  return data;
}

export type RelatorioComSquad = {
  id: string;
  cliente: string;
  ano: number;
  squad_id: string;
  status: string;
  criador_nome: string | null;
  squads: { nome: string; cor: string } | null;
};

export async function buscarRelatorio(id: string): Promise<RelatorioComSquad | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("relatorios")
    .select("id, cliente, ano, squad_id, status, criador_nome, squads(nome, cor)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as RelatorioComSquad | null;
}

export async function buscarRespostas(relatorioId: string): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("respostas")
    .select("campo_id, valor")
    .eq("relatorio_id", relatorioId);

  if (error) throw error;

  const mapa: Record<string, unknown> = {};
  for (const linha of data) {
    mapa[linha.campo_id] = linha.valor;
  }
  return mapa;
}

export async function buscarAtualizacoes(relatorioId: string): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("respostas")
    .select("campo_id, atualizado_em")
    .eq("relatorio_id", relatorioId);

  if (error) throw error;

  const mapa: Record<string, string> = {};
  for (const linha of data) {
    mapa[linha.campo_id] = linha.atualizado_em;
  }
  return mapa;
}

export async function listarRespostasAgrupadas(): Promise<
  Record<string, Record<string, unknown>>
> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("respostas").select("relatorio_id, campo_id, valor");

  if (error) throw error;

  const agrupado: Record<string, Record<string, unknown>> = {};
  for (const linha of data) {
    agrupado[linha.relatorio_id] ??= {};
    agrupado[linha.relatorio_id][linha.campo_id] = linha.valor;
  }
  return agrupado;
}
