import type { Campo } from "@/lib/schema";

export type ModeloPerguntaCustom = "destaque" | "numero" | "texto" | "lista";

export type PerguntaCustom = {
  id: string;
  relatorio_id: string;
  rotulo: string;
  formato: string | null;
  modelo: ModeloPerguntaCustom;
  ordem: number;
};

export const MODELOS_CUSTOM: Record<
  ModeloPerguntaCustom,
  { rotulo: string; descricao: string; campos: Campo[] }
> = {
  destaque: {
    rotulo: "Destaque visual",
    descricao: "Imagem + legenda curta. Para mostrar uma foto ou print com contexto.",
    campos: [
      { id: "imagem", rotulo: "Imagem", tipo: "imagem", nivel: "opcional" },
      { id: "texto", rotulo: "Legenda", tipo: "texto", nivel: "opcional" },
    ],
  },
  numero: {
    rotulo: "Número em destaque",
    descricao: "Um número grande + explicação. Para destacar uma métrica fora do padrão.",
    campos: [
      { id: "numero", rotulo: "Número", tipo: "numero", nivel: "opcional" },
      { id: "texto", rotulo: "Explicação", tipo: "texto", nivel: "opcional" },
    ],
  },
  texto: {
    rotulo: "Texto livre",
    descricao: "Um texto longo. Para contar uma história ou registrar uma observação.",
    campos: [{ id: "texto", rotulo: "Texto", tipo: "textoLongo", nivel: "opcional" }],
  },
  lista: {
    rotulo: "Lista / comparativo",
    descricao: "Vários itens curtos — adiciona quantos quiser. Para listar pontos ou aprendizados.",
    campos: [
      {
        id: "itens",
        rotulo: "Itens",
        tipo: "tabela",
        nivel: "opcional",
        min: 1,
        colunas: [{ id: "item", rotulo: "Item", tipo: "texto" }],
      },
    ],
  },
};

export function perguntaCustomParaCampo(pergunta: PerguntaCustom): Campo {
  const modeloDef = MODELOS_CUSTOM[pergunta.modelo] ?? MODELOS_CUSTOM.texto;
  return {
    id: `custom:${pergunta.id}`,
    rotulo: pergunta.rotulo,
    tipo: "grupoFixo",
    formato: pergunta.formato ?? undefined,
    nivel: "opcional",
    campos: modeloDef.campos,
  };
}
