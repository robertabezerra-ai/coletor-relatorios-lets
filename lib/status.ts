import type { RelatorioStatus } from "@/lib/types";

export const ROTULO_STATUS: Record<RelatorioStatus, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  concluido: "Concluído",
  arquivado: "Arquivado",
};

export const STATUS_OPCOES: RelatorioStatus[] = [
  "rascunho",
  "em_revisao",
  "concluido",
  "arquivado",
];
