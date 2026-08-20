"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { normalizarOpcoes, type Campo } from "@/lib/schema";

export function CampoMultiSelecao({
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
    campo.padrao ?? [],
  );
  const selecionados = Array.isArray(valor) ? (valor as string[]) : [];

  function alternar(valorOpcao: string) {
    const novoConjunto = selecionados.includes(valorOpcao)
      ? selecionados.filter((item) => item !== valorOpcao)
      : [...selecionados, valorOpcao];
    setValor(novoConjunto);
  }

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <div className="flex flex-col gap-1">
        {opcoes.map((opcao) => (
          <label key={opcao.valor} className="flex items-start gap-3 py-1.5">
            <input
              type="checkbox"
              checked={selecionados.includes(opcao.valor)}
              onChange={() => alternar(opcao.valor)}
              className="mt-1 h-4 w-4 shrink-0 accent-vermelho"
            />
            <span>
              <span className="text-tinta">
                {opcao.rotulo}
                {opcao.recomendado && (
                  <span className="rotulo ml-2 text-cinza">recomendado</span>
                )}
              </span>
              {opcao.ajuda && <span className="block text-sm text-cinza">{opcao.ajuda}</span>}
            </span>
          </label>
        ))}
      </div>
    </CampoWrapper>
  );
}
