"use client";

import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import { SerieMensalInput } from "@/components/formulario/campos/SerieMensalInput";
import { TabelaInput, linhaVaziaTabela, type LinhaTabela } from "@/components/formulario/campos/TabelaInput";
import { useRespostas } from "@/components/formulario/RespostasContext";
import { resolverOpcoes, subCampoVisivel, type Campo } from "@/lib/schema";

type ItemGrupo = Record<string, unknown>;

function itemVazio(camposFilhos: Campo[]): ItemGrupo {
  const item: ItemGrupo = {};
  for (const subCampo of camposFilhos) {
    if (subCampo.tipo === "serie12") {
      item[subCampo.id] = Array(12).fill(null);
    } else if (subCampo.tipo === "tabela") {
      const colunas = subCampo.colunas ?? [];
      item[subCampo.id] = Array.from({ length: subCampo.min ?? 1 }, () => linhaVaziaTabela(colunas));
    } else if (subCampo.tipo === "grupoRepetivel") {
      item[subCampo.id] = Array.from({ length: subCampo.min ?? 1 }, () => itemVazio(subCampo.campos ?? []));
    } else if (subCampo.tipo === "multiSelecao") {
      item[subCampo.id] = [];
    } else {
      item[subCampo.id] = "";
    }
  }
  return item;
}

function valorInicialDoGrupo(campo: Campo): ItemGrupo[] {
  const camposFilhos = campo.campos ?? [];
  if (campo.fixo && campo.itensFixos) return campo.itensFixos.map(() => itemVazio(camposFilhos));
  return Array.from({ length: campo.min ?? 1 }, () => itemVazio(camposFilhos));
}

export function CampoGrupoRepetivel({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const [valor, setValor, conflito, resolverConflito] = useAutosaveCampo(
    relatorioId,
    campo.id,
    campo.padrao ?? valorInicialDoGrupo(campo),
  );

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <ListaDeItens
        campo={campo}
        idPrefix={campo.id}
        relatorioId={relatorioId}
        valor={valor}
        onChange={setValor}
      />
    </CampoWrapper>
  );
}

// A lista em si (itens + botão de adicionar). Separada do campo pra poder ser
// usada também dentro de um item de outra lista (ex.: números de cada campanha).
function ListaDeItens({
  campo,
  idPrefix,
  relatorioId,
  valor,
  onChange,
}: {
  campo: Campo;
  idPrefix: string;
  relatorioId: string;
  valor: unknown;
  onChange: (novoValor: ItemGrupo[]) => void;
}) {
  const camposFilhos = campo.campos ?? [];
  const maximo = campo.max;
  const ehFixo = Boolean(campo.fixo && campo.itensFixos);

  const valorInicial = valorInicialDoGrupo(campo);
  const itens = Array.isArray(valor) && valor.length > 0 ? (valor as ItemGrupo[]) : valorInicial;

  function atualizarItem(indice: number, subCampoId: string, novoValor: unknown) {
    onChange(itens.map((item, i) => (i === indice ? { ...item, [subCampoId]: novoValor } : item)));
  }

  function adicionarItem() {
    onChange([...itens, itemVazio(camposFilhos)]);
  }

  function removerItem(indice: number) {
    onChange(itens.filter((_, i) => i !== indice));
  }

  const podeAdicionar = !ehFixo && (maximo === undefined || itens.length < maximo);
  const passouDoRecomendado = campo.avisoAcima !== undefined && itens.length > campo.avisoAcima.quantidade;

  return (
    <>
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
              {camposFilhos
                .filter((subCampo) => subCampoVisivel(subCampo, item))
                .map((subCampo) => (
                  <CampoFilho
                    key={subCampo.id}
                    idPrefix={`${idPrefix}-${indice}-${subCampo.id}`}
                    relatorioId={relatorioId}
                    subCampo={subCampo}
                    valor={item[subCampo.id]}
                    itemContexto={item}
                    onChange={(novoValor) => atualizarItem(indice, subCampo.id, novoValor)}
                    onChangeOutro={(texto) => atualizarItem(indice, `${subCampo.id}Outro`, texto)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {passouDoRecomendado && (
        <p role="status" className="mt-3 text-sm italic text-cinza">
          {campo.avisoAcima!.texto}
        </p>
      )}

      {podeAdicionar && (
        <button
          type="button"
          onClick={adicionarItem}
          className="rotulo mt-3 self-start border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho"
        >
          + {campo.rotuloAdicionar ?? `Adicionar ${campo.rotuloItem ?? "item"}`}
        </button>
      )}
    </>
  );
}

function CampoFilho({
  idPrefix,
  relatorioId,
  subCampo,
  valor,
  itemContexto,
  onChange,
  onChangeOutro,
}: {
  idPrefix: string;
  relatorioId: string;
  subCampo: Campo;
  valor: unknown;
  itemContexto: ItemGrupo;
  onChange: (novoValor: unknown) => void;
  onChangeOutro: (texto: string) => void;
}) {
  const { respostas } = useRespostas();
  const rotulo = (
    <>
      <label htmlFor={idPrefix} className="rotulo text-cinza">
        {subCampo.rotulo}
      </label>
      {subCampo.formato && <p className="text-sm italic text-cinza">{subCampo.formato}</p>}
    </>
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

  if (subCampo.tipo === "grupoRepetivel") {
    return (
      <div className="flex flex-col gap-2">
        {rotulo}
        <ListaDeItens
          campo={subCampo}
          idPrefix={idPrefix}
          relatorioId={relatorioId}
          valor={valor}
          onChange={onChange}
        />
      </div>
    );
  }

  if (subCampo.tipo === "multiSelecao") {
    const marcadas = subCampo.opcoesDoCampo ? respostas[subCampo.opcoesDoCampo] : undefined;
    const textoOutra = subCampo.opcoesDoCampo
      ? String(respostas[`${subCampo.opcoesDoCampo}Outra`] ?? "").trim()
      : "";
    const opcoes = Array.isArray(marcadas)
      ? (marcadas as string[]).map((rede) => ({
          valor: rede,
          rotulo: rede === "Outra" && textoOutra !== "" ? textoOutra : rede,
        }))
      : resolverOpcoes(subCampo);
    const selecionados = Array.isArray(valor) ? (valor as string[]) : [];
    return (
      <div className="flex flex-col gap-2">
        {rotulo}
        {opcoes.length === 0 ? (
          <p className="text-sm text-cinza">Marque as redes no bloco 1 (Abertura) para escolher aqui.</p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {opcoes.map((opcao) => (
              <label key={opcao.valor} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selecionados.includes(opcao.valor)}
                  onChange={() =>
                    onChange(
                      selecionados.includes(opcao.valor)
                        ? selecionados.filter((item) => item !== opcao.valor)
                        : [...selecionados, opcao.valor],
                    )
                  }
                  className="h-4 w-4 accent-vermelho"
                />
                <span className="text-tinta">{opcao.rotulo}</span>
              </label>
            ))}
          </div>
        )}
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
    const opcoes = resolverOpcoes(subCampo);
    const todasAsOpcoes = subCampo.permiteOutro
      ? [...opcoes, { valor: "Outro", rotulo: "Outro" }]
      : opcoes;
    return (
      <div className="flex flex-col gap-2">
        {rotulo}
        <select
          id={idPrefix}
          value={(valor as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="border border-tinta/20 bg-white px-3 py-2 text-tinta"
        >
          {todasAsOpcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        {subCampo.permiteOutro && valor === "Outro" && (
          <input
            type="text"
            aria-label={`${subCampo.rotulo} — descreva`}
            placeholder="Descreva qual"
            value={(itemContexto[`${subCampo.id}Outro`] as string) ?? ""}
            onChange={(event) => onChangeOutro(event.target.value)}
            className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
          />
        )}
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
