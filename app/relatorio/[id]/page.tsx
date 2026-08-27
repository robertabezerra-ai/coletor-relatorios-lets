import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarAtualizacoes, buscarRelatorio, buscarRespostas } from "@/lib/data/relatorios";
import { listarPerguntasCustom } from "@/lib/data/perguntasCustom";
import { listarBlocos } from "@/lib/schema";
import { FormularioClient } from "@/components/formulario/FormularioClient";
import { comRetentativa } from "@/lib/comRetentativa";

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

  const [respostas, atualizacoes, perguntasCustom] = await Promise.all([
    buscarRespostas(id),
    buscarAtualizacoes(id),
    listarPerguntasCustom(id),
  ]);

  return (
    <FormularioClient
      relatorioId={relatorio.id}
      cliente={relatorio.cliente}
      squadNome={relatorio.squads?.nome ?? ""}
      ano={relatorio.ano}
      blocos={listarBlocos()}
      respostas={respostas}
      atualizacoes={atualizacoes}
      perguntasCustomIniciais={perguntasCustom}
    />
  );
}
