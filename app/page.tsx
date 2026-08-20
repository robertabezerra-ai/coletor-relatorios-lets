import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listarSquads } from "@/lib/data/squads";
import { listarRelatoriosPainel, listarRespostasAgrupadas } from "@/lib/data/relatorios";
import { PainelClient } from "@/components/painel/PainelClient";
import { blocosVisiveis, listarBlocos, obterSecoesSelecionadas } from "@/lib/schema";
import { calcularProgresso } from "@/lib/progresso";
import { obterIdentidadeAtual } from "@/lib/identidade";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [squads, relatorios, respostasAgrupadas] = await Promise.all([
    listarSquads(),
    listarRelatoriosPainel(),
    listarRespostasAgrupadas(),
  ]);

  const blocos = listarBlocos();
  const progressoPorRelatorio: Record<string, number> = {};
  for (const relatorio of relatorios) {
    const respostas = respostasAgrupadas[relatorio.id] ?? {};
    const secoes = obterSecoesSelecionadas(respostas);
    const visiveis = blocosVisiveis(blocos, secoes);
    progressoPorRelatorio[relatorio.id] = calcularProgresso(visiveis, respostas).percentualGeral;
  }

  const identidadeAtual = await obterIdentidadeAtual();

  return (
    <PainelClient
      squads={squads}
      relatorios={relatorios}
      progressoPorRelatorio={progressoPorRelatorio}
      identidadeAtual={identidadeAtual ?? ""}
    />
  );
}
