import schemaJson from "@/perguntas.schema.json";
import type { Bloco, Campo, FormularioSchema, OpcaoCampo } from "@/lib/schema/types";

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

function valorCasaCom(valorAtual: unknown, esperado: string | string[]): boolean {
  const esperados = Array.isArray(esperado) ? esperado : [esperado];
  if (Array.isArray(valorAtual)) return esperados.some((valor) => valorAtual.includes(valor));
  return esperados.includes(String(valorAtual ?? ""));
}

// Um campo com mostrarSe só existe pra ser preenchido quando outro campo do
// mesmo bloco tem um valor específico (ex.: escolher "trimestres" ou
// "blocos" no planejamento). Sem resposta salva ainda, cai no padrão do
// campo controlador.
export function campoVisivel(
  campo: Campo,
  bloco: Bloco,
  respostas: Record<string, unknown>,
): boolean {
  if (!campo.mostrarSe) return true;
  const controlador = bloco.campos.find((c) => c.id === campo.mostrarSe!.campoId);
  const valorAtual = respostas[campo.mostrarSe.campoId] ?? controlador?.padrao ?? "";
  return valorCasaCom(valorAtual, campo.mostrarSe.valorEsperado);
}

// Mesma ideia, mas para um sub-campo dentro de um item de grupo repetível: o
// campo controlador é irmão dele, dentro do mesmo item.
export function subCampoVisivel(subCampo: Campo, item: Record<string, unknown>): boolean {
  if (!subCampo.mostrarSe) return true;
  return valorCasaCom(item[subCampo.mostrarSe.campoId], subCampo.mostrarSe.valorEsperado);
}

export function normalizarOpcoes(opcoes: OpcaoCampo[] | undefined): OpcaoNormalizada[] {
  if (!opcoes) return [];
  return opcoes.map((opcao) =>
    typeof opcao === "string" ? { valor: opcao, rotulo: opcao || "(vazio)" } : opcao,
  );
}

// Opções de um campo: as próprias, ou as de uma lista compartilhada do schema.
export function resolverOpcoes(campo: Pick<Campo, "opcoes" | "opcoesLista">): OpcaoNormalizada[] {
  const opcoes = campo.opcoes ?? (campo.opcoesLista ? schema.listas?.[campo.opcoesLista] : undefined);
  return normalizarOpcoes(opcoes);
}

export type { Bloco, Campo, ColunaTabela, FormularioSchema, OpcaoCampo } from "@/lib/schema/types";
