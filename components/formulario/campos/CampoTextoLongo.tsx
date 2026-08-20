"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import type { Campo } from "@/lib/schema";

export function CampoTextoLongo({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const [valor, setValor, conflito, resolverConflito] = useAutosaveCampo(
    relatorioId,
    campo.id,
    campo.padrao ?? "",
  );
  const texto = (valor as string) ?? "";

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <textarea
        id={campo.id}
        rows={4}
        value={texto}
        onChange={(event) => setValor(event.target.value)}
        maxLength={campo.limite}
        className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
      />
      {campo.limite && (
        <p className="self-end text-xs text-cinza">
          {texto.length}/{campo.limite}
        </p>
      )}
    </CampoWrapper>
  );
}
