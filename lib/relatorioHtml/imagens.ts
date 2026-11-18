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

// As fotos do time ficam no site da LETS. Se o HTML só apontasse pra lá, o
// arquivo baixado perderia as fotos (bloqueio de hotlink, offline, e-mail,
// link que muda) — então o servidor baixa e embute cada uma.
export async function embutirFotosDoTime<T extends { foto?: string }>(time: T[]): Promise<T[]> {
  const cache = new Map<string, Promise<string>>();
  const baixar = (url: string) => {
    if (!cache.has(url)) {
      cache.set(
        url,
        (async () => {
          try {
            const resposta = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!resposta.ok) return url;
            const tipo = resposta.headers.get("content-type") ?? "image/png";
            if (!tipo.startsWith("image/")) return url;
            const buffer = Buffer.from(await resposta.arrayBuffer());
            return `data:${tipo};base64,${buffer.toString("base64")}`;
          } catch {
            return url; // sem foto embutida o template ainda tenta o link e cai nas iniciais
          }
        })(),
      );
    }
    return cache.get(url)!;
  };

  return Promise.all(time.map(async (p) => (p.foto ? { ...p, foto: await baixar(p.foto) } : p)));
}
