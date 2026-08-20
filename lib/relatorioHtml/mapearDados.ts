import type { SupabaseClient } from "@supabase/supabase-js";
import { buscarBloco } from "@/lib/schema";
import { resolverImagemDataUri } from "@/lib/relatorioHtml/imagens";
import type { PerguntaCustom } from "@/lib/perguntasCustom";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Texto institucional fixo — igual para todos os clientes (Bloco 2,
// somenteLeitura no schema). Não vem de respostas, é o mesmo conteúdo que já
// estava hardcoded no template original.
const PILARES = {
  texto:
    "Cinco frentes sustentam tudo o que a LETS entrega. Cada número deste relatório nasce de uma delas.",
  itens: [
    {
      t: "Branding",
      k: "Posicionamento e reputação",
      d: "Como o escritório é percebido antes de qualquer reunião acontecer. Identidade, discurso e coerência em todos os pontos de contato.",
    },
    {
      t: "Conteúdo",
      k: "Narrativa e autoridade",
      d: "Conhecimento técnico dos sócios transformado em material que circula. É o que faz o escritório ser lembrado quando a dúvida aparece.",
    },
    {
      t: "Performance",
      k: "Captação e conversão",
      d: "A ponte entre reputação e pipeline. Tráfego qualificado, páginas que convertem e origem rastreada de cada contato recebido.",
    },
    {
      t: "Dados",
      k: "Métrica e decisão",
      d: "Nada entra no plano sem número que sustente. É a métrica que separa decisão de palpite — e que valida ou derruba a estratégia.",
    },
    {
      t: "Comunicação interna",
      k: "Cultura e alinhamento",
      d: "Marca forte começa dentro. Sócios e equipe alinhados no mesmo discurso multiplicam o alcance de tudo que se constrói fora.",
    },
  ],
};

export const CHAVES_SECOES = [
  "pilares",
  "resumo",
  "digital",
  "valor",
  "imprensa",
  "rankings",
  "destaques",
  "benchmark",
  "plano",
  "encerramento",
] as const;

export function secoesParaTemplate(secoesSelecionadas: string[]): Record<string, boolean> {
  return Object.fromEntries(CHAVES_SECOES.map((id) => [id, secoesSelecionadas.includes(id)]));
}

function texto(respostas: Record<string, unknown>, id: string, padrao = ""): string {
  const v = respostas[id];
  return typeof v === "string" && v.trim() !== "" ? v : padrao;
}

function numero(respostas: Record<string, unknown>, id: string, padrao = 0): number {
  const v = respostas[id];
  return typeof v === "number" ? v : padrao;
}

function lista<T>(respostas: Record<string, unknown>, id: string): T[] {
  const v = respostas[id];
  return Array.isArray(v) ? (v as T[]) : [];
}

function serie(respostas: Record<string, unknown>, id: string): (number | null)[] {
  const v = respostas[id];
  return Array.isArray(v) && v.length === 12 ? (v as (number | null)[]) : Array(12).fill(null);
}

function trimestresParaTemplate(respostas: Record<string, unknown>) {
  const campo = buscarBloco("b11")?.campos.find((c) => c.id === "planejamento.trimestres");
  const nomes = campo?.itensFixos ?? ["1º Trimestre", "2º Trimestre", "3º Trimestre", "4º Trimestre"];
  const brutos = lista<{ itens?: unknown }>(respostas, "planejamento.trimestres");

  return nomes.map((nome, indice) => ({
    nome,
    itens: Array.isArray(brutos[indice]?.itens) ? brutos[indice]!.itens : [],
  }));
}

async function personalizadasParaTemplate(
  perguntasCustom: PerguntaCustom[],
  respostas: Record<string, unknown>,
  supabase: SupabaseClient,
) {
  return Promise.all(
    perguntasCustom.map(async (pergunta) => {
      const valor = respostas[`custom:${pergunta.id}`];
      const item = valor && typeof valor === "object" ? (valor as Record<string, unknown>) : {};

      if (pergunta.modelo === "destaque") {
        return {
          modelo: "destaque" as const,
          rotulo: pergunta.rotulo,
          imagem: await resolverImagemDataUri(supabase, item.imagem),
          texto: String(item.texto ?? ""),
        };
      }

      if (pergunta.modelo === "numero") {
        return {
          modelo: "numero" as const,
          rotulo: pergunta.rotulo,
          numero: typeof item.numero === "number" ? item.numero : null,
          texto: String(item.texto ?? ""),
        };
      }

      if (pergunta.modelo === "lista") {
        const itens = Array.isArray(item.itens) ? (item.itens as Record<string, unknown>[]) : [];
        return {
          modelo: "lista" as const,
          rotulo: pergunta.rotulo,
          itens: itens.map((linha) => String(linha.item ?? "")).filter((texto) => texto !== ""),
        };
      }

      return {
        modelo: "texto" as const,
        rotulo: pergunta.rotulo,
        texto: String(item.texto ?? ""),
      };
    }),
  );
}

export async function montarDados(
  respostas: Record<string, unknown>,
  relatorio: { cliente: string; ano: number },
  supabase: SupabaseClient,
  perguntasCustom: PerguntaCustom[] = [],
) {
  const ano = numero(respostas, "cliente.ano", relatorio.ano);
  const logo = await resolverImagemDataUri(supabase, respostas["cliente.logo"]);

  const destaquesBrutos = lista<Record<string, unknown>>(respostas, "destaques");
  const destaques = await Promise.all(
    destaquesBrutos.map(async (d) => ({
      quando: String(d.quando ?? ""),
      titulo: String(d.titulo ?? ""),
      descricao: String(d.descricao ?? ""),
      resultado: String(d.resultado ?? ""),
      imagem: await resolverImagemDataUri(supabase, d.imagem),
    })),
  );

  return {
    cliente: {
      nome: texto(respostas, "cliente.nome", relatorio.cliente),
      logo,
      ano,
      anoAnterior: ano - 1,
      subtitulo: texto(respostas, "cliente.subtitulo"),
      inicioParceria: texto(respostas, "cliente.inicioParceria"),
      frentes: texto(respostas, "cliente.frentes"),
      consultorResponsavel: texto(respostas, "cliente.consultorResponsavel"),
    },
    pilares: PILARES,
    resumo: {
      texto: texto(respostas, "resumo.texto"),
      kpis: lista(respostas, "resumo.kpis"),
    },
    meses: MESES,
    digital: {
      site: {
        titulo: "Site institucional",
        fonte: texto(respostas, "digital.site.fonte"),
        serieAtual: serie(respostas, "digital.site.serieAtual"),
        serieAnterior: serie(respostas, "digital.site.serieAnterior"),
        metricas: lista(respostas, "digital.site.metricas"),
        leitura: texto(respostas, "digital.site.leitura"),
      },
      canais: lista(respostas, "digital.canais"),
    },
    valor: {
      texto: texto(respostas, "valor.texto"),
      entregas: lista(respostas, "valor.entregas"),
      time: lista(respostas, "valor.time"),
    },
    imprensa: {
      insercoes: numero(respostas, "imprensa.insercoes"),
      veiculos: numero(respostas, "imprensa.veiculos"),
      alcanceEstimado: texto(respostas, "imprensa.alcanceEstimado"),
      valorEquivalente: texto(respostas, "imprensa.valorEquivalente"),
      porMes: serie(respostas, "imprensa.porMes"),
      leitura: texto(respostas, "imprensa.leitura"),
      principais: lista(respostas, "imprensa.principais"),
    },
    rankings: lista(respostas, "rankings"),
    destaques: {
      frase: texto(respostas, "destaques.frase", "Os momentos que moveram o ponteiro"),
      itens: destaques,
    },
    benchmark: {
      texto: texto(respostas, "benchmark.texto"),
      itens: lista(respostas, "benchmark.itens"),
    },
    planejamento: {
      texto: texto(respostas, "planejamento.texto"),
      trimestres: trimestresParaTemplate(respostas),
    },
    encerramento: {
      texto: texto(respostas, "encerramento.texto"),
      assinatura: texto(respostas, "encerramento.assinatura"),
    },
    personalizadas: await personalizadasParaTemplate(perguntasCustom, respostas, supabase),
  };
}
