"use client";

import { useEffect } from "react";

// Mostra o relatório ocupando a tela toda, na largura de um computador — é
// assim que o cliente vai ver. Serve tanto para a prévia ao vivo quanto para
// os exemplos com dados fictícios de cada seção.
export function TelaCheiaRelatorio({
  titulo,
  subtitulo,
  html,
  secaoInicial,
  onClose,
}: {
  titulo: string;
  subtitulo?: string;
  html: string | null;
  secaoInicial?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex flex-col bg-tinta/70 sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex min-h-0 flex-1 flex-col border border-tinta/10 bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-tinta/10 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="rotulo text-tinta">{titulo}</p>
            {subtitulo && <p className="mt-0.5 text-sm text-cinza">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rotulo shrink-0 border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho"
          >
            Fechar ✕
          </button>
        </div>
        {html ? (
          <iframe
            title={titulo}
            srcDoc={html}
            className="min-h-0 flex-1 border-0"
            style={{ colorScheme: "light" }}
            onLoad={(event) => {
              if (!secaoInicial) return;
              event.currentTarget.contentDocument
                ?.getElementById(secaoInicial)
                ?.scrollIntoView({ block: "start" });
            }}
          />
        ) : (
          <p className="px-6 py-6 text-sm text-cinza">Carregando…</p>
        )}
      </div>
    </div>
  );
}
