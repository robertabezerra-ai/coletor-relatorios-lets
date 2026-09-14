import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";
import { buscarRelatorio, buscarRespostas } from "@/lib/data/relatorios";
import { blocosVisiveis, listarBlocos, obterSecoesSelecionadas } from "@/lib/schema";
import { coletarImagens } from "@/lib/docx/imagens";
import { nomeArquivoImagens } from "@/lib/docx/estilo";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login de novo." }, { status: 401 });
  }

  const relatorio = await buscarRelatorio(id);
  if (!relatorio) {
    return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });
  }

  const respostas = await buscarRespostas(id);

  const blocos = listarBlocos();
  const secoes = obterSecoesSelecionadas(respostas);
  const visiveis = blocosVisiveis(blocos, secoes);
  const imagens = coletarImagens(visiveis, respostas);

  if (imagens.length === 0) {
    return NextResponse.json({ error: "Este relatório ainda não tem nenhuma imagem." }, { status: 404 });
  }

  const zip = new JSZip();

  await Promise.all(
    imagens.map(async (imagem) => {
      const { data } = await supabase.storage.from("relatorios").download(imagem.caminho);
      if (data) zip.file(imagem.nome, await data.arrayBuffer());
    }),
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  const arquivo = nomeArquivoImagens(relatorio.cliente, relatorio.ano);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${arquivo}"`,
    },
  });
}
