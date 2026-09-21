"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import type { Campo } from "@/lib/schema";

export function CampoNumero({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const [valor, setValor, conflito, resolverConflito] = useAutosaveCampo(
    relatorioId,
    campo.id,
    campo.padrao ?? null,
  );

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <div className="flex items-stretch">
        {campo.moeda && (
          <span className="flex items-center border border-r-0 border-tinta/20 bg-bege px-3 text-cinza">
            R$
          </span>
        )}
        <input
          id={campo.id}
          type="number"
          value={valor === null || valor === undefined ? "" : (valor as number)}
          onChange={(event) =>
            setValor(event.target.value === "" ? null : Number(event.target.value))
          }
          className="min-w-0 flex-1 border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
        />
      </div>
    </CampoWrapper>
  );
}
