"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { SerieMensalInput } from "@/components/formulario/campos/SerieMensalInput";
import { TabelaInput, linhaVaziaTabela, type LinhaTabela } from "@/components/formulario/campos/TabelaInput";
import { normalizarOpcoes, type Campo } from "@/lib/schema";

type ItemGrupo = Record<string, unknown>;

function itemVazio(camposFilhos: Campo[]): ItemGrupo {
  const item: ItemGrupo = {};
  for (const subCampo of camposFilhos) {
    if (subCampo.tipo === "serie12") {
      item[subCampo.id] = Array(12).fill(null);
    } else if (subCampo.tipo === "tabela") {
      const colunas = subCampo.colunas ?? [];
      item[subCampo.id] = Array.from({ length: subCampo.min ?? 1 }, () => linhaVaziaTabela(colunas));
    } else {
      item[subCampo.id] = "";
    }
  }
  return item;
}

export function CampoGrupoRepetivel({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const camposFilhos = campo.campos ?? [];
  const minimo = campo.min ?? 1;
  const maximo = campo.max;
  const ehFixo = Boolean(campo.fixo && campo.itensFixos);

  const valorInicial = ehFixo
    ? campo.itensFixos!.map(() => itemVazio(camposFilhos))
    : Array.from({ length: minimo }, () => itemVazio(camposFilhos));

  const [valor, setValor, conflito, resolverConflito] = useAutosaveCampo(
    relatorioId,
    campo.id,
    campo.padrao ?? valorInicial,
  );
  const itens = Array.isArray(valor) && valor.length > 0 ? (valor as ItemGrupo[]) : valorInicial;

  function atualizarItem(indice: number, subCampoId: string, novoValor: unknown) {
    setValor(itens.map((item, i) => (i === indice ? { ...item, [subCampoId]: novoValor } : item)));
  }

  function adicionarItem() {
    setValor([...itens, itemVazio(camposFilhos)]);
  }

  function removerItem(indice: number) {
    setValor(itens.filter((_, i) => i !== indice));
  }

  const podeAdicionar = !ehFixo && (maximo === undefined || itens.length < maximo);

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <div className="flex flex-col gap-6">
        {itens.map((item, indice) => (
          <div key={indice} className="border border-tinta/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="rotulo text-cinza">
                {ehFixo ? campo.itensFixos![indice] : `${campo.rotuloItem ?? "Item"} ${indice + 1}`}
              </p>
              {!ehFixo && (
                <button
                  type="button"
                  onClick={() => removerItem(indice)}
                  className="text-sm text-cinza hover:text-vermelho"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {camposFilhos.map((subCampo) => (
                <CampoFilho
                  key={subCampo.id}
                  idPrefix={`${campo.id}-${indice}-${subCampo.id}`}
                  relatorioId={relatorioId}
                  subCampo={subCampo}
                  valor={item[subCampo.id]}
                  itemContexto={item}
                  onChange={(novoValor) => atualizarItem(indice, subCampo.id, novoValor)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {podeAdicionar && (
        <button
          type="button"
          onClick={adicionarItem}
          className="rotulo mt-3 self-start border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho"
        >
          + Adicionar {campo.rotuloItem ?? "item"}
        </button>
      )}
    </CampoWrapper>
  );
}

function CampoFilho({
  idPrefix,
  relatorioId,
  subCampo,
  valor,
  itemContexto,
  onChange,
}: {
  idPrefix: string;
  relatorioId: string;
  subCampo: Campo;
  valor: unknown;
  itemContexto: ItemGrupo;
  onChange: (novoValor: unknown) => void;
}) {
  const rotulo = (
    <label htmlFor={idPrefix} className="rotulo text-cinza">
      {subCampo.rotulo}
    </label>
  );

  if (subCampo.tipo === "serie12") {
    return (
      <div className="flex flex-col gap-2">
        {rotulo}
        <SerieMensalInput
          idPrefix={idPrefix}
          valor={Array.isArray(valor) ? (valor as (number | null)[]) : Array(12).fill(null)}
          onChange={onChange}
        />
      </div>
    );
  }

  if (subCampo.tipo === "tabela") {
    return (
      <div className="flex flex-col gap-2">
        {rotulo}
        <TabelaInput
          idPrefix={idPrefix}
          relatorioId={relatorioId}
          colunas={subCampo.colunas ?? []}
          valor={Array.isArray(valor) ? (valor as LinhaTabela[]) : []}
          onChange={onChange}
          max={subCampo.max}
          itemContexto={itemContexto}
        />
      </div>
    );
  }

  if (subCampo.tipo === "textoLongo") {
    return (
      <div className="flex flex-col gap-2">
        {rotulo}
        <textarea
          id={idPrefix}
          rows={3}
          value={(valor as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
        />
      </div>
    );
  }

  if (subCampo.tipo === "numero") {
    return (
      <div className="flex flex-col gap-2">
        {rotulo}
        <input
          id={idPrefix}
          type="number"
          value={valor === null || valor === undefined ? "" : (valor as number)}
          onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
          className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
        />
      </div>
    );
  }

  if (subCampo.tipo === "selecao") {
    const opcoes = normalizarOpcoes(subCampo.opcoes);
    return (
      <div className="flex flex-col gap-2">
        {rotulo}
        <select
          id={idPrefix}
          value={(valor as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="border border-tinta/20 bg-white px-3 py-2 text-tinta"
        >
          {opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rotulo}
      <input
        id={idPrefix}
        type="text"
        list={subCampo.sugestoes ? `${idPrefix}-sugestoes` : undefined}
        value={(valor as string) ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={subCampo.formato}
        className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
      />
      {subCampo.sugestoes && (
        <datalist id={`${idPrefix}-sugestoes`}>
          {subCampo.sugestoes.map((sugestao) => (
            <option key={sugestao} value={sugestao} />
          ))}
        </datalist>
      )}
    </div>
  );
}
