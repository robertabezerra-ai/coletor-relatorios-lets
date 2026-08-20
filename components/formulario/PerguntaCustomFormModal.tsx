"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { criarPerguntaCustom, atualizarPerguntaCustom } from "@/lib/actions/perguntasCustom";
import { MODELOS_CUSTOM, type PerguntaCustom, type ModeloPerguntaCustom } from "@/lib/perguntasCustom";

const MODELOS: ModeloPerguntaCustom[] = ["destaque", "numero", "texto", "lista"];

export function PerguntaCustomFormModal({
  relatorioId,
  pergunta,
  onClose,
  onSalvo,
}: {
  relatorioId: string;
  pergunta: PerguntaCustom | null;
  onClose: () => void;
  onSalvo: (pergunta: PerguntaCustom) => void;
}) {
  const [rotulo, setRotulo] = useState(pergunta?.rotulo ?? "");
  const [formato, setFormato] = useState(pergunta?.formato ?? "");
  const [modelo, setModelo] = useState<ModeloPerguntaCustom>(pergunta?.modelo ?? "destaque");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!rotulo.trim()) return;

    setEnviando(true);
    setErro("");

    if (pergunta) {
      const resultado = await atualizarPerguntaCustom(pergunta.id, { rotulo, formato, modelo });
      if (resultado.error) {
        setErro(resultado.error);
        setEnviando(false);
        return;
      }
      onSalvo({ ...pergunta, rotulo: rotulo.trim(), formato: formato.trim() || null, modelo });
      return;
    }

    const resultado = await criarPerguntaCustom({ relatorioId, rotulo, formato, modelo });
    if (resultado.error || !resultado.pergunta) {
      setErro(resultado.error ?? "Não foi possível criar a pergunta.");
      setEnviando(false);
      return;
    }
    onSalvo(resultado.pergunta);
  }

  return (
    <Modal titulo={pergunta ? "Editar pergunta" : "Nova pergunta"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="rotulo" className="rotulo text-cinza">
            Rótulo (título da pergunta)
          </label>
          <input
            id="rotulo"
            required
            autoFocus
            value={rotulo}
            onChange={(event) => setRotulo(event.target.value)}
            className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="formato" className="rotulo text-cinza">
            Texto de ajuda (opcional)
          </label>
          <input
            id="formato"
            value={formato}
            onChange={(event) => setFormato(event.target.value)}
            className="border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="rotulo text-cinza">Modelo</legend>
          <div className="flex flex-col gap-2">
            {MODELOS.map((opcao) => (
              <label
                key={opcao}
                className="flex cursor-pointer items-start gap-3 border border-tinta/20 p-3 has-[:checked]:border-vermelho"
              >
                <input
                  type="radio"
                  name="modelo"
                  className="mt-1"
                  checked={modelo === opcao}
                  onChange={() => setModelo(opcao)}
                />
                <span className="flex flex-col">
                  <span className="text-tinta">{MODELOS_CUSTOM[opcao].rotulo}</span>
                  <span className="text-sm text-cinza">{MODELOS_CUSTOM[opcao].descricao}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

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
