"use client";

import { useEffect, useRef, useState } from "react";
import { TelaCheiaRelatorio } from "@/components/formulario/TelaCheiaRelatorio";
import { montarDados, secoesParaTemplate } from "@/lib/relatorioHtml/mapearDados";
import { injetarDados } from "@/lib/relatorioHtml/injetar";
import { carregarTemplate, prepararParaPrevia } from "@/lib/relatorioHtml/modoPrevia";
import {
  CLIENTE_EXEMPLO,
  EXEMPLO_POR_BLOCO,
  RESPOSTAS_EXEMPLO,
} from "@/lib/relatorioHtml/exemplos";

// O exemplo é desenhado na largura de um computador e reduzido para caber na
// coluna do formulário — assim fica igual a um "print" do relatório final.
const LARGURA_RELATORIO = 1200;
const ALTURA_MAXIMA_MINIATURA = 340;
const CHAVE_OCULTOS = "exemplos-secao-ocultos";

let htmlBasePromessa: Promise<{ template: string; dados: unknown }> | null = null;

function carregarBase() {
  if (!htmlBasePromessa) {
    htmlBasePromessa = Promise.all([
      carregarTemplate(),
      montarDados(RESPOSTAS_EXEMPLO, CLIENTE_EXEMPLO, async () => null),
    ]).then(([template, dados]) => ({ template, dados }));
    htmlBasePromessa.catch(() => {
      htmlBasePromessa = null;
    });
  }
  return htmlBasePromessa;
}

function lerOcultos(): boolean {
  try {
    return localStorage.getItem(CHAVE_OCULTOS) === "1";
  } catch {
    return false;
  }
}

function salvarOcultos(ocultos: boolean) {
  try {
    localStorage.setItem(CHAVE_OCULTOS, ocultos ? "1" : "0");
  } catch {
    // Sem localStorage a preferência só não é lembrada na próxima visita.
  }
}

export function ExemploSecao({ blocoId }: { blocoId: string }) {
  const exemplo = EXEMPLO_POR_BLOCO[blocoId];
  const [html, setHtml] = useState<string | null>(null);
  const [oculto, setOculto] = useState(false);
  const [ampliado, setAmpliado] = useState(false);
  const [larguraCaixa, setLarguraCaixa] = useState(0);
  const [alturaConteudo, setAlturaConteudo] = useState(0);
  const caixaRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setOculto(lerOcultos());
  }, []);

  useEffect(() => {
    if (!exemplo) return;
    let cancelado = false;
    setHtml(null);
    setAlturaConteudo(0);
    carregarBase()
      .then(({ template, dados }) => {
        if (cancelado) return;
        const secoes = secoesParaTemplate(RESPOSTAS_EXEMPLO.secoes as string[]);
        setHtml(prepararParaPrevia(injetarDados(template, secoes, dados), exemplo.recorte));
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [exemplo]);

  useEffect(() => {
    const caixa = caixaRef.current;
    if (!caixa) return;
    const observador = new ResizeObserver(([entrada]) => setLarguraCaixa(entrada.contentRect.width));
    observador.observe(caixa);
    return () => observador.disconnect();
  }, [oculto, html]);

  if (!exemplo) return null;

  function alternar() {
    setOculto((atual) => {
      salvarOcultos(!atual);
      return !atual;
    });
  }

  // Fontes e gráfico carregam depois do "load" e mudam a altura — mede de novo.
  function medirAltura() {
    const documento = iframeRef.current?.contentDocument;
    if (!documento) return;
    // Mede o conteúdo (#app), não o documento — o documento nunca fica menor
    // que a altura atual do iframe e a miniatura não encolheria.
    const medir = () =>
      setAlturaConteudo(
        documento.getElementById("app")?.offsetHeight || documento.documentElement.scrollHeight,
      );
    medir();
    documento.fonts?.ready.then(medir).catch(() => {});
    setTimeout(medir, 800);
  }

  const escala = larguraCaixa > 0 ? larguraCaixa / LARGURA_RELATORIO : 0;
  const alturaReduzida = alturaConteudo * escala;
  const alturaCaixa = Math.min(alturaReduzida || 200, ALTURA_MAXIMA_MINIATURA);
  const cortado = alturaReduzida > ALTURA_MAXIMA_MINIATURA;

  return (
    <section className="mt-6 border border-tinta/10 bg-bege">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="rotulo text-tinta">Exemplo: como esta seção fica no relatório</p>
          {!oculto && (
            <p className="mt-1 text-sm text-cinza">
              {exemplo.legenda} <span className="text-vermelho">Dados fictícios.</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={alternar}
          className="rotulo shrink-0 text-cinza hover:text-vermelho"
          aria-expanded={!oculto}
        >
          {oculto ? "Mostrar" : "Ocultar"}
        </button>
      </div>

      {!oculto && (
        <div className="px-4 pb-4">
          <div
            ref={caixaRef}
            className="relative overflow-hidden border border-tinta/10 bg-white"
            style={{ height: alturaCaixa }}
          >
            {html && escala > 0 && (
              <iframe
                ref={iframeRef}
                title={`Exemplo da seção ${blocoId}`}
                srcDoc={html}
                onLoad={medirAltura}
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                style={{
                  width: LARGURA_RELATORIO,
                  height: alturaConteudo || 800,
                  transform: `scale(${escala})`,
                  colorScheme: "light",
                }}
              />
            )}
            {!html && <p className="px-4 py-4 text-sm text-cinza">Carregando exemplo…</p>}
            {cortado && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
            )}
            <button
              type="button"
              onClick={() => setAmpliado(true)}
              className="group absolute inset-0 flex items-end justify-center pb-3"
              aria-label="Ampliar exemplo"
            >
              <span className="rotulo bg-tinta px-3 py-1.5 text-creme opacity-90 group-hover:bg-vermelho">
                Ampliar exemplo ⤢
              </span>
            </button>
          </div>
        </div>
      )}

      {ampliado && (
        <TelaCheiaRelatorio
          titulo="Exemplo com dados fictícios"
          subtitulo={exemplo.legenda}
          html={html}
          onClose={() => setAmpliado(false)}
        />
      )}
    </section>
  );
}
