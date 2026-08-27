import { campoVisivel, type Bloco, type Campo } from "@/lib/schema";

export type EstadoBloco = "vazio" | "parcial" | "completo";

const PESO_NIVEL: Record<string, number> = {
  essencial: 3,
  importante: 1,
  opcional: 0,
};

export function campoPreenchido(campo: Campo, valor: unknown): boolean {
  if (campo.tipo === "tabela" || campo.tipo === "pessoas" || campo.tipo === "grupoRepetivel") {
    return Array.isArray(valor) && valor.length >= (campo.min ?? 1);
  }

  if (campo.tipo === "serie12") {
    return (
      Array.isArray(valor) &&
      valor.length === 12 &&
      valor.every((mes) => mes !== null && mes !== undefined && mes !== "")
    );
  }

  if (campo.tipo === "multiSelecao") {
    return Array.isArray(valor) && valor.length > 0;
  }

  if (campo.tipo === "imagem") {
    if (campo.multiplo) return Array.isArray(valor) && valor.length > 0;
    return Boolean(valor && typeof valor === "object" && (valor as { caminho?: string }).caminho);
  }

  if (campo.tipo === "grupoFixo") {
    if (!valor || typeof valor !== "object") return false;
    const item = valor as Record<string, unknown>;
    return (campo.campos ?? []).some((subCampo) => campoPreenchido(subCampo, item[subCampo.id]));
  }

  return valor !== null && valor !== undefined && String(valor).trim() !== "";
}

type PesoAcumulado = { peso: number; pesoPreenchido: number };

function acumularPeso(bloco: Bloco, respostas: Record<string, unknown>): PesoAcumulado {
  let peso = 0;
  let pesoPreenchido = 0;

  for (const campo of bloco.campos) {
    if (!campoVisivel(campo, bloco, respostas)) continue;
    const pesoDoCampo = PESO_NIVEL[campo.nivel ?? "opcional"] ?? 0;
    if (pesoDoCampo === 0) continue;

    peso += pesoDoCampo;
    if (campoPreenchido(campo, respostas[campo.id])) pesoPreenchido += pesoDoCampo;
  }

  return { peso, pesoPreenchido };
}

function paraPercentual({ peso, pesoPreenchido }: PesoAcumulado): number {
  if (peso === 0) return 100;
  return Math.round((pesoPreenchido / peso) * 100);
}

function paraEstado({ peso, pesoPreenchido }: PesoAcumulado): EstadoBloco {
  if (peso === 0 || pesoPreenchido === peso) return "completo";
  if (pesoPreenchido === 0) return "vazio";
  return "parcial";
}

export function calcularProgresso(blocosVisiveis: Bloco[], respostas: Record<string, unknown>) {
  const porBloco: Record<string, { percentual: number; estado: EstadoBloco }> = {};
  let pesoTotal = 0;
  let pesoPreenchidoTotal = 0;

  for (const bloco of blocosVisiveis) {
    const acumulado = acumularPeso(bloco, respostas);
    porBloco[bloco.id] = { percentual: paraPercentual(acumulado), estado: paraEstado(acumulado) };
    pesoTotal += acumulado.peso;
    pesoPreenchidoTotal += acumulado.pesoPreenchido;
  }

  const percentualGeral = pesoTotal === 0 ? 0 : Math.round((pesoPreenchidoTotal / pesoTotal) * 100);

  return { percentualGeral, porBloco };
}

export type CampoEssencialVazio = { blocoId: string; blocoTitulo: string; campo: Campo };

export function camposEssenciaisVazios(
  blocosVisiveis: Bloco[],
  respostas: Record<string, unknown>,
): CampoEssencialVazio[] {
  const vazios: CampoEssencialVazio[] = [];

  for (const bloco of blocosVisiveis) {
    for (const campo of bloco.campos) {
      if (!campoVisivel(campo, bloco, respostas)) continue;
      if (campo.nivel === "essencial" && !campoPreenchido(campo, respostas[campo.id])) {
        vazios.push({ blocoId: bloco.id, blocoTitulo: bloco.titulo, campo });
      }
    }
  }

  return vazios;
}
