"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatarValorCampo } from "@/lib/formatarValorCampo";

type Entrada = {
  id: number;
  campo_id: string;
  valor_anterior: unknown;
  valor_novo: unknown;
  autor: string | null;
  autorNome: string | null;
  quando: string;
  blocoId: string;
  blocoTitulo: string;
  rotulo: string;
};

export function HistoricoClient({
  relatorioId,
  cliente,
  entradas,
}: {
  relatorioId: string;
  cliente: string;
  entradas: Entrada[];
}) {
  const [filtroPessoa, setFiltroPessoa] = useState("todos");
  const [filtroBloco, setFiltroBloco] = useState("todos");
  const [restaurando, setRestaurando] = useState<number | null>(null);
  const [restaurados, setRestaurados] = useState<Set<number>>(new Set());

  const pessoas = useMemo(
    () => Array.from(new Set(entradas.map((entrada) => entrada.autorNome ?? "Desconhecido"))).sort(),
    [entradas],
  );

  const blocosComLog = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const entrada of entradas) mapa.set(entrada.blocoId, entrada.blocoTitulo);
    return Array.from(mapa.entries());
  }, [entradas]);

  const filtradas = entradas.filter((entrada) => {
    if (filtroPessoa !== "todos" && (entrada.autorNome ?? "Desconhecido") !== filtroPessoa) return false;
    if (filtroBloco !== "todos" && entrada.blocoId !== filtroBloco) return false;
    return true;
  });

  async function restaurar(entrada: Entrada) {
    setRestaurando(entrada.id);
    try {
      const resposta = await fetch(`/api/relatorio/${relatorioId}/respostas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campo_id: entrada.campo_id, valor: entrada.valor_novo }),
      });
      if (resposta.ok) setRestaurados((atual) => new Set(atual).add(entrada.id));
    } finally {
      setRestaurando(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <header>
        <Link
          href={`/relatorio/${relatorioId}`}
          className="rotulo text-cinza hover:text-vermelho"
        >
          ← Voltar ao relatório
        </Link>
        <h1 className="mt-1 text-3xl font-light text-tinta">Histórico · {cliente}</h1>
      </header>

      <div className="flex flex-wrap gap-3">
        <label htmlFor="filtro-pessoa" className="sr-only">
          Filtrar por pessoa
        </label>
        <select
          id="filtro-pessoa"
          value={filtroPessoa}
          onChange={(event) => setFiltroPessoa(event.target.value)}
          className="border border-tinta/20 bg-white px-3 py-2 text-tinta"
        >
          <option value="todos">Toda pessoa</option>
          {pessoas.map((pessoa) => (
            <option key={pessoa} value={pessoa}>
              {pessoa}
            </option>
          ))}
        </select>
        <label htmlFor="filtro-bloco-historico" className="sr-only">
          Filtrar por bloco
        </label>
        <select
          id="filtro-bloco-historico"
          value={filtroBloco}
          onChange={(event) => setFiltroBloco(event.target.value)}
          className="border border-tinta/20 bg-white px-3 py-2 text-tinta"
        >
          <option value="todos">Todo bloco</option>
          {blocosComLog.map(([id, titulo]) => (
            <option key={id} value={id}>
              {titulo}
            </option>
          ))}
        </select>
      </div>

      {filtradas.length === 0 && (
        <p className="text-cinza">
          {entradas.length === 0
            ? "Nada foi editado neste relatório ainda."
            : "Nada por aqui com esse filtro."}
        </p>
      )}

      <div className="flex flex-col divide-y divide-tinta/10 border border-tinta/10">
        {filtradas.map((entrada) => (
          <div key={entrada.id} className="flex flex-col gap-1 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-tinta">{entrada.autorNome ?? "Alguém"}</span>
              <span className="text-cinza">
                · {new Date(entrada.quando).toLocaleString("pt-BR")}
              </span>
              <span className="text-cinza">· {entrada.blocoTitulo}</span>
            </div>
            <p className="text-tinta">{entrada.rotulo}</p>
            <p className="text-sm text-cinza">
              <span className="text-cinza">de</span> {formatarValorCampo(entrada.valor_anterior)}{" "}
              <span className="text-cinza">para</span> {formatarValorCampo(entrada.valor_novo)}
            </p>
            <button
              type="button"
              onClick={() => restaurar(entrada)}
              disabled={restaurando === entrada.id}
              className="rotulo mt-2 w-fit border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho disabled:opacity-40"
            >
              {restaurando === entrada.id
                ? "Restaurando…"
                : restaurados.has(entrada.id)
                  ? "Restaurado"
                  : "Restaurar este valor"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
