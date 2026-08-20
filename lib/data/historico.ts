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
  const [{ data: log, error: erroLog }, { data: perfis, error: erroPerfis }] = await Promise.all([
    supabase
      .from("respostas_log")
      .select("id, campo_id, valor_anterior, valor_novo, autor, quando")
      .eq("relatorio_id", relatorioId)
      .order("quando", { ascending: false }),
    supabase.from("perfis").select("id, nome"),
  ]);

  if (erroLog) throw erroLog;
  if (erroPerfis) throw erroPerfis;

  const nomesPorId = new Map((perfis ?? []).map((perfil) => [perfil.id, perfil.nome]));

  return (log ?? []).map((linha) => ({
    ...linha,
    autorNome: linha.autor ? (nomesPorId.get(linha.autor) ?? null) : null,
  }));
}
