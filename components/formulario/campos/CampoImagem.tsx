"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useAutosaveCampo } from "@/hooks/useAutosaveCampo";
import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import type { Campo } from "@/lib/schema";

type ImagemValor = { caminho: string } | null;

export function CampoImagem({
  campo,
  relatorioId,
}: {
  campo: Campo;
  relatorioId: string;
}) {
  const multiplo = Boolean(campo.multiplo);
  const [valor, setValor, conflito, resolverConflito] = useAutosaveCampo(
    relatorioId,
    campo.id,
    multiplo ? [] : null,
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const itens: ImagemValor[] = multiplo
    ? Array.isArray(valor)
      ? (valor as ImagemValor[])
      : []
    : valor
      ? [valor as ImagemValor]
      : [];

  async function handleArquivo(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;

    setEnviando(true);
    setErro("");

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("campo_id", campo.id);

    try {
      const resposta = await fetch(`/api/relatorio/${relatorioId}/upload`, {
        method: "POST",
        body: formData,
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.error || "Falha no upload.");

      const novoItem: ImagemValor = { caminho: dados.caminho };
      setValor(multiplo ? [...itens, novoItem] : novoItem);
    } catch (erroCapturado) {
      setErro(erroCapturado instanceof Error ? erroCapturado.message : "Falha no upload.");
    } finally {
      setEnviando(false);
    }
  }

  function remover(indice: number) {
    setValor(multiplo ? itens.filter((_, i) => i !== indice) : null);
  }

  return (
    <CampoWrapper campo={campo} conflito={conflito} onResolverConflito={resolverConflito}>
      <div className="flex flex-col gap-3">
        {itens.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {itens.map(
              (item, indice) =>
                item && (
                  <PreviewImagem
                    key={item.caminho}
                    caminho={item.caminho}
                    relatorioId={relatorioId}
                    onRemover={() => remover(indice)}
                  />
                ),
            )}
          </div>
        )}

        {(multiplo || itens.length === 0) && (
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
        )}

        {erro && (
          <p role="alert" className="text-sm text-vermelho">
            {erro}
          </p>
        )}
      </div>
    </CampoWrapper>
  );
}

function PreviewImagem({
  caminho,
  relatorioId,
  onRemover,
}: {
  caminho: string;
  relatorioId: string;
  onRemover: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    let cancelado = false;
    fetch(`/api/relatorio/${relatorioId}/imagem-url?caminho=${encodeURIComponent(caminho)}`)
      .then((resposta) => resposta.json())
      .then((dados) => {
        if (cancelado) return;
        if (dados.url) setUrl(dados.url);
        else setFalhou(true);
      })
      .catch(() => {
        if (!cancelado) setFalhou(true);
      });
    return () => {
      cancelado = true;
    };
  }, [caminho, relatorioId]);

  return (
    <div className="relative h-24 w-24 shrink-0 border border-tinta/10">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-center text-xs text-cinza">
          {falhou ? "Não foi possível carregar" : "carregando…"}
        </div>
      )}
      <button
        type="button"
        onClick={onRemover}
        aria-label="Remover imagem"
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-vermelho text-xs text-creme"
      >
        ✕
      </button>
    </div>
  );
}
