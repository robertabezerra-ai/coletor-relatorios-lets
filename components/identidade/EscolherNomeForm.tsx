"use client";

import { useMemo, useState, useTransition } from "react";
import { EQUIPE_LETS } from "@/lib/equipeLets";
import { definirIdentidade } from "@/lib/actions/identidade";

export function EscolherNomeForm() {
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [pendente, iniciarTransicao] = useTransition();

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return EQUIPE_LETS;
    return EQUIPE_LETS.filter((membro) => membro.nome.toLowerCase().includes(termo));
  }, [busca]);

  function escolher(nome: string) {
    setErro("");
    iniciarTransicao(async () => {
      const resultado = await definirIdentidade(nome);
      if (resultado?.error) setErro(resultado.error);
    });
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <input
        type="search"
        autoFocus
        placeholder="Buscar seu nome…"
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        className="border border-creme/30 bg-transparent px-4 py-3 text-creme placeholder:text-creme/30 focus-visible:border-vermelho"
      />

      {erro && (
        <p role="alert" className="text-sm text-vermelho">
          {erro}
        </p>
      )}

      <div className="flex max-h-80 flex-col overflow-y-auto border border-creme/10">
        {filtrados.length === 0 && (
          <p className="px-4 py-3 text-sm text-creme/50">Ninguém encontrado.</p>
        )}
        {filtrados.map((membro) => (
          <button
            key={membro.nome}
            type="button"
            disabled={pendente}
            onClick={() => escolher(membro.nome)}
            className="flex items-baseline justify-between gap-3 border-b border-creme/10 px-4 py-3 text-left text-creme last:border-b-0 hover:bg-creme/5 disabled:opacity-50"
          >
            <span>{membro.nome}</span>
            <span className="rotulo text-creme/40">{membro.cargo}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
