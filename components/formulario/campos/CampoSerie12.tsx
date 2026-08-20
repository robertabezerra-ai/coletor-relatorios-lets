"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { SerieMensalInput } from "@/components/formulario/campos/SerieMensalInput";
import type { Campo } from "@/lib/schema";

export function CampoSerie12({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const [valor, setValor, conflito, resolverConflito] = useAutosaveCampo(
    relatorioId,
    campo.id,
    campo.padrao ?? Array(12).fill(null),
  );
  const meses = Array.isArray(valor) ? (valor as (number | null)[]) : Array(12).fill(null);

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <SerieMensalInput idPrefix={campo.id} valor={meses} onChange={setValor} />
    </CampoWrapper>
  );
}
