import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="rotulo text-cinza">
        <span className="text-vermelho">LETS</span> · Relatórios
      </p>
      <h1 className="text-2xl font-light text-tinta">Página não encontrada</h1>
      <p className="max-w-sm text-cinza">
        O que você procurava não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="rotulo mt-2 bg-vermelho px-4 py-2 text-creme hover:opacity-90"
      >
        Voltar ao painel
      </Link>
    </div>
  );
}
