"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { normalizarOpcoes, type ColunaTabela } from "@/lib/schema";
import { EQUIPE_LETS } from "@/lib/equipeLets";
import { useAnoRelatorio } from "@/components/formulario/AnoRelatorioContext";

export type LinhaTabela = Record<string, unknown>;

export function linhaVaziaTabela(colunas: ColunaTabela[]): LinhaTabela {
  return Object.fromEntries(colunas.map((coluna) => [coluna.id, ""]));
}

function sugestoesDaColuna(
  coluna: ColunaTabela,
  itemContexto?: Record<string, unknown>,
): string[] | undefined {
  if (coluna.autocompletar === "equipeLets") return EQUIPE_LETS.map((membro) => membro.nome);
  if (coluna.sugestoesPorReferencia && itemContexto) {
    const valorReferencia = itemContexto[coluna.sugestoesPorReferencia.campoId];
    if (typeof valorReferencia === "string" && coluna.sugestoesPorReferencia.mapa[valorReferencia]) {
      return coluna.sugestoesPorReferencia.mapa[valorReferencia];
    }
  }
  return coluna.sugestoes;
}

// Alguns rótulos e dicas usam {ano}/{anoAnterior} pra deixar a comparação
// explícita (ex.: "Valor no ano atual (2026)") em vez de um genérico
// "ano atual" que pode confundir quem preenche pela primeira vez.
function substituirAno(texto: string, ano: number): string {
  return texto.replace(/\{anoAnterior\}/g, String(ano - 1)).replace(/\{ano\}/g, String(ano));
}

export function TabelaInput({
  idPrefix,
  relatorioId,
  colunas,
  valor,
  onChange,
  max,
  itemContexto,
}: {
  idPrefix: string;
  relatorioId: string;
  colunas: ColunaTabela[];
  valor: LinhaTabela[];
  onChange: (novoValor: LinhaTabela[]) => void;
  max?: number;
  itemContexto?: Record<string, unknown>;
}) {
  const ano = useAnoRelatorio();

  function atualizarCelula(indiceLinha: number, colunaId: string, novoValor: unknown) {
    onChange(
      valor.map((linha, indice) =>
        indice === indiceLinha ? { ...linha, [colunaId]: novoValor } : linha,
      ),
    );
  }

  function adicionarLinha() {
    onChange([...valor, linhaVaziaTabela(colunas)]);
  }

  function removerLinha(indice: number) {
    onChange(valor.filter((_, i) => i !== indice));
  }

  const podeAdicionar = max === undefined || valor.length < max;

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {colunas.map((coluna) => (
                <th
                  key={coluna.id}
                  scope="col"
                  className="rotulo border-b border-tinta/20 px-2 py-2 text-left text-cinza"
                >
                  {substituirAno(coluna.rotulo, ano)}
                </th>
              ))}
              <th scope="col" className="border-b border-tinta/20">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {valor.map((linha, indiceLinha) => (
              <tr key={indiceLinha} className="border-b border-tinta/10">
                {colunas.map((coluna) => (
                  <td key={coluna.id} className="px-2 py-1.5">
                    <CelulaTabela
                      idPrefix={idPrefix}
                      relatorioId={relatorioId}
                      coluna={coluna}
                      valor={linha[coluna.id]}
                      onChange={(novoValor) => atualizarCelula(indiceLinha, coluna.id, novoValor)}
                      itemContexto={itemContexto}
                      ano={ano}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => removerLinha(indiceLinha)}
                    aria-label="Remover linha"
                    className="text-cinza hover:text-vermelho"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={adicionarLinha}
        disabled={!podeAdicionar}
        className="rotulo self-start border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho disabled:opacity-40"
      >
        + Adicionar linha
      </button>

      {colunas
        .map((coluna) => ({ coluna, sugestoes: sugestoesDaColuna(coluna, itemContexto) }))
        .filter((item) => item.sugestoes)
        .map(({ coluna, sugestoes }) => (
          <datalist key={coluna.id} id={`${idPrefix}-${coluna.id}-sugestoes`}>
            {sugestoes!.map((sugestao) => (
              <option key={sugestao} value={sugestao} />
            ))}
          </datalist>
        ))}
    </div>
  );
}

function CelulaTabela({
  idPrefix,
  relatorioId,
  coluna,
  valor,
  onChange,
  itemContexto,
  ano,
}: {
  idPrefix: string;
  relatorioId: string;
  coluna: ColunaTabela;
  valor: unknown;
  onChange: (valor: unknown) => void;
  itemContexto?: Record<string, unknown>;
  ano: number;
}) {
  const dica = coluna.dica ? substituirAno(coluna.dica, ano) : undefined;

  if (coluna.tipo === "imagem") {
    return (
      <CelulaImagem
        idPrefix={idPrefix}
        relatorioId={relatorioId}
        coluna={coluna}
        valor={valor as { caminho: string } | null}
        onChange={onChange}
      />
    );
  }

  if (coluna.tipo === "numero") {
    return (
      <input
        type="number"
        aria-label={coluna.rotulo}
        value={valor === null || valor === undefined ? "" : (valor as number)}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        placeholder={dica}
        className="w-full border border-tinta/20 px-2 py-1 text-tinta focus-visible:border-vermelho"
      />
    );
  }

  if (coluna.tipo === "selecao") {
    const opcoes = normalizarOpcoes(coluna.opcoes);
    return (
      <select
        aria-label={coluna.rotulo}
        value={(valor as string) ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-tinta/20 bg-white px-2 py-1 text-tinta"
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    );
  }

  const temSugestoes = Boolean(sugestoesDaColuna(coluna, itemContexto));

  return (
    <input
      type="text"
      aria-label={coluna.rotulo}
      list={temSugestoes ? `${idPrefix}-${coluna.id}-sugestoes` : undefined}
      value={(valor as string) ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={dica}
      className="w-full border border-tinta/20 px-2 py-1 text-tinta focus-visible:border-vermelho"
    />
  );
}

function CelulaImagem({
  idPrefix,
  relatorioId,
  coluna,
  valor,
  onChange,
}: {
  idPrefix: string;
  relatorioId: string;
  coluna: ColunaTabela;
  valor: { caminho: string } | null;
  onChange: (valor: { caminho: string } | null) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [falhouCarregar, setFalhouCarregar] = useState(false);
  const [erroUpload, setErroUpload] = useState("");

  useEffect(() => {
    if (!valor?.caminho) {
      setUrl(null);
      return;
    }
    let cancelado = false;
    fetch(`/api/relatorio/${relatorioId}/imagem-url?caminho=${encodeURIComponent(valor.caminho)}`)
      .then((resposta) => resposta.json())
      .then((dados) => {
        if (cancelado) return;
        if (dados.url) setUrl(dados.url);
        else setFalhouCarregar(true);
      })
      .catch(() => {
        if (!cancelado) setFalhouCarregar(true);
      });
    return () => {
      cancelado = true;
    };
  }, [valor?.caminho, relatorioId]);

  async function handleArquivo(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;

    setEnviando(true);
    setErroUpload("");
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("campo_id", `${idPrefix}-${coluna.id}`);

    try {
      const resposta = await fetch(`/api/relatorio/${relatorioId}/upload`, {
        method: "POST",
        body: formData,
      });
      const dados = await resposta.json();
      if (resposta.ok) onChange({ caminho: dados.caminho });
      else setErroUpload(dados.error || "Falha no upload.");
    } catch {
      setErroUpload("Falha no upload.");
    } finally {
      setEnviando(false);
    }
  }

  if (valor?.caminho) {
    return (
      <div className="relative h-14 w-14">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          falhouCarregar && (
            <div className="flex h-full w-full items-center justify-center text-center text-[9px] text-cinza">
              Erro ao carregar
            </div>
          )
        )}
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remover imagem"
          className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center bg-vermelho text-[10px] text-creme"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        title={coluna.dica}
        className="rotulo w-fit cursor-pointer border border-dashed border-tinta/30 px-2 py-1.5 text-xs text-cinza hover:border-vermelho hover:text-vermelho"
      >
        {enviando ? "…" : "+ imagem"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleArquivo}
          disabled={enviando}
        />
      </label>
      {erroUpload && (
        <p role="alert" className="text-[10px] text-vermelho">
          {erroUpload}
        </p>
      )}
    </div>
  );
}
