import { createClient } from "@/lib/supabase/server";
import type { Squad } from "@/lib/types";

export async function listarSquads(): Promise<Squad[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("squads")
    .select("*")
    .order("nome");

  if (error) throw error;
  return data;
}
