"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { criarSquad, atualizarSquad } from "@/lib/actions/squads";
import type { Squad, SquadTipo } from "@/lib/types";

const CORES_SUGERIDAS = [
  "#D10A11", // vermelho
  "#1E63C8", // azul
  "#E8720C", // laranja
  "#D64C8E", // rosa
  "#1D1D1B", // black
  "#0F7A4A", // verde
  "#2A9D8F", // teal
  "#6B4FA0", // roxo
  "#C9A227", // mostarda
  "#7A5C43", // marrom
  "#4A6FA5", // azul acinzentado
  "#8C8C8C", // cinza
];

export function SquadFormModal({
  squad,
  onClose,
  onSalvo,
}: {
  squad: Squad | null;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState(squad?.nome ?? "");
  const [cor, setCor] = useState(squad?.cor ?? CORES_SUGERIDAS[0]);
  const [tipo, setTipo] = useState<SquadTipo>(squad?.tipo ?? "squad");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!nome.trim()) return;

    setEnviando(true);
    setErro("");

    const resultado = squad
      ? await atualizarSquad(squad.id, { nome, cor, tipo })
      : await criarSquad({ nome, cor, tipo });

    if (resultado.error) {
      setErro(resultado.error);
      setEnviando(false);
      return;
    }

    onSalvo();
  }

  return (
    <Modal titulo={squad ? "Editar squad" : "Novo squad"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="nome" className="rotulo text-cinza">
            Nome
          </label>
          <input
            id="nome"
            required
            autoFocus
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="rotulo text-cinza">Tipo</legend>
          <div className="flex gap-4">
            {(["squad", "chapter"] as SquadTipo[]).map((opcao) => (
              <label key={opcao} className="flex items-center gap-2 text-tinta">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === opcao}
                  onChange={() => setTipo(opcao)}
                />
                {opcao === "squad" ? "Squad" : "Chapter"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="cor" className="rotulo text-cinza">
            Cor
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {CORES_SUGERIDAS.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => setCor(sugestao)}
                aria-label={`Usar cor ${sugestao}`}
                aria-pressed={cor === sugestao}
                className={`h-7 w-7 shrink-0 border ${cor === sugestao ? "border-tinta" : "border-transparent"}`}
                style={{ backgroundColor: sugestao }}
              />
            ))}
            <input
              id="cor"
              type="color"
              value={cor}
              onChange={(event) => setCor(event.target.value)}
              aria-label="Escolher outra cor"
              className="h-7 w-9 shrink-0 border border-tinta/20"
            />
          </div>
        </div>

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
          {enviando ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </Modal>
  );
}
