"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { EQUIPE_LETS } from "@/lib/equipeLets";
import type { Campo } from "@/lib/schema";

export function CampoTexto({
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
  const ehEquipeLets = campo.autocompletar === "equipeLets";
  const listaId = `${campo.id}-sugestoes`;
  const temLista = ehEquipeLets || Boolean(campo.sugestoes);

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <input
        id={campo.id}
        type="text"
        list={temLista ? listaId : undefined}
        value={(valor as string) ?? ""}
        onChange={(event) => setValor(event.target.value)}
        className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
      />
      {ehEquipeLets && (
        <datalist id={listaId}>
          {EQUIPE_LETS.map((membro) => (
            <option key={membro.nome} value={membro.nome} />
          ))}
        </datalist>
      )}
      {!ehEquipeLets && campo.sugestoes && (
        <datalist id={listaId}>
          {campo.sugestoes.map((sugestao) => (
            <option key={sugestao} value={sugestao} />
          ))}
        </datalist>
      )}
    </CampoWrapper>
  );
}
