"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type RespostasMap = Record<string, unknown>;
type AtualizacoesMap = Record<string, string>;

const Contexto = createContext<{
  respostas: RespostasMap;
  atualizarResposta: (campoId: string, valor: unknown) => void;
  atualizadoEmPorCampo: AtualizacoesMap;
  registrarAtualizadoEm: (campoId: string, atualizadoEm: string) => void;
} | null>(null);

export function RespostasProvider({
  respostasIniciais,
  atualizacoesIniciais = {},
  children,
}: {
  respostasIniciais: RespostasMap;
  atualizacoesIniciais?: AtualizacoesMap;
  children: ReactNode;
}) {
  const [respostas, setRespostas] = useState<RespostasMap>(respostasIniciais);
  const [atualizadoEmPorCampo, setAtualizadoEmPorCampo] =
    useState<AtualizacoesMap>(atualizacoesIniciais);

  function atualizarResposta(campoId: string, valor: unknown) {
    setRespostas((atual) => ({ ...atual, [campoId]: valor }));
  }

  function registrarAtualizadoEm(campoId: string, atualizadoEm: string) {
    setAtualizadoEmPorCampo((atual) => ({ ...atual, [campoId]: atualizadoEm }));
  }

  return (
    <Contexto.Provider
      value={{ respostas, atualizarResposta, atualizadoEmPorCampo, registrarAtualizadoEm }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useRespostas() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useRespostas precisa estar dentro de RespostasProvider");
  }
  return contexto;
}
