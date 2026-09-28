"use client";

import Link from "next/link";
import { useEstadoSalvamento, type EstadoSalvamento } from "@/components/formulario/EstadoSalvamentoContext";

const TEXTO_ESTADO: Record<EstadoSalvamento, string> = {
  idle: "",
  salvando: "Salvando…",
  salvo: "Salvo",
  erro: "Erro ao salvar",
};

export function CabecalhoFormulario({
  relatorioId,
  cliente,
  squadNome,
  ano,
  temImagens,
  previaAberta,
  onAlternarPrevia,
}: {
  relatorioId: string;
  cliente: string;
  squadNome: string;
  ano: number;
  temImagens: boolean;
  previaAberta: boolean;
  onAlternarPrevia: () => void;
}) {
  const { estado } = useEstadoSalvamento();

  return (
    <header className="border-b border-tinta/10 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="rotulo text-cinza hover:text-vermelho">
            ← Painel
          </Link>
          <p className="mt-1 text-tinta">
            {cliente} <span className="text-cinza">· {squadNome} · {ano}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onAlternarPrevia}
            aria-pressed={previaAberta}
            className={`rotulo border px-3 py-1.5 ${
              previaAberta
                ? "border-tinta bg-tinta text-creme hover:opacity-90"
                : "border-tinta/20 text-tinta hover:border-vermelho hover:text-vermelho"
            }`}
          >
            {previaAberta ? "Ocultar prévia" : "Ver prévia"}
          </button>
          <a
            href={`/api/relatorio/${relatorioId}/html`}
            className="rotulo bg-vermelho px-3 py-1.5 text-creme hover:opacity-90"
          >
            Baixar relatório
          </a>
          <a
            href={`/api/relatorio/${relatorioId}/docx`}
            className="rotulo border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho"
          >
            Baixar .docx
          </a>
          {temImagens && (
            <a
              href={`/api/relatorio/${relatorioId}/imagens`}
              className="rotulo border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho"
            >
              Baixar imagens
            </a>
          )}
          <Link
            href={`/relatorio/${relatorioId}/historico`}
            className="rotulo text-cinza hover:text-vermelho"
          >
            Histórico
          </Link>
          <p className={`rotulo ${estado === "erro" ? "text-vermelho" : "text-cinza"}`}>
            {TEXTO_ESTADO[estado]}
          </p>
        </div>
      </div>
    </header>
  );
}
