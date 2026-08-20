"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { normalizarOpcoes, type Campo } from "@/lib/schema";

export function CampoSelecao({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const opcoes = normalizarOpcoes(campo.opcoes);
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
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </CampoWrapper>
  );
}
