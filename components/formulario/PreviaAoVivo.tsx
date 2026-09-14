"use client";

import { useEffect, useRef, useState } from "react";
import { useRespostas } from "@/components/formulario/RespostasContext";
import { montarDados, secoesParaTemplate } from "@/lib/relatorioHtml/mapearDados";
import { injetarDados } from "@/lib/relatorioHtml/injetar";
import { obterSecoesSelecionadas } from "@/lib/schema";

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

export function PreviaAoVivo({
  cliente,
  ano,
  blocoAtivoId,
}: {
  cliente: string;
  ano: number;
  blocoAtivoId: string;
}) {
  const { respostas } = useRespostas();
  const [templateTexto, setTemplateTexto] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Só rola a prévia até a seção quando o bloco ativo muda de verdade —
  // a cada resposta digitada o iframe é recarregado, e sem isso ele
  // pulava pro topo da seção a cada letra, atrapalhando quem preenche.
  const blocoRoladoRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/relatorio-template")
      .then((resposta) => resposta.text())
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
      const html = injetarDados(templateTexto, secoes, dados);

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
    <div className="flex h-full flex-col">
      <p className="rotulo border-b border-tinta/10 px-4 py-3 text-cinza">
        Prévia do relatório
      </p>
      {!templateTexto && (
        <p className="px-4 py-6 text-sm text-cinza">Carregando prévia…</p>
      )}
      <iframe
        ref={iframeRef}
        title="Prévia do relatório"
        className="flex-1 border-0"
        style={{ colorScheme: "light" }}
      />
    </div>
  );
}
