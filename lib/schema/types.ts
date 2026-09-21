export type NivelCampo = "essencial" | "importante" | "opcional";

export type TipoCampo =
  | "texto"
  | "textoLongo"
  | "numero"
  | "serie12"
  | "selecao"
  | "selecaoEquipe"
  | "multiSelecao"
  | "tabela"
  | "grupoRepetivel"
  | "imagem"
  | "pessoas"
  | "cabecalho";

export type OpcaoCampo =
  | string
  | { valor: string; rotulo: string; ajuda?: string; recomendado?: boolean };

export type ColunaTabela = {
  id: string;
  rotulo: string;
  tipo: string;
  opcoes?: OpcaoCampo[];
  dica?: string;
  autocompletar?: string;
  sugestoes?: string[];
  // Sugestões que variam de acordo com outro campo do mesmo item (ex.: a
  // lista de métricas sugeridas muda se o canal é Instagram ou LinkedIn).
  // Sem valor correspondente no mapa, cai pra `sugestoes` acima.
  sugestoesPorReferencia?: { campoId: string; mapa: Record<string, string[]> };
  validacao?: string;
};

export type Campo = {
  id: string;
  rotulo: string;
  tipo: TipoCampo | string;
  nivel?: NivelCampo;
  formato?: string;
  padrao?: unknown;
  opcoes?: OpcaoCampo[];
  limite?: number;
  min?: number;
  max?: number;
  colunas?: ColunaTabela[];
  campos?: Campo[];
  rotuloItem?: string;
  fixo?: boolean;
  itensFixos?: string[];
  autocompletar?: string;
  sugestoes?: string[];
  multiplo?: boolean;
  dica?: string;
  validacao?: string;
  // valorEsperado aceita uma lista; se o campo controlador for uma
  // multiSelecao, basta que UM dos valores esperados esteja marcado.
  mostrarSe?: { campoId: string; valorEsperado: string | string[] };
  // selecao: acrescenta a opção "Outro", que abre um campo de texto livre.
  permiteOutro?: boolean;
  // numero: mostra o campo como valor em reais (R$).
  moeda?: boolean;
  // Texto do botão de adicionar em tabelas/grupos repetíveis ("Adicionar objetivo").
  rotuloAdicionar?: string;
  // Nome de uma lista em `listas` (topo do schema) — assim a mesma lista de
  // opções serve a vários selects sem ser repetida.
  opcoesLista?: string;
  // multiSelecao dentro de grupo repetível: as opções são as marcadas em outro
  // campo do formulário (ex.: as redes escolhidas na Abertura). Um campo
  // "<id>Outra" guarda o texto quando a opção "Outra" está marcada.
  opcoesDoCampo?: string;
  // grupoRepetivel: mostra um aviso discreto (sem bloquear) ao passar da quantidade.
  avisoAcima?: { quantidade: number; texto: string };
};

export type Bloco = {
  id: string;
  titulo: string;
  descricao?: string;
  dependeDeSecao?: string;
  somenteLeitura?: boolean;
  customizavel?: boolean;
  campos: Campo[];
};

export type FormularioSchema = {
  versao: string;
  descricao: string;
  niveis: Record<string, string>;
  tipos: Record<string, string>;
  listas?: Record<string, OpcaoCampo[]>;
  blocos: Bloco[];
};
