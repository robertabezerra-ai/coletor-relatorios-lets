export type SquadTipo = "squad" | "chapter";

export type RelatorioStatus = "rascunho" | "em_revisao" | "concluido" | "arquivado";

export type Squad = {
  id: string;
  nome: string;
  tipo: SquadTipo;
  cor: string;
  arquivado: boolean;
  criado_em: string;
};

export type RelatorioPainel = {
  id: string;
  cliente: string;
  ano: number;
  squad_id: string;
  status: RelatorioStatus;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  criado_por_nome: string | null;
  ultima_edicao_em: string | null;
  ultima_edicao_por: string | null;
  ultima_edicao_nome: string | null;
};
