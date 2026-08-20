import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarRelatorio } from "@/lib/data/relatorios";
import { listarHistorico } from "@/lib/data/historico";
import { listarPerguntasCustom } from "@/lib/data/perguntasCustom";
import { resolverCampo } from "@/lib/historico";
import { HistoricoClient } from "@/components/historico/HistoricoClient";

export default async function HistoricoPage({
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

  const relatorio = await buscarRelatorio(id);
  if (!relatorio) notFound();

  const [log, perguntasCustom] = await Promise.all([
    listarHistorico(id),
    listarPerguntasCustom(id),
  ]);

  const entradas = log.map((linha) => ({
    ...linha,
    ...resolverCampo(linha.campo_id, perguntasCustom),
  }));

  return (
    <HistoricoClient relatorioId={relatorio.id} cliente={relatorio.cliente} entradas={entradas} />
  );
}
