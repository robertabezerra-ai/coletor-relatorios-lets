"use client";

import { numeroDoBloco, type Bloco } from "@/lib/schema";
import type { EstadoBloco } from "@/lib/progresso";

const ROTULO_ESTADO: Record<EstadoBloco, string> = {
  vazio: "vazio",
  parcial: "parcial",
  completo: "completo",
};

export function SeletorBlocosMobile({
  blocos,
  blocoAtivoId,
  onSelecionar,
  progressoPorBloco,
}: {
  blocos: Bloco[];
  blocoAtivoId: string;
  onSelecionar: (blocoId: string) => void;
  progressoPorBloco: Record<string, { percentual: number; estado: EstadoBloco }>;
}) {
  return (
    <label className="flex flex-col gap-1 border-b border-tinta/10 px-4 py-3 md:hidden">
      <span className="rotulo text-cinza">Bloco</span>
      <select
        value={blocoAtivoId}
        onChange={(event) => onSelecionar(event.target.value)}
        className="border border-tinta/20 bg-white px-3 py-2 text-tinta"
      >
        {blocos.map((bloco) => {
          const estado = progressoPorBloco[bloco.id]?.estado ?? "vazio";
          return (
            <option key={bloco.id} value={bloco.id}>
              {numeroDoBloco(bloco.id)} · {bloco.titulo} ({ROTULO_ESTADO[estado]})
            </option>
          );
        })}
      </select>
    </label>
  );
}
