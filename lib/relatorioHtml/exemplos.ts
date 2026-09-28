import type { RecorteExemplo } from "@/lib/relatorioHtml/modoPrevia";

// Respostas 100% fictícias, no mesmo formato que o formulário salva. Passam
// pelo mesmo montarDados + template do relatório real, então o exemplo de
// cada seção sempre acompanha o layout atual — sem prints desatualizados.
export const CLIENTE_EXEMPLO = { cliente: "Escritório Exemplo Advogados", ano: 2026 };

export const RESPOSTAS_EXEMPLO: Record<string, unknown> = {
  secoes: [
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
  ],

  "cliente.nome": "Escritório Exemplo Advogados",
  "cliente.ano": 2026,
  "cliente.subtitulo":
    "Um ano de construção de reputação, autoridade técnica e crescimento consistente da marca no mercado jurídico.",
  "cliente.inicioParceria": "Março de 2023",
  "cliente.consultorResponsavel": "Nome do Consultor",
  "cliente.frentes": ["Marketing & Comunicação", "Imprensa", "Rankings"],

  "valor.entregas": [
    { qtd: "186", un: "", oq: "peças de conteúdo produzidas entre artigos, posts, cards e roteiros" },
    { qtd: "96", un: "", oq: "inserções conquistadas em imprensa espontânea" },
    { qtd: "42", un: "", oq: "submissões a rankings nacionais e internacionais" },
    { qtd: "24", un: "", oq: "reuniões estratégicas com o comitê de marketing" },
    { qtd: "11", un: "", oq: "treinamentos com sócios em LinkedIn, mídia e conteúdo" },
    { qtd: "1.240", un: "h", oq: "horas de consultoria dedicadas à conta" },
  ],
  "valor.time": [
    { nome: "Ana Souza", papelNaConta: "Consultora responsável" },
    { nome: "Bruno Lima", papelNaConta: "Conteúdo" },
    { nome: "Carla Dias", papelNaConta: "Assessoria de imprensa" },
    { nome: "Diego Rocha", papelNaConta: "Design" },
  ],

  "resumo.texto":
    "2026 foi o ano em que a presença digital do escritório deixou de ser institucional e passou a gerar demanda qualificada. O tráfego orgânico cresceu 84%, as menções em imprensa dobraram e o escritório entrou em três novos rankings.",
  "resumo.kpis": [
    { label: "Sessões no site", valor: "148", sufixo: "k", variacao: 84, nota: "Crescimento puxado por busca orgânica" },
    { label: "Inserções na imprensa", valor: "96", sufixo: "", variacao: 118, nota: "44 veículos distintos" },
    { label: "Seguidores no LinkedIn", valor: "18,4", sufixo: "k", variacao: 61, nota: "Página do escritório" },
    { label: "Rankings conquistados", valor: "9", sufixo: "", variacao: 50, nota: "Três novas entradas" },
    { label: "Leads qualificados", valor: "213", sufixo: "", variacao: 37, nota: "Formulário do site e WhatsApp" },
    { label: "Taxa de conversão", valor: "1,8", sufixo: "%", variacao: -4, nota: "Leve queda frente a 2025" },
  ],

  "digital.site.metricas": [
    { label: "Usuários únicos", valor: "96,2 mil", variacao: 79 },
    { label: "Páginas por sessão", valor: "3,4", variacao: 22 },
    { label: "Tempo médio na página", valor: "2m 51s", variacao: 35 },
    { label: "Taxa de conversão", valor: "1,8%", variacao: 12 },
  ],
  "digital.site.leitura":
    "O blog jurídico responde hoje por 71% do tráfego total. As três páginas mais visitadas do ano são artigos técnicos assinados por sócios.",
  "digital.canais": [
    {
      nome: "LinkedIn",
      metricas: [
        { label: "Seguidores", valorAtual: 18400, valorAnterior: 11400 },
        { label: "Impressões", valorAtual: 184000, valorAnterior: 96000 },
      ],
      leitura: "Posts com opinião técnica dos sócios performam 3 vezes melhor que posts institucionais.",
    },
    {
      nome: "Instagram",
      metricas: [
        { label: "Seguidores", valorAtual: 6380, valorAnterior: 4200 },
        { label: "Alcance", valorAtual: 312000, valorAnterior: 216000 },
      ],
      leitura: "Bastidores e cultura interna sustentam o canal.",
    },
  ],

  "tpago.periodo": "Janeiro a dezembro de 2026",
  "tpago.redes": ["LinkedIn", "Google Ads"],
  "tpago.objetivos": [
    {
      objetivo: "Geração de leads para demanda de busca ativa",
      descricao: "Captar contatos de empresas buscando assessoria tributária.",
    },
    { objetivo: "Reconhecimento de marca", descricao: "" },
  ],
  "tpago.numCampanhas": 8,
  "tpago.numAnuncios": 34,
  "tpago.investimento": 48000,
  "tpago.bigNumbers": [
    { tipo: "numero", valor: 6000, referente: "cliques no site" },
    { tipo: "aumentoPorcentagem", valor: 50, referente: "em leads", comparadoA: "comparado a 2025" },
    { tipo: "porcentagem", valor: 12, referente: "de taxa de conversão" },
  ],
  "tpago.destaques": [
    {
      nome: "Campanha Reforma Tributária",
      redes: ["LinkedIn"],
      objetivo: "Geração de leads para tema em alta / demanda do momento",
      periodo: "Março a junho",
      numeros: [
        { tipo: "numero", valor: 142, referente: "leads qualificados" },
        { tipo: "aumentoNumero", valor: 100000, referente: "impressões", comparadoA: "comparado à campanha anterior" },
      ],
      resumo: "Série de anúncios com artigos dos sócios sobre a reforma, direcionada a diretores financeiros.",
    },
  ],
  "tpago.publico": [
    { categoria: "Cargos", item: "Diretor financeiro", valor: "32%" },
    { categoria: "Cargos", item: "Gerente jurídico", valor: "21%" },
    { categoria: "Setores", item: "Indústria", valor: "28%" },
    { categoria: "Setores", item: "Serviços financeiros", valor: "19%" },
  ],
  "tpago.analise":
    "As campanhas de busca ativa trouxeram o menor custo por lead do ano. Para 2027, a recomendação é concentrar verba no LinkedIn nos temas tributários.",

  "imprensa.insercoes": 96,
  "imprensa.veiculos": 44,
  "imprensa.alcanceEstimado": "38 mi",
  "imprensa.valorEquivalente": "R$ 1,2 mi",
  "imprensa.porMes": [4, 6, 9, 7, 8, 11, 6, 9, 10, 8, 12, 6],
  "imprensa.leitura":
    "A presença em imprensa dobrou em relação a 2025, com destaque para veículos econômicos nacionais.",
  "imprensa.principais": [
    { veiculo: "Valor Econômico", titulo: "Os impactos da reforma tributária nas empresas", data: "Mar 2026", url: "" },
    { veiculo: "Folha de S.Paulo", titulo: "Especialista explica novas regras trabalhistas", data: "Jun 2026", url: "" },
    { veiculo: "JOTA", titulo: "Entrevista sobre compliance no setor financeiro", data: "Set 2026", url: "" },
  ],

  rankings: [
    { nome: "Chambers Brazil", categoria: "Tributário" },
    { nome: "Legal 500", categoria: "Contencioso" },
    { nome: "Análise Advocacia", categoria: "Mais admirados" },
  ],

  "destaques.entregaGrowth":
    "A principal entrega de Growth do ano foi a nova landing page de captação, que dobrou a taxa de conversão do site.",
  destaques: [
    {
      titulo: "Seminário de Direito Tributário",
      descricao: "Evento presencial com 180 convidados e transmissão ao vivo no LinkedIn.",
      resultado: "+40 leads qualificados",
      imagem: null,
    },
    {
      titulo: "Lançamento do novo site",
      descricao: "Site reformulado com blog técnico e páginas por área de atuação.",
      resultado: "+84% de tráfego",
      imagem: null,
    },
  ],

  "inteligencia.texto":
    "Os dados do ano guiaram as decisões de conteúdo e mídia — cada ajuste de rota nasceu de uma métrica acompanhada mês a mês.",
  "inteligencia.bullets": [
    { item: "Monitoramento mensal de concorrentes e share of voice" },
    { item: "Dashboard de leads por origem, integrado ao CRM" },
    { item: "Testes A/B nas páginas de conversão" },
  ],

  "planejamento.texto": "Consolidar a autoridade técnica e transformar audiência em demanda qualificada.",
  "planejamento.modo": "trimestres",
  "planejamento.trimestres": [
    { itens: [{ t: "Novo e-book", d: "Material rico sobre reforma tributária." }] },
    { itens: [{ t: "Landing pages por área", d: "Páginas de conversão para as três áreas principais." }] },
    { itens: [{ t: "Podcast institucional", d: "Piloto de seis episódios com convidados." }] },
    { itens: [{ t: "Relatório anual", d: "Consolidação dos resultados do ano." }] },
  ],

  "acompanhamentos.blocos": [
    { frase: "Reuniões trimestrais de resultados com o comitê de marketing." },
    { frase: "Revisão semestral do posicionamento nas redes sociais." },
    { frase: "Acompanhamento mensal dos leads gerados pelo site." },
  ],
};

export type VariacaoExemplo = {
  // Valor do campo controlador que corresponde a esta opção.
  valor: string;
  rotulo: string;
  legenda: string;
  // Respostas que substituem as de RESPOSTAS_EXEMPLO só nesta opção.
  respostas: Record<string, unknown>;
};

export type ExemploBloco = {
  recorte: RecorteExemplo;
  // Uma frase curta dizendo o que o consultor está vendo no exemplo.
  legenda: string;
  // Blocos em que o consultor escolhe entre formatos diferentes mostram um
  // exemplo de cada; a aba inicial segue o que já está escolhido no campo.
  variacoes?: { campoId: string; opcoes: VariacaoExemplo[] };
};

// Qual pedaço do relatório cada bloco do formulário preenche. Blocos 5 e 6
// dividem a mesma seção "digital" — cada um esconde a parte do outro.
export const EXEMPLO_POR_BLOCO: Record<string, ExemploBloco> = {
  b1: {
    recorte: { secao: "capa" },
    legenda: "A capa do relatório: nome do cliente, frase de abertura, início da parceria, frentes ativas, consultor e logo.",
  },
  b2: {
    recorte: { secao: "pilares" },
    legenda: "Texto fixo com as frentes da LETS — aparece igual para todos os clientes.",
  },
  b3: {
    recorte: { secao: "valor" },
    legenda: "As entregas do ano em números (quantidade + descrição curta) e o time dedicado à conta.",
  },
  b4: {
    recorte: { secao: "resumo" },
    legenda: "Um parágrafo de leitura do ano e os números principais, com variação em relação ao ano anterior.",
  },
  b5: {
    recorte: { secao: "digital", cssExtra: "#digital .wrap>.grid{display:none!important}" },
    legenda: "Métricas do site com a variação em % frente ao ano anterior, e uma leitura curta do que os números mostram.",
  },
  b6: {
    recorte: { secao: "digital", cssExtra: "#digital .wrap>.card{display:none!important}" },
    legenda: "Um card por rede: métricas com valor deste ano e do anterior (a variação é calculada sozinha) e uma leitura.",
  },
  b7: {
    recorte: { secao: "traficoPago" },
    legenda: "Objetivos, configurações, big numbers, campanhas em destaque, público do LinkedIn e análise geral.",
  },
  b8: {
    recorte: { secao: "imprensa" },
    legenda: "Totais da assessoria, gráfico mês a mês (opcional) e as principais matérias com veículo, título e data.",
  },
  b9: {
    recorte: { secao: "rankings" },
    legenda: "Um card por ranking ou prêmio, com a categoria embaixo quando houver.",
  },
  b10: {
    recorte: { secao: "destaques" },
    legenda: "Cada momento do ano com título, descrição, resultado em destaque e imagem 4:3 ao lado.",
  },
  b11: {
    recorte: { secao: "inteligenciaAplicada" },
    legenda: "Um texto introdutório e/ou uma lista de tópicos.",
  },
  b12: {
    recorte: { secao: "plano" },
    legenda: "As iniciativas do próximo ano.",
    variacoes: {
      campoId: "planejamento.modo",
      opcoes: [
        {
          valor: "trimestres",
          rotulo: "Por trimestre",
          legenda: "Quatro colunas fixas (1º a 4º trimestre), com as iniciativas de cada uma: título + descrição curta.",
          respostas: { "planejamento.modo": "trimestres" },
        },
        {
          valor: "blocos",
          rotulo: "Em blocos livres",
          legenda: "Um card por iniciativa, sem dividir por trimestre: título + descrição.",
          respostas: {
            "planejamento.modo": "blocos",
            "planejamento.blocos": [
              { titulo: "Novo e-book", texto: "Material rico sobre a reforma tributária para captação de leads." },
              { titulo: "Landing pages por área", texto: "Páginas de conversão para as três áreas principais." },
              { titulo: "Podcast institucional", texto: "Piloto de seis episódios com convidados do mercado." },
            ],
          },
        },
      ],
    },
  },
  b13: {
    recorte: { secao: "acompanhamentosFuturos" },
    legenda: "Um card por frase de acompanhamento combinado com o cliente.",
  },
  b14: {
    recorte: { secao: "encerramento" },
    legenda: "Frase de encerramento fixa — igual para todos os clientes.",
  },
};
