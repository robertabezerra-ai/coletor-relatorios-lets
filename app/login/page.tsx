"use client";

import { useState, type FormEvent } from "react";
import { ALLOWED_DOMAIN, isEmailDominioPermitido } from "@/lib/auth";

type Estado = "idle" | "enviando" | "enviado" | "erro";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensagemErro, setMensagemErro] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!isEmailDominioPermitido(email)) {
      setEstado("erro");
      setMensagemErro(`Use um e-mail @${ALLOWED_DOMAIN}.`);
      return;
    }

    setEstado("enviando");
    setMensagemErro("");

    const resposta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!resposta.ok) {
      const { error } = await resposta.json().catch(() => ({ error: "" }));
      setEstado("erro");
      setMensagemErro(error || "Não foi possível enviar o link. Tente de novo.");
      return;
    }

    setEstado("enviado");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-tinta px-6">
      <div className="w-full max-w-sm">
        <p className="mb-12 text-center text-2xl font-light tracking-tight text-creme">
          <span className="font-semibold text-vermelho">LETS</span> · Relatórios
        </p>

        {estado === "enviado" ? (
          <div className="border border-creme/20 bg-creme/5 px-6 py-8 text-center">
            <p className="text-creme">
              Enviamos um link de acesso para <strong>{email}</strong>.
            </p>
            <p className="rotulo mt-3 text-creme/60">confira sua caixa de entrada</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="rotulo text-creme/70">
                E-mail LETS
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={`voce@${ALLOWED_DOMAIN}`}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              {estado === "enviando" ? "Enviando…" : "Receber link de acesso"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
