"use client";

import { useEffect, useState, type ChangeEvent } from "react";

export type ImagemValorSimples = { caminho: string } | null;

export function ImagemUploadInput({
  relatorioId,
  campoId,
  valor,
  onChange,
}: {
  relatorioId: string;
  campoId: string;
  valor: ImagemValorSimples;
  onChange: (valor: ImagemValorSimples) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [falhouCarregar, setFalhouCarregar] = useState(false);
  const [erroUpload, setErroUpload] = useState("");

  useEffect(() => {
    if (!valor?.caminho) {
      setUrl(null);
      return;
    }
    let cancelado = false;
    fetch(`/api/relatorio/${relatorioId}/imagem-url?caminho=${encodeURIComponent(valor.caminho)}`)
      .then((resposta) => resposta.json())
      .then((dados) => {
        if (cancelado) return;
        if (dados.url) setUrl(dados.url);
        else setFalhouCarregar(true);
      })
      .catch(() => {
        if (!cancelado) setFalhouCarregar(true);
      });
    return () => {
      cancelado = true;
    };
  }, [valor?.caminho, relatorioId]);

  async function handleArquivo(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;

    setEnviando(true);
    setErroUpload("");
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("campo_id", campoId);

    try {
      const resposta = await fetch(`/api/relatorio/${relatorioId}/upload`, {
        method: "POST",
        body: formData,
      });
      const dados = await resposta.json();
      if (resposta.ok) onChange({ caminho: dados.caminho });
      else setErroUpload(dados.error || "Falha no upload.");
    } catch {
      setErroUpload("Falha no upload.");
    } finally {
      setEnviando(false);
    }
  }

  if (valor?.caminho) {
    return (
      <div className="relative h-24 w-24">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          falhouCarregar && (
            <div className="flex h-full w-full items-center justify-center text-center text-xs text-cinza">
              Erro ao carregar
            </div>
          )
        )}
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remover imagem"
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-vermelho text-xs text-creme"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="rotulo w-fit cursor-pointer border border-dashed border-tinta/30 px-4 py-3 text-cinza hover:border-vermelho hover:text-vermelho">
        {enviando ? "Enviando…" : "Escolher imagem"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleArquivo}
          disabled={enviando}
        />
      </label>
      {erroUpload && (
        <p role="alert" className="text-sm text-vermelho">
          {erroUpload}
        </p>
      )}
    </div>
  );
}
