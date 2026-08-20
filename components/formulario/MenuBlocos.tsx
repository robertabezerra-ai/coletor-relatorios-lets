"use client";

import { numeroDoBloco, type Bloco } from "@/lib/schema";
import type { EstadoBloco } from "@/lib/progresso";

export function MenuBlocos({
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
    <nav className="flex flex-col gap-1">
      {blocos.map((bloco) => {
        const ativo = bloco.id === blocoAtivoId;
        const estado = progressoPorBloco[bloco.id]?.estado ?? "vazio";
        return (
          <button
            key={bloco.id}
            onClick={() => onSelecionar(bloco.id)}
            aria-current={ativo}
            className={`flex items-center gap-3 border-l-2 px-3 py-2 text-left ${
              ativo ? "border-vermelho bg-bege" : "border-transparent hover:bg-bege/60"
            }`}
          >
            <span className="rotulo text-cinza">{numeroDoBloco(bloco.id)}</span>
            <span className={`flex-1 ${ativo ? "text-tinta" : "text-cinza"}`}>
              {bloco.titulo}
            </span>
            <PontoStatus estado={estado} />
          </button>
        );
      })}
    </nav>
  );
}

function PontoStatus({ estado }: { estado: EstadoBloco }) {
  const rotulo = { vazio: "vazio", parcial: "parcial", completo: "completo" }[estado];

  if (estado === "completo") {
    return <span aria-label={rotulo} className="h-2 w-2 shrink-0 rounded-full bg-vermelho" />;
  }
  if (estado === "parcial") {
    return (
      <span
        aria-label={rotulo}
        className="h-2 w-2 shrink-0 rounded-full border border-vermelho"
      />
    );
  }
  return <span aria-label={rotulo} className="h-2 w-2 shrink-0 rounded-full border border-tinta/20" />;
}
