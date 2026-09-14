import { buscarBloco } from "@/lib/schema";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Texto institucional fixo — igual para todos os clientes (Bloco 2,
// somenteLeitura no schema). Não vem de respostas, é o mesmo conteúdo que já
// estava hardcoded no template original.
const PILARES_ITENS = [
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
  {
    t: "Rankings & Prêmios",
    k: "Reconhecimento e validação externa",
    d: "Reputação que se prova por terceiros. Submissões, ranqueamentos e cases premiados são o número que nenhuma campanha interna consegue fabricar — é o mercado validando o que o escritório já entrega.",
  },
];

// Frase de encerramento fixa — mesma de RELATORIO-BASE-2026.html. Não vem de
// respostas: todo cliente fecha com a mesma mensagem, por padronização.
const ENCERRAMENTO_TEXTO_FIXO =
  "Por trás das grandes marcas do Direito. Estratégia, criatividade e execução full service para escritórios que querem crescer com consistência.";

export const CHAVES_SECOES = [
  "pilares",
  "valor",
  "resumo",
  "digital",
  "traficoPago",
  "imprensa",
  "rankings",
  "destaques",
  "inteligenciaAplicada",
  "plano",
  "acompanhamentosFuturos",
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

function serieOuNull(respostas: Record<string, unknown>, id: string): (number | null)[] | null {
  const v = respostas[id];
  if (!Array.isArray(v) || v.length !== 12) return null;
  const serie = v as (number | null)[];
  return serie.some((mes) => mes !== null && mes !== undefined) ? serie : null;
}

// resumo.kpis pode ter uma linha em branco sobrando de um rascunho antigo —
// não faz sentido mostrar um card vazio no relatório.
function kpisPreenchidos(respostas: Record<string, unknown>) {
  return lista<Record<string, unknown>>(respostas, "resumo.kpis").filter(
    (k) => String(k.label ?? "").trim() !== "",
  );
}

function metricasComVariacaoCalculada(bruto: Record<string, unknown>[]) {
  return bruto
    .filter((m) => String(m.label ?? "").trim() !== "")
    .map((m) => {
      const atual = typeof m.valorAtual === "number" ? m.valorAtual : null;
      const anterior = typeof m.valorAnterior === "number" ? m.valorAnterior : null;
      const variacao =
        atual !== null && anterior !== null && anterior !== 0
          ? Math.round(((atual - anterior) / Math.abs(anterior)) * 100)
          : null;
      return { label: String(m.label ?? ""), valor: atual, variacao };
    });
}

function canaisParaTemplate(respostas: Record<string, unknown>) {
  const brutos = lista<Record<string, unknown>>(respostas, "digital.canais");
  return brutos.map((canal) => ({
      nome: String(canal.nome ?? ""),
      metricas: metricasComVariacaoCalculada(
        Array.isArray(canal.metricas) ? (canal.metricas as Record<string, unknown>[]) : [],
      ),
      postagensOrganicas: (Array.isArray(canal.postagensOrganicas)
        ? (canal.postagensOrganicas as Record<string, unknown>[])
        : []
      )
        .filter((p) => String(p.link ?? "").trim() !== "")
        .map((p) => ({
          link: String(p.link ?? ""),
          metrica: String(p.metrica ?? ""),
          valor: String(p.valor ?? ""),
        })),
      videoDestaque: String(canal.videoDestaque ?? ""),
      leitura: String(canal.leitura ?? ""),
    }));
}

async function campanhasParaTemplate(
  respostas: Record<string, unknown>,
  resolverImagem: (valor: unknown) => Promise<string | null>,
) {
  const brutos = lista<Record<string, unknown>>(respostas, "traficoPago.campanhas").filter(
    (c) => String(c.objetivo ?? "").trim() !== "",
  );
  return Promise.all(
    brutos.map(async (c) => ({
      nomeCampanha: String(c.nomeCampanha ?? ""),
      canal: String(c.canal ?? ""),
      objetivo: String(c.objetivo ?? ""),
      mes: String(c.mes ?? ""),
      imagem: await resolverImagem(c.imagem),
      metrica: String(c.metrica ?? ""),
      valorMetrica: String(c.valorMetrica ?? ""),
      resultado: String(c.resultado ?? ""),
    })),
  );
}

function trimestresParaTemplate(respostas: Record<string, unknown>) {
  const campo = buscarBloco("b12")?.campos.find((c) => c.id === "planejamento.trimestres");
  const nomes = campo?.itensFixos ?? ["1º Trimestre", "2º Trimestre", "3º Trimestre", "4º Trimestre"];
  const brutos = lista<{ itens?: unknown }>(respostas, "planejamento.trimestres");

  return nomes.map((nome, indice) => ({
    nome,
    itens: Array.isArray(brutos[indice]?.itens) ? brutos[indice]!.itens : [],
  }));
}

function bulletsPreenchidos(respostas: Record<string, unknown>, id: string) {
  return lista<Record<string, unknown>>(respostas, id)
    .map((linha) => String(linha.item ?? "").trim())
    .filter((item) => item !== "");
}

function blocosDeFrase(respostas: Record<string, unknown>, id: string) {
  return lista<Record<string, unknown>>(respostas, id)
    .map((linha) => String(linha.frase ?? "").trim())
    .filter((frase) => frase !== "");
}

export async function montarDados(
  respostas: Record<string, unknown>,
  relatorio: { cliente: string; ano: number },
  resolverImagem: (valor: unknown) => Promise<string | null>,
) {
  const ano = numero(respostas, "cliente.ano", relatorio.ano);
  const logo = await resolverImagem(respostas["cliente.logo"]);

  const destaquesBrutos = lista<Record<string, unknown>>(respostas, "destaques");
  const destaques = await Promise.all(
    destaquesBrutos.map(async (d) => ({
      quando: String(d.quando ?? ""),
      titulo: String(d.titulo ?? ""),
      descricao: String(d.descricao ?? ""),
      resultado: String(d.resultado ?? ""),
      imagem: await resolverImagem(d.imagem),
    })),
  );

  const modoPlanejamento = texto(respostas, "planejamento.modo", "trimestres");

  return {
    cliente: {
      nome: texto(respostas, "cliente.nome", relatorio.cliente),
      logo,
      ano,
      anoAnterior: ano - 1,
      subtitulo: texto(respostas, "cliente.subtitulo"),
      inicioParceria: texto(respostas, "cliente.inicioParceria"),
      frentes: lista<string>(respostas, "cliente.frentes").join(" · "),
      consultorResponsavel: texto(respostas, "cliente.consultorResponsavel"),
    },
    pilares: {
      titulo: "Seis frentes, um método",
      texto: "Seis frentes sustentam tudo o que a LETS entrega. Cada número deste relatório nasce de uma delas.",
      itens: PILARES_ITENS,
    },
    resumo: {
      titulo: texto(respostas, "resumo.titulo", "O ano em números"),
      texto: texto(respostas, "resumo.texto"),
      kpis: kpisPreenchidos(respostas),
    },
    meses: MESES,
    digital: {
      titulo: texto(respostas, "digital.titulo", "Onde a marca foi vista"),
      site: {
        titulo: "Site institucional",
        metricas: lista(respostas, "digital.site.metricas"),
        leitura: texto(respostas, "digital.site.leitura"),
      },
      canais: canaisParaTemplate(respostas),
    },
    traficoPago: {
      titulo: texto(respostas, "traficoPago.titulo", "Investimento com retorno"),
      metricas: lista(respostas, "traficoPago.metricas"),
      leitura: texto(respostas, "traficoPago.leitura"),
      campanhas: await campanhasParaTemplate(respostas, resolverImagem),
    },
    valor: {
      titulo: texto(respostas, "valor.titulo", "O que a LETS executou"),
      texto: texto(respostas, "valor.texto"),
      entregas: lista(respostas, "valor.entregas"),
      time: lista(respostas, "valor.time"),
    },
    imprensa: {
      titulo: texto(respostas, "imprensa.titulo", "Presença espontânea"),
      insercoes: numero(respostas, "imprensa.insercoes"),
      veiculos: numero(respostas, "imprensa.veiculos"),
      alcanceEstimado: texto(respostas, "imprensa.alcanceEstimado"),
      valorEquivalente: texto(respostas, "imprensa.valorEquivalente"),
      porMes: serieOuNull(respostas, "imprensa.porMes"),
      leitura: texto(respostas, "imprensa.leitura"),
      principais: lista(respostas, "imprensa.principais"),
    },
    rankings: {
      titulo: texto(respostas, "rankings.titulo", "Validação externa"),
      itens: lista(respostas, "rankings"),
    },
    destaques: {
      frase: texto(respostas, "destaques.frase", "Os momentos que moveram o ponteiro"),
      itens: destaques,
    },
    inteligencia: {
      titulo: texto(respostas, "inteligencia.titulo", "Inteligência aplicada"),
      texto: texto(respostas, "inteligencia.texto"),
      bullets: bulletsPreenchidos(respostas, "inteligencia.bullets"),
    },
    planejamento: {
      titulo: texto(respostas, "planejamento.titulo", "O que vem a seguir"),
      texto: texto(respostas, "planejamento.texto"),
      modo: modoPlanejamento,
      trimestres: trimestresParaTemplate(respostas),
      blocos: lista(respostas, "planejamento.blocos"),
    },
    acompanhamentos: {
      titulo: texto(respostas, "acompanhamentos.titulo", "Acompanhamentos estratégicos futuros"),
      frases: blocosDeFrase(respostas, "acompanhamentos.blocos"),
    },
    encerramento: {
      titulo: "Para o extraordinário",
      texto: ENCERRAMENTO_TEXTO_FIXO,
      assinatura: "LETS Marketing · Consultoria líder em marketing jurídico",
    },
  };
}
