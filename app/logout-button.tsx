"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { limparIdentidade } from "@/lib/actions/identidade";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    // scope "local": a conta do Supabase é compartilhada por toda a
    // equipe — um signOut "global" aqui derrubaria a sessão de todo mundo.
    await supabase.auth.signOut({ scope: "local" });
    await limparIdentidade();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rotulo border border-tinta/20 px-4 py-2 text-tinta hover:border-vermelho hover:text-vermelho"
    >
      Sair
    </button>
  );
}
