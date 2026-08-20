"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buscarMembroEquipe } from "@/lib/equipeLets";
import { IDENTIDADE_COOKIE } from "@/lib/identidadeCookie";

const UM_ANO_EM_SEGUNDOS = 60 * 60 * 24 * 365;

export async function definirIdentidade(nome: string) {
  const membro = buscarMembroEquipe(nome);
  if (!membro) return { error: "Escolha um nome da lista." };

  const store = await cookies();
  store.set(IDENTIDADE_COOKIE, membro.nome, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UM_ANO_EM_SEGUNDOS,
  });

  redirect("/");
}

export async function limparIdentidade() {
  const store = await cookies();
  store.delete(IDENTIDADE_COOKIE);
}

export async function trocarPessoa() {
  const store = await cookies();
  store.delete(IDENTIDADE_COOKIE);
  redirect("/escolher-nome");
}
