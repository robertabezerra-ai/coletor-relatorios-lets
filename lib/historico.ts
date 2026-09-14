import { listarBlocos } from "@/lib/schema";

export type CampoResolvido = { blocoId: string; blocoTitulo: string; rotulo: string };

export function resolverCampo(campoId: string): CampoResolvido {
  for (const bloco of listarBlocos()) {
    const campo = bloco.campos.find((item) => item.id === campoId);
    if (campo) return { blocoId: bloco.id, blocoTitulo: bloco.titulo, rotulo: campo.rotulo };
  }

  return { blocoId: "", blocoTitulo: "Outro", rotulo: campoId };
}
