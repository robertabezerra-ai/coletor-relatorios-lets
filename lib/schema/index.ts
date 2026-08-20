import schemaJson from "@/perguntas.schema.json";
import type { Bloco, FormularioSchema, OpcaoCampo } from "@/lib/schema/types";

export const schema = schemaJson as FormularioSchema;

export function listarBlocos(): Bloco[] {
  return schema.blocos;
}

export function buscarBloco(blocoId: string): Bloco | undefined {
  return schema.blocos.find((bloco) => bloco.id === blocoId);
}

export function numeroDoBloco(blocoId: string): string {
  return blocoId.replace(/^b/, "");
}

export function blocosVisiveis(blocos: Bloco[], secoesSelecionadas: string[]): Bloco[] {
  return blocos.filter(
    (bloco) => !bloco.dependeDeSecao || secoesSelecionadas.includes(bloco.dependeDeSecao),
  );
}

const ID_BLOCO_SECOES = "b0";
const ID_CAMPO_SECOES = "secoes";

export function obterSecoesSelecionadas(respostas: Record<string, unknown>): string[] {
  const valor = respostas[ID_CAMPO_SECOES];
  if (Array.isArray(valor)) return valor as string[];

  const campoSecoes = buscarBloco(ID_BLOCO_SECOES)?.campos.find(
    (campo) => campo.id === ID_CAMPO_SECOES,
  );
  return Array.isArray(campoSecoes?.padrao) ? (campoSecoes.padrao as string[]) : [];
}

export type OpcaoNormalizada = {
  valor: string;
  rotulo: string;
  ajuda?: string;
  recomendado?: boolean;
};

export function normalizarOpcoes(opcoes: OpcaoCampo[] | undefined): OpcaoNormalizada[] {
  if (!opcoes) return [];
  return opcoes.map((opcao) =>
    typeof opcao === "string" ? { valor: opcao, rotulo: opcao || "(vazio)" } : opcao,
  );
}

export type { Bloco, Campo, ColunaTabela, FormularioSchema, OpcaoCampo } from "@/lib/schema/types";
