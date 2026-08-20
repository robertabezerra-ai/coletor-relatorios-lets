"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mensagemErroAmigavel } from "@/lib/erroAmigavel";
import type { SquadTipo } from "@/lib/types";

export async function criarSquad(dados: { nome: string; cor: string; tipo: SquadTipo }) {
  const supabase = await createClient();
  const { error } = await supabase.from("squads").insert({
    nome: dados.nome.trim(),
    cor: dados.cor,
    tipo: dados.tipo,
  });

  if (error) return { error: mensagemErroAmigavel(error, "Já existe um squad com esse nome.") };

  revalidatePath("/");
  revalidatePath("/squads");
  return { error: null };
}

export async function atualizarSquad(
  id: string,
  dados: { nome: string; cor: string; tipo: SquadTipo },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("squads")
    .update({ nome: dados.nome.trim(), cor: dados.cor, tipo: dados.tipo })
    .eq("id", id);

  if (error) return { error: mensagemErroAmigavel(error, "Já existe um squad com esse nome.") };

  revalidatePath("/");
  revalidatePath("/squads");
  return { error: null };
}

export async function arquivarSquad(id: string, arquivado: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("squads")
    .update({ arquivado })
    .eq("id", id);

  if (error) return { error: mensagemErroAmigavel(error) };

  revalidatePath("/");
  revalidatePath("/squads");
  return { error: null };
}

export async function excluirSquad(id: string) {
  const supabase = await createClient();

  const { count, error: erroContagem } = await supabase
    .from("relatorios")
    .select("id", { count: "exact", head: true })
    .eq("squad_id", id);

  if (erroContagem) return { error: mensagemErroAmigavel(erroContagem) };
  if (count && count > 0) {
    return {
      error: `Esse squad tem ${count} relatório${count > 1 ? "s" : ""}. Arquive em vez de excluir.`,
    };
  }

  const { error } = await supabase.from("squads").delete().eq("id", id);
  if (error) return { error: mensagemErroAmigavel(error) };

  revalidatePath("/");
  revalidatePath("/squads");
  return { error: null };
}
