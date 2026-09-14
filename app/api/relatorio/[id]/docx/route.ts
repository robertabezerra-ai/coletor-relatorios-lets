import { NextResponse } from "next/server";
import { Document, Packer, convertMillimetersToTwip } from "docx";
import { createClient } from "@/lib/supabase/server";
import { buscarRelatorio, buscarRespostas } from "@/lib/data/relatorios";
import { blocosVisiveis, listarBlocos, obterSecoesSelecionadas } from "@/lib/schema";
import { montarConteudo } from "@/lib/docx/conteudo";
import { montarCapa } from "@/lib/docx/capa";
import { nomeArquivo, MARGEM_MM, FONTE, CORES } from "@/lib/docx/estilo";

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

  const capa = montarCapa({
    cliente: relatorio.cliente,
    ano: relatorio.ano,
    squadNome: relatorio.squads?.nome ?? "",
  });

  const conteudo = await montarConteudo(visiveis, respostas, supabase);

  const documento = new Document({
    styles: {
      default: {
        document: { run: { font: FONTE, color: CORES.tinta } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297),
            },
            margin: {
              top: convertMillimetersToTwip(MARGEM_MM),
              bottom: convertMillimetersToTwip(MARGEM_MM),
              left: convertMillimetersToTwip(MARGEM_MM),
              right: convertMillimetersToTwip(MARGEM_MM),
            },
          },
        },
        children: [...capa, ...conteudo],
      },
    ],
  });

  const buffer = await Packer.toBuffer(documento);
  const arquivo = nomeArquivo(relatorio.cliente, relatorio.ano);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${arquivo}"`,
    },
  });
}
