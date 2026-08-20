"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Estado = "idle" | "enviando" | "erro";

export default function LoginPage() {
  const [senha, setSenha] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensagemErro, setMensagemErro] = useState("");
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setEstado("enviando");
    setMensagemErro("");

    const resposta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });

    if (!resposta.ok) {
      const { error } = await resposta.json().catch(() => ({ error: "" }));
      setEstado("erro");
      setMensagemErro(error || "Não foi possível entrar. Tente de novo.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-tinta px-6">
      <div className="w-full max-w-sm">
        <p className="mb-12 text-center text-2xl font-light tracking-tight text-creme">
          <span className="font-semibold text-vermelho">LETS</span> · Relatórios
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="senha" className="rotulo text-creme/70">
              Senha da equipe
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              className="border border-creme/30 bg-transparent px-4 py-3 text-creme placeholder:text-creme/30 focus-visible:border-vermelho"
            />
          </div>

          {estado === "erro" && (
            <p role="alert" className="text-sm text-vermelho">
              {mensagemErro}
            </p>
          )}

          <button
            type="submit"
            disabled={estado === "enviando"}
            className="mt-2 bg-vermelho px-4 py-3 font-semibold text-creme transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {estado === "enviando" ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
