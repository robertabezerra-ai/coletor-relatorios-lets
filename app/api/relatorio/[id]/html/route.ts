import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buscarRelatorio, buscarRespostas } from "@/lib/data/relatorios";
import { obterSecoesSelecionadas } from "@/lib/schema";
import { montarDados, secoesParaTemplate } from "@/lib/relatorioHtml/mapearDados";
import { resolverImagemDataUri } from "@/lib/relatorioHtml/imagens";
import { injetarDados } from "@/lib/relatorioHtml/injetar";
import { slug } from "@/lib/docx/estilo";

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
  const secoesSelecionadas = obterSecoesSelecionadas(respostas);
  const secoes = secoesParaTemplate(secoesSelecionadas);
  const dados = await montarDados(
    respostas,
    { cliente: relatorio.cliente, ano: relatorio.ano },
    (valor) => resolverImagemDataUri(supabase, valor),
  );

  const caminhoTemplate = path.join(process.cwd(), "lib/relatorioHtml/template.html");
  const template = await readFile(caminhoTemplate, "utf8");
  const html = injetarDados(template, secoes, dados);

  const arquivo = `relatorio-${slug(relatorio.cliente)}-${relatorio.ano}.html`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${arquivo}"`,
    },
  });
}
