"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressoAnel } from "@/components/painel/ProgressoAnel";
import { formatarRelativo } from "@/lib/formatarData";
import { ROTULO_STATUS } from "@/lib/status";
import { moverRelatorioSquad, excluirRelatorio } from "@/lib/actions/relatorios";
import type { RelatorioPainel, Squad } from "@/lib/types";

export function CardRelatorio({
  relatorio,
  squads,
  progresso,
  usuarioAtualId,
}: {
  relatorio: RelatorioPainel;
  squads: Squad[];
  progresso: number;
  usuarioAtualId: string;
}) {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const souCriador = relatorio.criado_por === usuarioAtualId;

  useEffect(() => {
    function fecharSeFora(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", fecharSeFora);
    return () => document.removeEventListener("mousedown", fecharSeFora);
  }, []);

  const outrosSquads = squads.filter((squad) => squad.id !== relatorio.squad_id);
  const nomeUltimoEditor = relatorio.ultima_edicao_nome ?? relatorio.criado_por_nome;
  const quando = relatorio.ultima_edicao_em ?? relatorio.criado_em;

  async function moverPara(squadId: string) {
    setMenuAberto(false);
    await moverRelatorioSquad(relatorio.id, squadId);
    router.refresh();
  }

  async function excluir() {
    if (
      !confirm(
        `Excluir o relatório de ${relatorio.cliente} · ${relatorio.ano}? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setExcluindo(true);
    setErroExclusao("");
    const resultado = await excluirRelatorio(relatorio.id);
    if (resultado.error) {
      setErroExclusao(resultado.error);
      setExcluindo(false);
      return;
    }
    setMenuAberto(false);
    router.refresh();
  }

  return (
    <div className="group relative flex items-center gap-3 border border-tinta/10 bg-white p-4">
      <ProgressoAnel progresso={progresso} />

      <Link href={`/relatorio/${relatorio.id}`} className="min-w-0 flex-1">
        <p className="truncate text-tinta">
          {relatorio.cliente} <span className="text-cinza">· {relatorio.ano}</span>
        </p>
        <p className="rotulo mt-1 text-cinza">{ROTULO_STATUS[relatorio.status]}</p>
        <p className="mt-1 truncate text-xs text-cinza">
          {nomeUltimoEditor ? `${nomeUltimoEditor} · ` : ""}
          {formatarRelativo(quando)}
        </p>
      </Link>

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuAberto((valor) => !valor)}
          aria-label="Mais ações"
          aria-expanded={menuAberto}
          className="px-2 py-1 text-cinza hover:text-vermelho"
        >
          ⋮
        </button>

        {menuAberto && (
          <div className="absolute right-0 top-full z-10 mt-1 w-48 border border-tinta/10 bg-white py-1 shadow-sm">
            <p className="rotulo px-3 py-2 text-cinza">Mover para</p>
            {outrosSquads.length === 0 && (
              <p className="px-3 py-2 text-sm text-cinza">Nenhum outro squad</p>
            )}
            {outrosSquads.map((squad) => (
              <button
                key={squad.id}
                onClick={() => moverPara(squad.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-tinta hover:bg-bege"
              >
                <span
                  className="h-2 w-2 shrink-0"
                  style={{ backgroundColor: squad.cor }}
                  aria-hidden
                />
                {squad.nome}
              </button>
            ))}

            {souCriador && (
              <>
                <div className="my-1 border-t border-tinta/10" />
                <button
                  onClick={excluir}
                  disabled={excluindo}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-vermelho hover:bg-bege disabled:opacity-50"
                >
                  {excluindo ? "Excluindo…" : "Excluir relatório"}
                </button>
                {erroExclusao && (
                  <p role="alert" className="px-3 pb-2 text-xs text-vermelho">
                    {erroExclusao}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
