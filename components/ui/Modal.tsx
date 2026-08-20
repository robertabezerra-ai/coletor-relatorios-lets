"use client";

import { useEffect } from "react";

export function Modal({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className="w-full max-w-md border border-tinta/10 bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-titulo" className="text-xl font-light text-tinta">
            {titulo}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-cinza hover:text-vermelho"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
