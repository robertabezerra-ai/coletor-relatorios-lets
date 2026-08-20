"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { TabelaInput, linhaVaziaTabela, type LinhaTabela } from "@/components/formulario/campos/TabelaInput";
import type { Campo } from "@/lib/schema";

export function CampoTabela({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const colunas = campo.colunas ?? [];
  const minimo = campo.min ?? 1;

  const [valor, setValor, conflito, resolverConflito] = useAutosaveCampo(
    relatorioId,
    campo.id,
    campo.padrao ?? Array.from({ length: minimo }, () => linhaVaziaTabela(colunas)),
  );
  const linhas = Array.isArray(valor) ? (valor as LinhaTabela[]) : [];

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <TabelaInput
        idPrefix={campo.id}
        relatorioId={relatorioId}
        colunas={colunas}
        valor={linhas}
        onChange={setValor}
        max={campo.max}
      />
    </CampoWrapper>
  );
}
