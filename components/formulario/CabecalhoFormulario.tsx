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
  percentualGeral,
  temImagens,
}: {
  relatorioId: string;
  cliente: string;
  squadNome: string;
  ano: number;
  percentualGeral: number;
  temImagens: boolean;
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
          <span className="rotulo text-cinza">{percentualGeral}%</span>
          <p className={`rotulo ${estado === "erro" ? "text-vermelho" : "text-cinza"}`}>
            {TEXTO_ESTADO[estado]}
          </p>
        </div>
      </div>
      <div className="mt-3 h-1 w-full bg-tinta/10">
        <div
          className="h-1 bg-vermelho transition-all"
          style={{ width: `${percentualGeral}%` }}
        />
      </div>
    </header>
  );
}
