import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { IDENTIDADE_COOKIE } from "@/lib/identidadeCookie";

// Apaga o nome escolhido e volta para a lista de nomes numa navegação comum,
// sem server action — a action anterior às vezes caía na tela de erro.
export async function POST() {
  const store = await cookies();
  store.delete(IDENTIDADE_COOKIE);

  return new NextResponse(null, { status: 303, headers: { Location: "/escolher-nome" } });
}
