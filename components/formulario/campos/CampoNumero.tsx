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
      <input
        id={campo.id}
        type="number"
        value={valor === null || valor === undefined ? "" : (valor as number)}
        onChange={(event) =>
          setValor(event.target.value === "" ? null : Number(event.target.value))
        }
        className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
      />
    </CampoWrapper>
  );
}
