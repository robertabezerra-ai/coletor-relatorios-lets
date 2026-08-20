import { createClient } from "@/lib/supabase/server";

export type EntradaLog = {
  id: number;
  campo_id: string;
  valor_anterior: unknown;
  valor_novo: unknown;
  autor: string | null;
  quando: string;
  autorNome: string | null;
};

export async function listarHistorico(relatorioId: string): Promise<EntradaLog[]> {
  const supabase = await createClient();
  const { data: log, error } = await supabase
    .from("respostas_log")
    .select("id, campo_id, valor_anterior, valor_novo, autor, autor_nome, quando")
    .eq("relatorio_id", relatorioId)
    .order("quando", { ascending: false });

  if (error) throw error;

  return (log ?? []).map((linha) => ({
    id: linha.id,
    campo_id: linha.campo_id,
    valor_anterior: linha.valor_anterior,
    valor_novo: linha.valor_novo,
    autor: linha.autor,
    quando: linha.quando,
    autorNome: linha.autor_nome,
  }));
}
