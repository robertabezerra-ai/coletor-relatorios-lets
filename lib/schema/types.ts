export type NivelCampo = "essencial" | "importante" | "opcional";

export type TipoCampo =
  | "texto"
  | "textoLongo"
  | "numero"
  | "serie12"
  | "selecao"
  | "multiSelecao"
  | "tabela"
  | "grupoRepetivel"
  | "grupoFixo"
  | "imagem"
  | "pessoas";

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
  blocos: Bloco[];
};
