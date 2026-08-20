"use client";

import { numeroDoBloco } from "@/lib/schema";
import type { CampoEssencialVazio } from "@/lib/progresso";

export function PainelFaltaPreencher({
  itens,
  onIrPara,
}: {
  itens: CampoEssencialVazio[];
  onIrPara: (blocoId: string, campoId: string) => void;
}) {
  return (
    <div className="mx-auto mb-8 flex max-w-2xl flex-col gap-2 border border-vermelho/30 bg-vermelho/5 p-4">
      <p className="rotulo text-vermelho">
        Falta preencher · {itens.length} campo{itens.length > 1 ? "s" : ""} essencial
        {itens.length > 1 ? "is" : ""}
      </p>
      <div className="flex flex-col">
        {itens.map(({ blocoId, blocoTitulo, campo }) => (
          <button
            key={`${blocoId}-${campo.id}`}
            onClick={() => onIrPara(blocoId, campo.id)}
            className="flex items-center gap-2 py-1.5 text-left text-sm text-tinta hover:text-vermelho"
          >
            <span className="text-cinza">
              {numeroDoBloco(blocoId)} · {blocoTitulo}
            </span>
            <span>—</span>
            <span>{campo.rotulo}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
