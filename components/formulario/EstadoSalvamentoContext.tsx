"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type EstadoSalvamento = "idle" | "salvando" | "salvo" | "erro";

const Contexto = createContext<{
  estado: EstadoSalvamento;
  reportar: (estado: EstadoSalvamento) => void;
} | null>(null);

export function EstadoSalvamentoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSalvamento>("idle");
  const reportar = useCallback((novoEstado: EstadoSalvamento) => setEstado(novoEstado), []);

  return (
    <Contexto.Provider value={{ estado, reportar }}>{children}</Contexto.Provider>
  );
}

export function useEstadoSalvamento() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useEstadoSalvamento precisa estar dentro de EstadoSalvamentoProvider");
  }
  return contexto;
}
