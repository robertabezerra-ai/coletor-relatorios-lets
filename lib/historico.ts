import { listarBlocos } from "@/lib/schema";
import type { PerguntaCustom } from "@/lib/perguntasCustom";

export type CampoResolvido = { blocoId: string; blocoTitulo: string; rotulo: string };

export function resolverCampo(campoId: string, perguntasCustom: PerguntaCustom[]): CampoResolvido {
  if (campoId.startsWith("custom:")) {
    const id = campoId.slice("custom:".length);
    const pergunta = perguntasCustom.find((item) => item.id === id);
    return {
      blocoId: "b13",
      blocoTitulo: "Perguntas personalizadas",
      rotulo: pergunta?.rotulo ?? "Pergunta removida",
    };
  }

  for (const bloco of listarBlocos()) {
    const campo = bloco.campos.find((item) => item.id === campoId);
    if (campo) return { blocoId: bloco.id, blocoTitulo: bloco.titulo, rotulo: campo.rotulo };
  }

  return { blocoId: "", blocoTitulo: "Outro", rotulo: campoId };
}
