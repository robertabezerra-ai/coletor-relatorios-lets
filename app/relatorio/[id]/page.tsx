import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarAtualizacoes, buscarRelatorio, buscarRespostas } from "@/lib/data/relatorios";
import { listarBlocos } from "@/lib/schema";
import { FormularioClient } from "@/components/formulario/FormularioClient";
import { comRetentativa } from "@/lib/comRetentativa";
import { obterIdentidadeAtual } from "@/lib/identidade";

export default async function RelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const relatorio = await comRetentativa(() => buscarRelatorio(id));
  if (!relatorio) notFound();

  const [respostas, atualizacoes, identidadeAtual] = await Promise.all([
    buscarRespostas(id),
    buscarAtualizacoes(id),
    obterIdentidadeAtual(),
  ]);

  // Relatório sem criador registrado (de antes do login compartilhado)
  // continua editável por qualquer um.
  const podeEditar = !relatorio.criador_nome || relatorio.criador_nome === identidadeAtual;

  return (
    <FormularioClient
      relatorioId={relatorio.id}
      cliente={relatorio.cliente}
      squadNome={relatorio.squads?.nome ?? ""}
      ano={relatorio.ano}
      blocos={listarBlocos()}
      respostas={respostas}
      atualizacoes={atualizacoes}
      podeEditar={podeEditar}
      criadoPorNome={relatorio.criador_nome}
    />
  );
}
