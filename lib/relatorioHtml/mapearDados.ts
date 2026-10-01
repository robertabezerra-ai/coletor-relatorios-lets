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

// Tudo em Performance digital é opcional: canal sem nome e sem métricas (o
// item em branco que o formulário cria) não vira card vazio no relatório.
function canaisParaTemplate(respostas: Record<string, unknown>) {
  const brutos = lista<Record<string, unknown>>(respostas, "digital.canais");
  return brutos
    .map((canal) => ({
      nome: String(canal.nome ?? "").trim(),
      metricas: metricasComVariacaoCalculada(
        Array.isArray(canal.metricas) ? (canal.metricas as Record<string, unknown>[]) : [],
      ),
      leitura: String(canal.leitura ?? "").trim(),
    }))
    .filter((canal) => canal.nome !== "" || canal.metricas.length > 0);
}

function metricasSitePreenchidas(respostas: Record<string, unknown>) {
  return lista<Record<string, unknown>>(respostas, "digital.site.metricas").filter(
    (m) => String(m.label ?? "").trim() !== "",
  );
}

// Matérias da imprensa: basta veículo ou título — linha em branco é ignorada.
function materiasPreenchidas(respostas: Record<string, unknown>) {
  return lista<Record<string, unknown>>(respostas, "imprensa.principais")
    .map((m) => ({
      veiculo: String(m.veiculo ?? "").trim(),
      titulo: String(m.titulo ?? "").trim(),
      data: String(m.data ?? "").trim(),
      url: String(m.url ?? "").trim(),
    }))
    .filter((m) => m.veiculo !== "" || m.titulo !== "");
}

const numeroBR = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

// Big numbers: o usuário digita só o número, o sinal/%/milhar saem daqui.
// Aumento em número abrevia de mil pra cima (100000 -> "+100 mil").
export function formatarBigNumber(tipo: string, valor: number): string {
  const sinal = valor < 0 ? "−" : "+";
  const absoluto = Math.abs(valor);
  switch (tipo) {
    case "numero":
      return numeroBR.format(valor);
    case "aumentoNumero": {
      const compacto =
        absoluto >= 1_000_000
          ? `${numeroBR.format(absoluto / 1_000_000)} mi`
          : absoluto >= 1_000
            ? `${numeroBR.format(absoluto / 1_000)} mil`
            : numeroBR.format(absoluto);
      return `${sinal}${compacto}`;
    }
    case "porcentagem":
      return `${numeroBR.format(valor)}%`;
    case "aumentoPorcentagem":
      return `${sinal}${numeroBR.format(absoluto)}%`;
    default:
      return numeroBR.format(valor);
  }
}

function formatarReais(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(valor)
    .replace(/\u00a0/g, " ");
}

function numeroOuNull(respostas: Record<string, unknown>, id: string): number | null {
  const v = respostas[id];
  return typeof v === "number" ? v : null;
}

// Os números dos big numbers e os de cada campanha em destaque têm a mesma
// estrutura (tipo, valor, a que se refere, comparado a) e a mesma formatação.
function numerosParaTemplate(brutos: Record<string, unknown>[]) {
  return brutos
    .filter((b) => typeof b.valor === "number" && String(b.tipo ?? "") !== "")
    .map((b) => {
      const tipo = String(b.tipo);
      const ehAumento = tipo === "aumentoNumero" || tipo === "aumentoPorcentagem";
      return {
        valor: formatarBigNumber(tipo, b.valor as number),
        referente: String(b.referente ?? ""),
        comparadoA: ehAumento ? String(b.comparadoA ?? "") : "",
      };
    });
}

function trafegoPagoParaTemplate(respostas: Record<string, unknown>) {
  const redes = lista<string>(respostas, "tpago.redes")
    .map((rede) => (rede === "Outra" ? texto(respostas, "tpago.redesOutra") : rede))
    .filter((rede) => rede.trim() !== "");

  const objetivos = lista<Record<string, unknown>>(respostas, "tpago.objetivos")
    .map((o) => ({
      titulo: String(o.objetivo) === "Outro" ? String(o.objetivoOutro ?? "") : String(o.objetivo ?? ""),
      descricao: String(o.descricao ?? ""),
    }))
    .filter((o) => o.titulo.trim() !== "");

  const investimento = numeroOuNull(respostas, "tpago.investimento");
  const configuracoes = [
    { rotulo: "Campanhas", valor: numeroOuNull(respostas, "tpago.numCampanhas") },
    { rotulo: "Anúncios ativos no período", valor: numeroOuNull(respostas, "tpago.numAnuncios") },
  ]
    .filter((c) => c.valor !== null)
    .map((c) => ({ rotulo: c.rotulo, valor: numeroBR.format(c.valor as number) }));
  if (investimento !== null) {
    configuracoes.push({ rotulo: "Investimento total", valor: formatarReais(investimento) });
  }
  if (redes.length > 0) configuracoes.push({ rotulo: "Redes", valor: redes.join(", ") });
  for (const extra of lista<Record<string, unknown>>(respostas, "tpago.configExtras")) {
    const rotulo = String(extra.rotulo ?? "").trim();
    const valor = String(extra.valor ?? "").trim();
    if (rotulo !== "" && valor !== "") configuracoes.push({ rotulo, valor });
  }

  const bigNumbers = numerosParaTemplate(lista(respostas, "tpago.bigNumbers"));

  const textoOutraRede = texto(respostas, "tpago.redesOutra");
  const redesLegiveis = (valor: unknown) =>
    (Array.isArray(valor) ? (valor as string[]) : [])
      .map((rede) => (rede === "Outra" ? textoOutraRede : rede))
      .filter((rede) => rede.trim() !== "");
  const objetivoLegivel = (item: Record<string, unknown>) =>
    String(item.objetivo ?? "") === "Outro" ? String(item.objetivoOutro ?? "") : String(item.objetivo ?? "");

  const destaques = lista<Record<string, unknown>>(respostas, "tpago.destaques")
    .map((c) => ({
      nome: String(c.nome ?? "").trim(),
      redes: redesLegiveis(c.redes),
      objetivo: objetivoLegivel(c),
      periodo: String(c.periodo ?? "").trim(),
      numeros: numerosParaTemplate(Array.isArray(c.numeros) ? (c.numeros as Record<string, unknown>[]) : []),
      resumo: String(c.resumo ?? "").trim(),
    }))
    .filter((c) => c.nome !== "");

  const outras = lista<Record<string, unknown>>(respostas, "tpago.outras")
    .map((c) => ({
      nome: String(c.nome ?? "").trim(),
      redes: redesLegiveis(c.redes),
      objetivo: objetivoLegivel(c),
    }))
    .filter((c) => c.nome !== "");

  // Sem "Outras campanhas" listadas, mas com mais campanhas no total do que em
  // destaque: a diferença vira uma frase automática. N <= 0 não mostra nada.
  const totalCampanhas = numeroOuNull(respostas, "tpago.numCampanhas");
  const restantes = totalCampanhas !== null ? totalCampanhas - destaques.length : 0;
  const fraseOutras =
    outras.length === 0 && restantes > 0
      ? `Além das campanhas em destaque, foram realizadas outras ${numeroBR.format(restantes)} campanhas ao longo do ano.`
      : "";

  // Perfil do público só existe quando LinkedIn está marcado nas redes.
  const grupos: { categoria: string; itens: { item: string; valor: string }[] }[] = [];
  if (lista<string>(respostas, "tpago.redes").includes("LinkedIn")) {
    for (const p of lista<Record<string, unknown>>(respostas, "tpago.publico")) {
      const categoria = String(p.categoria ?? "").trim();
      const item = String(p.item ?? "").trim();
      if (categoria === "" || item === "") continue;
      let grupo = grupos.find((g) => g.categoria === categoria);
      if (!grupo) {
        grupo = { categoria, itens: [] };
        grupos.push(grupo);
      }
      grupo.itens.push({ item, valor: String(p.valor ?? "") });
    }
  }

  return {
    titulo: texto(respostas, "tpago.titulo", "Relatório de resultados de campanhas patrocinadas"),
    periodo: texto(respostas, "tpago.periodo"),
    redes,
    objetivos,
    configuracoes,
    bigNumbers,
    destaques,
    outras,
    fraseOutras,
    publico: grupos,
    analise: texto(respostas, "tpago.analise"),
  };
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
      frentes: [...lista<string>(respostas, "cliente.frentes"), texto(respostas, "cliente.frentesOutras")]
        .filter((frente) => frente.trim() !== "")
        .join(" · "),
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
        metricas: metricasSitePreenchidas(respostas),
        leitura: texto(respostas, "digital.site.leitura"),
      },
      canais: canaisParaTemplate(respostas),
    },
    traficoPago: trafegoPagoParaTemplate(respostas),
    valor: {
      titulo: texto(respostas, "valor.titulo", "O que a LETS executou"),
      entregas: lista(respostas, "valor.entregas"),
      time: lista(respostas, "valor.time"),
    },
    imprensa: {
      titulo: texto(respostas, "imprensa.titulo", "Presença espontânea"),
      insercoes: numeroOuNull(respostas, "imprensa.insercoes"),
      leitura: texto(respostas, "imprensa.leitura"),
      principais: materiasPreenchidas(respostas),
    },
    rankings: {
      titulo: texto(respostas, "rankings.titulo", "Validação externa"),
      itens: lista(respostas, "rankings"),
    },
    destaques: {
      frase: texto(respostas, "destaques.frase", "Os momentos que moveram o ponteiro"),
      entregaGrowth: texto(respostas, "destaques.entregaGrowth"),
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
