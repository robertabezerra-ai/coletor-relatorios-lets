"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { NovoRelatorioModal } from "@/components/painel/NovoRelatorioModal";
import { CardRelatorio } from "@/components/painel/CardRelatorio";
import { SquadFolderCard } from "@/components/painel/SquadFolderCard";
import { LogoutButton } from "@/app/logout-button";
import { ROTULO_STATUS, STATUS_OPCOES } from "@/lib/status";
import type { RelatorioPainel, RelatorioStatus, Squad } from "@/lib/types";

export function PainelClient({
  squads,
  relatorios,
  progressoPorRelatorio,
  identidadeAtual,
}: {
  squads: Squad[];
  relatorios: RelatorioPainel[];
  progressoPorRelatorio: Record<string, number>;
  identidadeAtual: string;
}) {
  const [busca, setBusca] = useState("");
  const [filtroAno, setFiltroAno] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState<RelatorioStatus | "todos">("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [squadAbertoId, setSquadAbertoId] = useState<string | null>(null);

  const squadsAtivos = squads.filter((squad) => !squad.arquivado);
  const squadAberto = squads.find((squad) => squad.id === squadAbertoId) ?? null;

  const anosDisponiveis = useMemo(
    () => Array.from(new Set(relatorios.map((r) => r.ano))).sort((a, b) => b - a),
    [relatorios],
  );

  const buscaAtiva = busca.trim() !== "" || filtroAno !== "todos" || filtroStatus !== "todos";

  const relatoriosFiltrados = relatorios.filter((relatorio) => {
    if (busca && !relatorio.cliente.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroAno !== "todos" && String(relatorio.ano) !== filtroAno) return false;
    if (filtroStatus !== "todos" && relatorio.status !== filtroStatus) return false;
    return true;
  });

  const squadsParaExibir = squads.filter((squad) => {
    if (!squad.arquivado) return true;
    return relatorios.some((r) => r.squad_id === squad.id);
  });

  const relatoriosDoSquadAberto = squadAberto
    ? relatoriosFiltrados.filter((r) => r.squad_id === squadAberto.id)
    : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="rotulo text-cinza">
            <span className="text-vermelho">LETS</span> · Relatórios
          </p>
          <h1 className="mt-1 text-3xl font-light text-tinta">Painel</h1>
        </div>
        <div className="flex items-center gap-3">
          {identidadeAtual && (
            <span className="rotulo text-cinza">Você: {identidadeAtual}</span>
          )}
          <Link
            href="/squads"
            className="rotulo border border-tinta/20 px-4 py-2 text-tinta hover:border-vermelho hover:text-vermelho"
          >
            Gerenciar squads
          </Link>
          <button
            onClick={() => setModalAberto(true)}
            className="rotulo bg-vermelho px-4 py-2 text-creme hover:opacity-90"
          >
            Novo relatório
          </button>
          <form method="post" action="/api/auth/trocar-pessoa">
            <button
              type="submit"
              className="rotulo border border-tinta/20 px-4 py-2 text-tinta hover:border-vermelho hover:text-vermelho"
            >
              Trocar pessoa
            </button>
          </form>
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <label htmlFor="busca-cliente" className="sr-only">
          Buscar cliente
        </label>
        <input
          id="busca-cliente"
          type="search"
          placeholder="Buscar cliente…"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          className="min-w-48 flex-1 border border-tinta/20 px-3 py-2 text-tinta focus-visible:border-vermelho"
        />
        <label htmlFor="filtro-ano" className="sr-only">
          Filtrar por ano
        </label>
        <select
          id="filtro-ano"
          value={filtroAno}
          onChange={(event) => setFiltroAno(event.target.value)}
          className="border border-tinta/20 bg-white px-3 py-2 text-tinta"
        >
          <option value="todos">Todo ano</option>
          {anosDisponiveis.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
        <label htmlFor="filtro-status" className="sr-only">
          Filtrar por status
        </label>
        <select
          id="filtro-status"
          value={filtroStatus}
          onChange={(event) => setFiltroStatus(event.target.value as RelatorioStatus | "todos")}
          className="border border-tinta/20 bg-white px-3 py-2 text-tinta"
        >
          <option value="todos">Todo status</option>
          {STATUS_OPCOES.map((status) => (
            <option key={status} value={status}>
              {ROTULO_STATUS[status]}
            </option>
          ))}
        </select>
      </div>

      {buscaAtiva ? (
        <div className="flex flex-col gap-2">
          <p className="rotulo text-cinza">
            {relatoriosFiltrados.length} resultado{relatoriosFiltrados.length === 1 ? "" : "s"}
          </p>
          {relatoriosFiltrados.length === 0 ? (
            <p className="text-sm text-cinza">Nenhum relatório encontrado.</p>
          ) : (
            relatoriosFiltrados.map((relatorio) => (
              <CardRelatorio
                key={relatorio.id}
                relatorio={relatorio}
                squads={squadsAtivos}
                progresso={progressoPorRelatorio[relatorio.id] ?? 0}
                identidadeAtual={identidadeAtual}
              />
            ))
          )}
        </div>
      ) : squadAberto ? (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setSquadAbertoId(null)}
            className="rotulo flex w-fit items-center gap-2 text-cinza hover:text-vermelho"
          >
            ← Squads
          </button>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0"
              style={{ backgroundColor: squadAberto.cor }}
              aria-hidden
            />
            <h2 className="text-xl text-tinta">{squadAberto.nome}</h2>
          </div>
          {relatoriosDoSquadAberto.length === 0 ? (
            <p className="text-sm text-cinza">
              Nenhum relatório aqui ainda. Clique em &ldquo;Novo relatório&rdquo; para começar.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {relatoriosDoSquadAberto.map((relatorio) => (
                <CardRelatorio
                  key={relatorio.id}
                  relatorio={relatorio}
                  squads={squadsAtivos}
                  progresso={progressoPorRelatorio[relatorio.id] ?? 0}
                  identidadeAtual={identidadeAtual}
                />
              ))}
            </div>
          )}
        </div>
      ) : squadsParaExibir.length === 0 ? (
        <p className="text-cinza">
          Nenhum squad cadastrado ainda. Comece em &ldquo;Gerenciar squads&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {squadsParaExibir.map((squad) => (
            <SquadFolderCard
              key={squad.id}
              squad={squad}
              quantidade={relatorios.filter((r) => r.squad_id === squad.id).length}
              onAbrir={() => setSquadAbertoId(squad.id)}
            />
          ))}
        </div>
      )}

      {modalAberto && (
        <NovoRelatorioModal squads={squadsAtivos} onClose={() => setModalAberto(false)} />
      )}
    </div>
  );
}
