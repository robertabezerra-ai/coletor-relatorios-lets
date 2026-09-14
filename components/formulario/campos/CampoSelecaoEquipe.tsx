"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { EQUIPE_LETS } from "@/lib/equipeLets";
import type { Campo } from "@/lib/schema";

// Igual ao CampoSelecao, mas as opções vêm direto do diretório do time LETS
// em vez do schema — trava o campo pra não aceitar nome fora da lista.
export function CampoSelecaoEquipe({
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

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <select
        id={campo.id}
        value={(valor as string) ?? ""}
        onChange={(event) => setValor(event.target.value)}
        className="border border-tinta/20 bg-white px-3 py-2 text-tinta"
      >
        <option value="">Selecione…</option>
        {EQUIPE_LETS.map((membro) => (
          <option key={membro.nome} value={membro.nome}>
            {membro.nome} — {membro.cargo}
          </option>
        ))}
      </select>
    </CampoWrapper>
  );
}
