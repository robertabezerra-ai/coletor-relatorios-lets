"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SquadFormModal } from "@/components/squads/SquadFormModal";
import { arquivarSquad, excluirSquad } from "@/lib/actions/squads";
import type { Squad } from "@/lib/types";

export function GerenciarSquadsClient({
  squads,
  contagemPorSquad,
}: {
  squads: Squad[];
  contagemPorSquad: Record<string, number>;
}) {
  const router = useRouter();
  const [squadEmEdicao, setSquadEmEdicao] = useState<Squad | "novo" | null>(null);
  const [erroExclusao, setErroExclusao] = useState<{ id: string; mensagem: string } | null>(null);

  function fecharModalESalvar() {
    setSquadEmEdicao(null);
    router.refresh();
  }

  async function handleArquivar(squad: Squad) {
    await arquivarSquad(squad.id, !squad.arquivado);
    router.refresh();
  }

  async function handleExcluir(squad: Squad) {
    if (!confirm(`Excluir o squad "${squad.nome}"? Essa ação não pode ser desfeita.`)) return;

    const resultado = await excluirSquad(squad.id);
    if (resultado.error) {
      setErroExclusao({ id: squad.id, mensagem: resultado.error });
      return;
    }
    setErroExclusao(null);
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="rotulo text-cinza hover:text-vermelho">
            ← Painel
          </Link>
          <h1 className="mt-1 text-3xl font-light text-tinta">Gerenciar squads</h1>
        </div>
        <button
          onClick={() => setSquadEmEdicao("novo")}
          className="rotulo bg-vermelho px-4 py-2 text-creme hover:opacity-90"
        >
          Novo squad
        </button>
      </header>

      <div className="flex flex-col divide-y divide-tinta/10 border border-tinta/10">
        {squads.length === 0 && (
          <p className="p-4 text-cinza">Nenhum squad cadastrado ainda.</p>
        )}

        {squads.map((squad) => {
          const quantidade = contagemPorSquad[squad.id] ?? 0;
          return (
            <div key={squad.id} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0"
                  style={{ backgroundColor: squad.cor }}
                  aria-hidden
                />
                <p className="text-tinta">{squad.nome}</p>
                <span className="rotulo text-cinza">
                  {squad.tipo === "squad" ? "Squad" : "Chapter"}
                </span>
                {squad.arquivado && <span className="rotulo text-cinza">Arquivado</span>}
                <span className="text-sm text-cinza">
                  {quantidade} relatório{quantidade === 1 ? "" : "s"}
                </span>

                <div className="ml-auto flex gap-3">
                  <button
                    onClick={() => setSquadEmEdicao(squad)}
                    className="rotulo text-cinza hover:text-vermelho"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleArquivar(squad)}
                    className="rotulo text-cinza hover:text-vermelho"
                  >
                    {squad.arquivado ? "Reativar" : "Arquivar"}
                  </button>
                  <button
                    onClick={() => handleExcluir(squad)}
                    disabled={quantidade > 0}
                    title={
                      quantidade > 0
                        ? "Squads com relatórios só podem ser arquivados"
                        : undefined
                    }
                    className="rotulo text-cinza hover:text-vermelho disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-cinza"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              {erroExclusao?.id === squad.id && (
                <p role="alert" className="text-sm text-vermelho">
                  {erroExclusao.mensagem}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {squadEmEdicao && (
        <SquadFormModal
          squad={squadEmEdicao === "novo" ? null : squadEmEdicao}
          onClose={() => setSquadEmEdicao(null)}
          onSalvo={fecharModalESalvar}
        />
      )}
    </div>
  );
}
