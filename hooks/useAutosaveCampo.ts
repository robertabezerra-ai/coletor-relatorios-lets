"use client";

import { useRef, useState } from "react";
import { useEstadoSalvamento } from "@/components/formulario/EstadoSalvamentoContext";
import { useRespostas } from "@/components/formulario/RespostasContext";

const DEBOUNCE_MS = 800;
const MAX_TENTATIVAS = 3;

export type ConflitoCampo = {
  valorServidor: unknown;
  atualizadoEmServidor: string;
};

export function useAutosaveCampo(relatorioId: string, campoId: string, valorPadrao: unknown) {
  const { respostas, atualizarResposta, atualizadoEmPorCampo, registrarAtualizadoEm } =
    useRespostas();
  const { reportar } = useEstadoSalvamento();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valorSalvoRef = useRef<unknown>(campoId in respostas ? respostas[campoId] : undefined);
  const [conflito, setConflito] = useState<ConflitoCampo | null>(null);

  const valor = campoId in respostas ? respostas[campoId] : (valorPadrao ?? null);

  async function salvar(valorParaSalvar: unknown, tentativa = 0) {
    if (valorParaSalvar === valorSalvoRef.current) return;
    reportar("salvando");

    try {
      const resposta = await fetch(`/api/relatorio/${relatorioId}/respostas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campo_id: campoId,
          valor: valorParaSalvar,
          atualizado_em_esperado: atualizadoEmPorCampo[campoId] ?? null,
        }),
      });

      if (resposta.status === 409) {
        const dados = await resposta.json();
        setConflito({ valorServidor: dados.valor, atualizadoEmServidor: dados.atualizado_em });
        reportar("erro");
        return;
      }

      if (!resposta.ok) throw new Error("Falha ao salvar");

      const dados = await resposta.json();
      valorSalvoRef.current = valorParaSalvar;
      registrarAtualizadoEm(campoId, dados.atualizado_em);
      setConflito(null);
      reportar("salvo");
    } catch {
      reportar("erro");
      if (tentativa < MAX_TENTATIVAS) {
        retryRef.current = setTimeout(() => salvar(valorParaSalvar, tentativa + 1), 3000);
      }
    }
  }

  function setValor(novoValor: unknown) {
    atualizarResposta(campoId, novoValor);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    debounceRef.current = setTimeout(() => salvar(novoValor), DEBOUNCE_MS);
  }

  function resolverConflito(escolha: "manter_meu" | "usar_do_servidor") {
    if (!conflito) return;

    if (escolha === "usar_do_servidor") {
      atualizarResposta(campoId, conflito.valorServidor);
      valorSalvoRef.current = conflito.valorServidor;
      registrarAtualizadoEm(campoId, conflito.atualizadoEmServidor);
      setConflito(null);
      return;
    }

    registrarAtualizadoEm(campoId, conflito.atualizadoEmServidor);
    setConflito(null);
    salvar(valor);
  }

  return [valor, setValor, conflito, resolverConflito] as const;
}
