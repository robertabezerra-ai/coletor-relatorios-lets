import { Paragraph, TextRun, AlignmentType, PageBreak } from "docx";
import { CORES, FONTE } from "@/lib/docx/estilo";

export function montarCapa(dados: {
  cliente: string;
  ano: number;
  squadNome: string;
}): Paragraph[] {
  const dataExportacao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return [
    new Paragraph({
      spacing: { before: 2400, after: 800 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "LETS", bold: true, color: CORES.vermelho, size: 72, font: FONTE }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: dados.cliente, bold: true, color: CORES.tinta, size: 48, font: FONTE }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: `${dados.ano} · ${dados.squadNome}`,
          color: CORES.cinza,
          size: 28,
          font: FONTE,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `Exportado em ${dataExportacao}`,
          color: CORES.cinza,
          size: 20,
          font: FONTE,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}
