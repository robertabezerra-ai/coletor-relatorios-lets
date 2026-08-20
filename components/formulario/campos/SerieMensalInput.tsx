"use client";

import { useState } from "react";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function SerieMensalInput({
  idPrefix,
  valor,
  onChange,
}: {
  idPrefix: string;
  valor: (number | null)[];
  onChange: (novoValor: (number | null)[]) => void;
}) {
  const meses = valor.length === 12 ? valor : Array(12).fill(null);
  const [linhaColar, setLinhaColar] = useState("");

  function atualizarMes(indice: number, novoValor: string) {
    const copia = [...meses];
    copia[indice] = novoValor === "" ? null : Number(novoValor);
    onChange(copia);
  }

  function distribuir() {
    const numeros = linhaColar
      .split(",")
      .map((parte) => parte.trim())
      .map((parte) => (parte === "" ? null : Number(parte)));
    onChange(Array.from({ length: 12 }, (_, indice) => (indice < numeros.length ? numeros[indice] : null)));
    setLinhaColar("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {MESES.map((nomeMes, indice) => (
          <div key={nomeMes} className="flex flex-col gap-1">
            <label htmlFor={`${idPrefix}-${indice}`} className="rotulo text-cinza">
              {nomeMes}
            </label>
            <input
              id={`${idPrefix}-${indice}`}
              type="number"
              value={meses[indice] === null || meses[indice] === undefined ? "" : meses[indice]!}
              onChange={(event) => atualizarMes(indice, event.target.value)}
              className="border border-tinta/20 px-2 py-1.5 text-sm text-tinta focus-visible:border-vermelho"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <label htmlFor={`${idPrefix}-colar`} className="sr-only">
          Colar linha separada por vírgula para distribuir pelos meses
        </label>
        <input
          id={`${idPrefix}-colar`}
          type="text"
          value={linhaColar}
          onChange={(event) => setLinhaColar(event.target.value)}
          placeholder="Cole aqui uma linha separada por vírgula (12 números)"
          className="flex-1 border border-tinta/20 px-3 py-2 text-sm text-tinta focus-visible:border-vermelho"
        />
        <button
          type="button"
          onClick={distribuir}
          disabled={!linhaColar.trim()}
          className="rotulo border border-tinta/20 px-3 py-2 text-tinta hover:border-vermelho hover:text-vermelho disabled:opacity-40"
        >
          Distribuir
        </button>
      </div>
    </div>
  );
}
