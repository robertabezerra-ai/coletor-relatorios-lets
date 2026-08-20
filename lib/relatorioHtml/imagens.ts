import type { SupabaseClient } from "@supabase/supabase-js";

// O relatório HTML final é um arquivo único e portátil — a imagem entra
// como data URI embutida, não como link para o Storage privado (que exigiria
// URL assinada e expiraria).
export async function resolverImagemDataUri(
  supabase: SupabaseClient,
  valor: unknown,
): Promise<string> {
  const caminho = (valor as { caminho?: string } | null)?.caminho;
  if (!caminho) return "";

  const { data, error } = await supabase.storage.from("relatorios").download(caminho);
  if (error || !data) return "";

  const buffer = Buffer.from(await data.arrayBuffer());
  const tipo = data.type || "image/webp";
  return `data:${tipo};base64,${buffer.toString("base64")}`;
}
