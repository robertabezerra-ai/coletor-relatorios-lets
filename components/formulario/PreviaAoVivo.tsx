"use client";

import { useEffect, useRef, useState } from "react";
import { useRespostas } from "@/components/formulario/RespostasContext";
import { montarDados, secoesParaTemplate } from "@/lib/relatorioHtml/mapearDados";
import { injetarDados } from "@/lib/relatorioHtml/injetar";
import { carregarTemplate, prepararParaPrevia } from "@/lib/relatorioHtml/modoPrevia";
import { obterSecoesSelecionadas } from "@/lib/schema";
import { TelaCheiaRelatorio } from "@/components/formulario/TelaCheiaRelatorio";

// Cada bloco do formulário corresponde a uma seção do relatório em HTML —
// usado só pra rolar a prévia até o pedaço relevante do que está sendo
// preenchido agora.
const SECAO_POR_BLOCO: Record<string, string> = {
  b2: "pilares",
  b3: "valor",
  b4: "resumo",
  b5: "digital",
  b6: "digital",
  b7: "traficoPago",
  b8: "imprensa",
  b9: "rankings",
  b10: "destaques",
  b11: "inteligenciaAplicada",
  b12: "plano",
  b13: "acompanhamentosFuturos",
  b14: "encerramento",
};

// Só existe enquanto a prévia está aberta: no painel lateral (telas largas)
// e/ou em tela cheia, pra conferir tudo antes de baixar.
export function PreviaAoVivo({
  cliente,
  ano,
  blocoAtivoId,
  ampliada,
  onAmpliar,
  onFecharAmpliada,
  onFechar,
}: {
  cliente: string;
  ano: number;
  blocoAtivoId: string;
  ampliada: boolean;
  onAmpliar: () => void;
  onFecharAmpliada: () => void;
  onFechar: () => void;
}) {
  const { respostas } = useRespostas();
  const [templateTexto, setTemplateTexto] = useState<string | null>(null);
  const [htmlAtual, setHtmlAtual] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Só rola a prévia até a seção quando o bloco ativo muda de verdade —
  // a cada resposta digitada o iframe é recarregado, e sem isso ele
  // pulava pro topo da seção a cada letra, atrapalhando quem preenche.
  const blocoRoladoRef = useRef<string | null>(null);

  useEffect(() => {
    carregarTemplate()
      .then(setTemplateTexto)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!templateTexto) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const secoesSelecionadas = obterSecoesSelecionadas(respostas);
      const secoes = secoesParaTemplate(secoesSelecionadas);
      // A prévia nunca precisa de imagem real — o placeholder do próprio
      // template já mostra o tamanho/proporção certos, sem gastar tempo
      // buscando a imagem enviada.
      const dados = await montarDados(respostas, { cliente, ano }, async () => null);
      const html = prepararParaPrevia(injetarDados(templateTexto, secoes, dados));
      setHtmlAtual(html);

      const iframe = iframeRef.current;
      if (!iframe) return;

      const scrollAtual = iframe.contentWindow?.scrollY ?? 0;
      const mudouDeBloco = blocoRoladoRef.current !== blocoAtivoId;
      const secaoAlvo = SECAO_POR_BLOCO[blocoAtivoId];

      iframe.onload = () => {
        if (mudouDeBloco && secaoAlvo) {
          iframe.contentDocument?.getElementById(secaoAlvo)?.scrollIntoView({ block: "start" });
          blocoRoladoRef.current = blocoAtivoId;
        } else {
          // Sem "instant" aqui, o scroll-behavior:smooth do próprio template
          // faz esse reposicionamento deslizar visivelmente a cada resposta
          // digitada — exatamente o movimento que estamos evitando.
          iframe.contentWindow?.scrollTo({ top: scrollAtual, left: 0, behavior: "instant" });
        }
      };
      iframe.srcdoc = html;
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [respostas, templateTexto, blocoAtivoId, cliente, ano]);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[440px] self-start shrink-0 flex-col border-l border-tinta/10 xl:flex">
        <div className="flex items-center justify-between gap-2 border-b border-tinta/10 px-4 py-3">
          <p className="rotulo text-cinza">Prévia do relatório</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAmpliar}
              className="rotulo text-tinta hover:text-vermelho"
            >
              Ampliar ⤢
            </button>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar prévia"
              className="text-cinza hover:text-vermelho"
            >
              ✕
            </button>
          </div>
        </div>
        {!templateTexto && (
          <p className="px-4 py-6 text-sm text-cinza">Carregando prévia…</p>
        )}
        <iframe
          ref={iframeRef}
          title="Prévia do relatório"
          className="flex-1 border-0"
          style={{ colorScheme: "light" }}
        />
      </aside>

      {ampliada && (
        <TelaCheiaRelatorio
          titulo="Prévia do relatório"
          subtitulo="É assim que o relatório vai ficar com as respostas preenchidas até agora."
          html={htmlAtual}
          secaoInicial={SECAO_POR_BLOCO[blocoAtivoId]}
          onClose={onFecharAmpliada}
        />
      )}
    </>
  );
}
