import { cookies } from "next/headers";
import { IDENTIDADE_COOKIE } from "@/lib/identidadeCookie";

export async function obterIdentidadeAtual(): Promise<string | null> {
  const store = await cookies();
  return store.get(IDENTIDADE_COOKIE)?.value ?? null;
}
