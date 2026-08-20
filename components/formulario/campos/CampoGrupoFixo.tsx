"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { ImagemUploadInput, type ImagemValorSimples } from "@/components/formulario/campos/ImagemUploadInput";
import { TabelaInput, type LinhaTabela } from "@/components/formulario/campos/TabelaInput";
import type { Campo } from "@/lib/schema";

type ItemGrupo = Record<string, unknown>;

function itemVazio(camposFilhos: Campo[]): ItemGrupo {
  const item: ItemGrupo = {};
  for (const subCampo of camposFilhos) {
    item[subCampo.id] = subCampo.tipo === "tabela" ? [] : subCampo.tipo === "imagem" ? null : "";
  }
  return item;
}

export function CampoGrupoFixo({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const camposFilhos = campo.campos ?? [];
  const [valor, setValor, conflito, resolverConflito] = useAutosaveCampo(
    relatorioId,
    campo.id,
    campo.padrao ?? itemVazio(camposFilhos),
  );
  const item = valor && typeof valor === "object" ? (valor as ItemGrupo) : itemVazio(camposFilhos);

  function atualizarSubCampo(subCampoId: string, novoValor: unknown) {
    setValor({ ...item, [subCampoId]: novoValor });
  }

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <div className="flex flex-col gap-4">
        {camposFilhos.map((subCampo) => {
          const idSub = `${campo.id}-${subCampo.id}`;

          if (subCampo.tipo === "imagem") {
            return (
              <div key={subCampo.id} className="flex flex-col gap-2">
                <label className="rotulo text-cinza">{subCampo.rotulo}</label>
                <ImagemUploadInput
                  relatorioId={relatorioId}
                  campoId={idSub}
                  valor={item[subCampo.id] as ImagemValorSimples}
                  onChange={(novoValor) => atualizarSubCampo(subCampo.id, novoValor)}
                />
              </div>
            );
          }

          if (subCampo.tipo === "tabela") {
            return (
              <div key={subCampo.id} className="flex flex-col gap-2">
                <label className="rotulo text-cinza">{subCampo.rotulo}</label>
                <TabelaInput
                  idPrefix={idSub}
                  relatorioId={relatorioId}
                  colunas={subCampo.colunas ?? []}
                  valor={Array.isArray(item[subCampo.id]) ? (item[subCampo.id] as LinhaTabela[]) : []}
                  onChange={(novoValor) => atualizarSubCampo(subCampo.id, novoValor)}
                  max={subCampo.max}
                />
              </div>
            );
          }

          if (subCampo.tipo === "textoLongo") {
            return (
              <div key={subCampo.id} className="flex flex-col gap-2">
                <label htmlFor={idSub} className="rotulo text-cinza">
                  {subCampo.rotulo}
                </label>
                <textarea
                  id={idSub}
                  rows={4}
                  value={(item[subCampo.id] as string) ?? ""}
                  onChange={(event) => atualizarSubCampo(subCampo.id, event.target.value)}
                  className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
                />
              </div>
            );
          }

          if (subCampo.tipo === "numero") {
            return (
              <div key={subCampo.id} className="flex flex-col gap-2">
                <label htmlFor={idSub} className="rotulo text-cinza">
                  {subCampo.rotulo}
                </label>
                <input
                  id={idSub}
                  type="number"
                  value={
                    item[subCampo.id] === null || item[subCampo.id] === undefined
                      ? ""
                      : (item[subCampo.id] as number)
                  }
                  onChange={(event) =>
                    atualizarSubCampo(
                      subCampo.id,
                      event.target.value === "" ? null : Number(event.target.value),
                    )
                  }
                  className="w-40 border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
                />
              </div>
            );
          }

          return (
            <div key={subCampo.id} className="flex flex-col gap-2">
              <label htmlFor={idSub} className="rotulo text-cinza">
                {subCampo.rotulo}
              </label>
              <input
                id={idSub}
                type="text"
                value={(item[subCampo.id] as string) ?? ""}
                onChange={(event) => atualizarSubCampo(subCampo.id, event.target.value)}
                className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
              />
            </div>
          );
        })}
      </div>
    </CampoWrapper>
  );
}
