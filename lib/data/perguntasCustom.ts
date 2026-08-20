import { createClient } from "@/lib/supabase/server";
import type { PerguntaCustom } from "@/lib/perguntasCustom";

export async function listarPerguntasCustom(relatorioId: string): Promise<PerguntaCustom[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perguntas_custom")
    .select("id, relatorio_id, rotulo, formato, modelo:tipo, ordem")
    .eq("relatorio_id", relatorioId)
    .order("ordem");

  if (error) throw error;
  return data as unknown as PerguntaCustom[];
}
