"use client";

import Link from "next/link";

export default function ErroGlobal({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="rotulo text-cinza">
        <span className="text-vermelho">LETS</span> · Relatórios
      </p>
      <h1 className="text-2xl font-light text-tinta">Algo deu errado</h1>
      <p className="max-w-sm text-cinza">
        Não conseguimos carregar essa tela agora. Tenta de novo — se continuar acontecendo, avisa
        quem cuida do app.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="rotulo bg-vermelho px-4 py-2 text-creme hover:opacity-90"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="rotulo border border-tinta/20 px-4 py-2 text-tinta hover:border-vermelho hover:text-vermelho"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
