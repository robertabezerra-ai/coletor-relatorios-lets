"use client";

import { createContext, useContext, type ReactNode } from "react";

const Contexto = createContext<number | null>(null);

export function AnoRelatorioProvider({
  ano,
  children,
}: {
  ano: number;
  children: ReactNode;
}) {
  return <Contexto.Provider value={ano}>{children}</Contexto.Provider>;
}

export function useAnoRelatorio(): number {
  const ano = useContext(Contexto);
  if (ano === null) {
    throw new Error("useAnoRelatorio precisa estar dentro de AnoRelatorioProvider");
  }
  return ano;
}
