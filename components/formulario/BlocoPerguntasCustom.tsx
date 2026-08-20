"use client";

import { useState } from "react";
import { Campo } from "@/components/formulario/Campo";
import { PerguntaCustomFormModal } from "@/components/formulario/PerguntaCustomFormModal";
import { excluirPerguntaCustom, reordenarPerguntasCustom } from "@/lib/actions/perguntasCustom";
import {
  MODELOS_CUSTOM,
  perguntaCustomParaCampo,
  type PerguntaCustom,
} from "@/lib/perguntasCustom";

export function BlocoPerguntasCustom({
  relatorioId,
  perguntas,
  onMudou,
}: {
  relatorioId: string;
  perguntas: PerguntaCustom[];
  onMudou: (novasPerguntas: PerguntaCustom[]) => void;
}) {
  const [modalAberto, setModalAberto] = useState<"novo" | PerguntaCustom | null>(null);

  function moverPergunta(indice: number, direcao: -1 | 1) {
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= perguntas.length) return;

    const copia = [...perguntas];
    [copia[indice], copia[alvo]] = [copia[alvo], copia[indice]];
    const comOrdemNova = copia.map((pergunta, i) => ({ ...pergunta, ordem: i }));

    onMudou(comOrdemNova);
    reordenarPerguntasCustom(comOrdemNova.map((pergunta) => ({ id: pergunta.id, ordem: pergunta.ordem })));
  }

  async function excluir(pergunta: PerguntaCustom) {
    if (!confirm(`Excluir a pergunta "${pergunta.rotulo}"? Essa ação não pode ser desfeita.`)) return;
    onMudou(perguntas.filter((item) => item.id !== pergunta.id));
    await excluirPerguntaCustom(pergunta.id, relatorioId);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <h2 className="text-2xl font-light text-tinta">13. Perguntas personalizadas</h2>
      <p className="mt-2 text-cinza">
        Espaço livre para o que este cliente tem de específico e não cabe nos blocos acima. Cada
        pergunta criada aqui vira um item do .docx e é lida pelo Claude na hora de montar o
        relatório.
      </p>

      <button
        type="button"
        onClick={() => setModalAberto("novo")}
        className="rotulo mt-6 w-fit bg-vermelho px-4 py-2 text-creme hover:opacity-90"
      >
        + Nova pergunta
      </button>

      <div className="mt-6 flex flex-col">
        {perguntas.length === 0 && (
          <p className="text-sm text-cinza">
            Nenhuma pergunta personalizada ainda. Clique em &ldquo;+ Nova pergunta&rdquo; acima
            para criar a primeira.
          </p>
        )}

        {perguntas.map((pergunta, indice) => (
          <div key={pergunta.id}>
            <div className="mt-6 flex items-center gap-3 border-t border-tinta/10 pt-4 first:mt-0 first:border-t-0 first:pt-0">
              <span className="rotulo text-cinza">{MODELOS_CUSTOM[pergunta.modelo]?.rotulo ?? "Texto livre"}</span>
              <div className="ml-auto flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => moverPergunta(indice, -1)}
                  disabled={indice === 0}
                  aria-label="Mover para cima"
                  className="text-cinza hover:text-vermelho disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moverPergunta(indice, 1)}
                  disabled={indice === perguntas.length - 1}
                  aria-label="Mover para baixo"
                  className="text-cinza hover:text-vermelho disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setModalAberto(pergunta)}
                  className="text-cinza hover:text-vermelho"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => excluir(pergunta)}
                  className="text-cinza hover:text-vermelho"
                >
                  Excluir
                </button>
              </div>
            </div>
            <Campo campo={perguntaCustomParaCampo(pergunta)} relatorioId={relatorioId} />
          </div>
        ))}
      </div>

      {modalAberto && (
        <PerguntaCustomFormModal
          relatorioId={relatorioId}
          pergunta={modalAberto === "novo" ? null : modalAberto}
          onClose={() => setModalAberto(null)}
          onSalvo={(pergunta) => {
            if (modalAberto === "novo") {
              onMudou([...perguntas, pergunta]);
            } else {
              onMudou(perguntas.map((item) => (item.id === pergunta.id ? pergunta : item)));
            }
            setModalAberto(null);
          }}
        />
      )}
    </div>
  );
}
