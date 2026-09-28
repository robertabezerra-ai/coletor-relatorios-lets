"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { criarRelatorio } from "@/lib/actions/relatorios";
import type { Squad } from "@/lib/types";

const anoAtual = new Date().getFullYear();

export function NovoRelatorioModal({
  squads,
  onClose,
}: {
  squads: Squad[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [ano, setAno] = useState(anoAtual);
  const [squadId, setSquadId] = useState(squads[0]?.id ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!cliente.trim() || !squadId) return;

    setEnviando(true);
    setErro("");

    const resultado = await criarRelatorio({ cliente, ano, squad_id: squadId });

    if (resultado.error) {
      setErro(resultado.error);
      setEnviando(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <Modal titulo="Novo relatório" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="cliente" className="rotulo text-cinza">
            Cliente
          </label>
          <input
            id="cliente"
            required
            autoFocus
            value={cliente}
            onChange={(event) => setCliente(event.target.value)}
            className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ano" className="rotulo text-cinza">
            Ano
          </label>
          <input
            id="ano"
            type="number"
            required
            value={ano}
            onChange={(event) => setAno(Number(event.target.value))}
            className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="squad" className="rotulo text-cinza">
            Squad
          </label>
          <select
            id="squad"
            required
            value={squadId}
            onChange={(event) => setSquadId(event.target.value)}
            className="border border-tinta/20 bg-white px-3 py-2 text-tinta focus-visible:border-vermelho"
          >
            {squads.map((squad) => (
              <option key={squad.id} value={squad.id}>
                {squad.nome}
              </option>
            ))}
          </select>
        </div>

        <p
          role="note"
          className="border-l-2 border-vermelho bg-vermelho/5 px-3 py-2 text-sm text-tinta"
        >
          <strong className="font-semibold">Revise bem o squad:</strong> confira se você está
          criando este cliente dentro do <strong className="font-semibold">seu</strong> squad —
          assim o painel continua organizado para todos.
        </p>

        {erro && (
          <p role="alert" className="text-sm text-vermelho">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-2 bg-vermelho px-4 py-3 font-semibold text-creme transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enviando ? "Criando…" : "Criar relatório"}
        </button>
      </form>
    </Modal>
  );
}
