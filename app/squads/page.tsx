import { createClient } from "@/lib/supabase/server";
import { listarSquads } from "@/lib/data/squads";
import { GerenciarSquadsClient } from "@/components/squads/GerenciarSquadsClient";

export default async function SquadsPage() {
  const supabase = await createClient();

  const [squads, { data: relatorios }] = await Promise.all([
    listarSquads(),
    supabase.from("relatorios").select("squad_id"),
  ]);

  const contagemPorSquad = new Map<string, number>();
  for (const relatorio of relatorios ?? []) {
    contagemPorSquad.set(
      relatorio.squad_id,
      (contagemPorSquad.get(relatorio.squad_id) ?? 0) + 1,
    );
  }

  return (
    <GerenciarSquadsClient
      squads={squads}
      contagemPorSquad={Object.fromEntries(contagemPorSquad)}
    />
  );
}
