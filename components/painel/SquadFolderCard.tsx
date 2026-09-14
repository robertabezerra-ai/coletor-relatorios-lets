"use client";

import type { Squad } from "@/lib/types";

export function SquadFolderCard({
  squad,
  quantidade,
  onAbrir,
}: {
  squad: Squad;
  quantidade: number;
  onAbrir: () => void;
}) {
  return (
    <button
      onClick={onAbrir}
      className="flex flex-col items-start gap-3 border border-tinta/10 bg-white p-5 text-left transition-colors hover:border-vermelho/40"
    >
      <svg viewBox="0 0 24 24" className="h-10 w-10 shrink-0" aria-hidden>
        <path
          d="M2 6.5C2 5.67 2.67 5 3.5 5H9l2 2h9.5c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-17C2.67 19 2 18.33 2 17.5v-11Z"
          fill={squad.cor}
          fillOpacity="0.16"
        />
        <path
          d="M2 8.5C2 7.67 2.67 7 3.5 7H9l2 2h9.5c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5h-17C2.67 19 2 18.33 2 17.5v-9Z"
          fill={squad.cor}
        />
      </svg>
      <div>
        <p className="text-tinta">{squad.nome}</p>
        <p className="rotulo mt-1 text-cinza">
          {quantidade} {quantidade === 1 ? "relatório" : "relatórios"}
          {squad.arquivado ? " · arquivado" : ""}
        </p>
      </div>
    </button>
  );
}
