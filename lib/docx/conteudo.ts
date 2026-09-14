import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  ImageRun,
  HeadingLevel,
} from "docx";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { campoVisivel, normalizarOpcoes, numeroDoBloco, type Bloco, type Campo } from "@/lib/schema";
import { campoPreenchido } from "@/lib/progresso";
import { CORES, FONTE } from "@/lib/docx/estilo";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PENDENTE = "[PENDENTE]";

type Bloco2 = Paragraph | Table;
type Contador = { valor: number };

function rotuloCampo(texto: string, contador: Contador): Paragraph {
  contador.valor += 1;
  return new Paragraph({
    spacing: { before: 240, after: 40 },
    children: [
      new TextRun({
        text: `${contador.valor}. ${texto}`,
        bold: true,
        color: CORES.vermelho,
        font: FONTE,
      }),
    ],
  });
}

function linhaFormato(formato: string | undefined): Paragraph[] {
  if (!formato) return [];
  return [
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: formato, italics: true, color: CORES.cinza, font: FONTE })],
    }),
  ];
}

function paragrafoResposta(texto: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: texto || PENDENTE, color: CORES.tinta, font: FONTE })],
  });
}

async function embutirImagem(supabase: SupabaseClient, caminho: string): Promise<ImageRun | null> {
  const { data, error } = await supabase.storage.from("relatorios").download(caminho);
  if (error || !data) return null;

  const bufferWebp = Buffer.from(await data.arrayBuffer());
  const bufferPng = await sharp(bufferWebp).png().toBuffer();

  return new ImageRun({
    type: "png",
    data: bufferPng,
    transformation: { width: 280, height: 180 },
  });
}

function tabelaSchema(
  colunas: { id: string; rotulo: string }[],
  linhas: Record<string, unknown>[],
): Bloco2 {
  if (linhas.length === 0) return paragrafoResposta("");

  const cabecalho = new TableRow({
    tableHeader: true,
    children: colunas.map(
      (coluna) =>
        new TableCell({
          shading: { fill: CORES.preto, type: ShadingType.CLEAR, color: "auto" },
          width: { size: 100 / colunas.length, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: coluna.rotulo, bold: true, color: CORES.creme, font: FONTE }),
              ],
            }),
          ],
        }),
    ),
  });

  const corpo = linhas.map(
    (linha) =>
      new TableRow({
        children: colunas.map(
          (coluna) =>
            new TableCell({
              width: { size: 100 / colunas.length, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String(linha[coluna.id] ?? ""),
                      color: CORES.tinta,
                      font: FONTE,
                    }),
                  ],
                }),
              ],
            }),
        ),
      }),
  );

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [cabecalho, ...corpo] });
}

async function conteudoDoValor(
  campo: Campo,
  valor: unknown,
  supabase: SupabaseClient,
): Promise<Bloco2[]> {
  const vazio = !campoPreenchido(campo, valor);

  if (campo.tipo === "textoLongo") {
    if (vazio) return [paragrafoResposta("")];
    return String(valor)
      .split("\n")
      .map((linha) => paragrafoResposta(linha));
  }

  if (campo.tipo === "multiSelecao") {
    if (vazio) return [paragrafoResposta("")];
    const opcoes = normalizarOpcoes(campo.opcoes);
    const selecionados = (valor as string[]).map(
      (item) => opcoes.find((opcao) => opcao.valor === item)?.rotulo ?? item,
    );
    return [paragrafoResposta(selecionados.join(", "))];
  }

  if (campo.tipo === "serie12") {
    if (vazio) return [paragrafoResposta("")];
    const meses = valor as (number | null)[];
    const texto = MESES.map((mes, indice) => `${mes} ${meses[indice] ?? "–"}`).join(" · ");
    return [paragrafoResposta(texto)];
  }

  if (campo.tipo === "tabela" || campo.tipo === "pessoas") {
    const colunas = (campo.colunas ?? []).map((coluna) => ({ id: coluna.id, rotulo: coluna.rotulo }));
    const linhas = vazio ? [] : (valor as Record<string, unknown>[]);
    return [tabelaSchema(colunas, linhas)];
  }

  if (campo.tipo === "imagem") {
    if (vazio) return [paragrafoResposta("")];
    const itens = campo.multiplo ? (valor as { caminho: string }[]) : [valor as { caminho: string }];
    const imagens = await Promise.all(itens.map((item) => embutirImagem(supabase, item.caminho)));
    const validas = imagens.filter((imagem): imagem is ImageRun => imagem !== null);
    if (validas.length === 0) return [paragrafoResposta("")];
    return validas.map((imagem) => new Paragraph({ spacing: { after: 120 }, children: [imagem] }));
  }

  if (campo.tipo === "grupoRepetivel") {
    const itens = vazio ? [] : (valor as Record<string, unknown>[]);
    if (itens.length === 0) return [paragrafoResposta("")];

    const camposFilhos = campo.campos ?? [];
    const blocos: Bloco2[] = [];

    for (const [indice, item] of itens.entries()) {
      const rotuloItem =
        campo.fixo && campo.itensFixos
          ? campo.itensFixos[indice]
          : `${campo.rotuloItem ?? "Item"} ${indice + 1}`;

      blocos.push(
        new Paragraph({
          spacing: { before: 160, after: 40 },
          children: [new TextRun({ text: rotuloItem, bold: true, color: CORES.tinta, font: FONTE })],
        }),
      );

      for (const subCampo of camposFilhos) {
        blocos.push(
          new Paragraph({
            spacing: { after: 20 },
            children: [
              new TextRun({ text: subCampo.rotulo, bold: true, color: CORES.cinza, font: FONTE }),
            ],
          }),
        );
        blocos.push(...(await conteudoDoValor(subCampo, item[subCampo.id], supabase)));
      }
    }

    return blocos;
  }

  // texto, numero, selecao, selecaoEquipe e qualquer outro tipo simples
  return [paragrafoResposta(vazio ? "" : String(valor))];
}

async function renderizarCampo(
  campo: Campo,
  valor: unknown,
  supabase: SupabaseClient,
  contador: Contador,
): Promise<Bloco2[]> {
  return [
    rotuloCampo(campo.rotulo, contador),
    ...linhaFormato(campo.formato),
    ...(await conteudoDoValor(campo, valor, supabase)),
  ];
}

function tituloBloco(texto: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text: texto, bold: true, color: CORES.tinta, font: FONTE })],
  });
}

export async function montarConteudo(
  blocosVisiveis: Bloco[],
  respostas: Record<string, unknown>,
  supabase: SupabaseClient,
): Promise<Bloco2[]> {
  const contador: Contador = { valor: 0 };
  const partes: Bloco2[] = [];

  for (const bloco of blocosVisiveis) {
    partes.push(tituloBloco(`${numeroDoBloco(bloco.id)}. ${bloco.titulo}`));

    for (const campo of bloco.campos) {
      if (!campoVisivel(campo, bloco, respostas)) continue;
      partes.push(...(await renderizarCampo(campo, respostas[campo.id], supabase, contador)));
    }
  }

  return partes;
}
