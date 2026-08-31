"use client";

import { useEffect, useState } from "react";
import { EstadoSalvamentoProvider } from "@/components/formulario/EstadoSalvamentoContext";
import { RespostasProvider, useRespostas } from "@/components/formulario/RespostasContext";
import { MenuBlocos } from "@/components/formulario/MenuBlocos";
import { SeletorBlocosMobile } from "@/components/formulario/SeletorBlocosMobile";
import { CabecalhoFormulario } from "@/components/formulario/CabecalhoFormulario";
import { BlocoAtivo } from "@/components/formulario/BlocoAtivo";
import { BlocoPerguntasCustom } from "@/components/formulario/BlocoPerguntasCustom";
import { PainelFaltaPreencher } from "@/components/formulario/PainelFaltaPreencher";
import { blocosVisiveis, obterSecoesSelecionadas, type Bloco } from "@/lib/schema";
import { calcularProgresso, camposEssenciaisVazios } from "@/lib/progresso";
import { coletarImagens } from "@/lib/docx/imagens";
import type { PerguntaCustom } from "@/lib/perguntasCustom";

export function FormularioClient({
  relatorioId,
  cliente,
  squadNome,
  ano,
  blocos,
  respostas,
  atualizacoes,
  perguntasCustomIniciais,
}: {
  relatorioId: string;
  cliente: string;
  squadNome: string;
  ano: number;
  blocos: Bloco[];
  respostas: Record<string, unknown>;
  atualizacoes: Record<string, string>;
  perguntasCustomIniciais: PerguntaCustom[];
}) {
  return (
    <EstadoSalvamentoProvider>
      <RespostasProvider respostasIniciais={respostas} atualizacoesIniciais={atualizacoes}>
        <FormularioInterno
          relatorioId={relatorioId}
          cliente={cliente}
          squadNome={squadNome}
          ano={ano}
          blocos={blocos}
          perguntasCustomIniciais={perguntasCustomIniciais}
        />
      </RespostasProvider>
    </EstadoSalvamentoProvider>
  );
}

function FormularioInterno({
  relatorioId,
  cliente,
  squadNome,
  ano,
  blocos,
  perguntasCustomIniciais,
}: {
  relatorioId: string;
  cliente: string;
  squadNome: string;
  ano: number;
  blocos: Bloco[];
  perguntasCustomIniciais: PerguntaCustom[];
}) {
  const { respostas } = useRespostas();
  const secoesSelecionadas = obterSecoesSelecionadas(respostas);
  const visiveis = blocosVisiveis(blocos, secoesSelecionadas);

  const [perguntasCustom, setPerguntasCustom] = useState(perguntasCustomIniciais);
  const [blocoAtivoId, setBlocoAtivoId] = useState(blocos[0]?.id ?? "");
  const [campoParaFocar, setCampoParaFocar] = useState<string | null>(null);

  useEffect(() => {
    if (visiveis.length > 0 && !visiveis.some((bloco) => bloco.id === blocoAtivoId)) {
      setBlocoAtivoId(visiveis[0].id);
    }
  }, [visiveis, blocoAtivoId]);

  useEffect(() => {
    if (!campoParaFocar) return;
    const wrapper = document.getElementById(`campo-${campoParaFocar}`);
    wrapper?.scrollIntoView({ behavior: "smooth", block: "center" });
    (document.getElementById(campoParaFocar) ?? wrapper)?.focus();
    setCampoParaFocar(null);
  }, [blocoAtivoId, campoParaFocar]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.altKey || (event.key !== "ArrowRight" && event.key !== "ArrowLeft")) return;

      const indiceAtual = visiveis.findIndex((bloco) => bloco.id === blocoAtivoId);
      if (indiceAtual === -1) return;

      const proximoIndice = event.key === "ArrowRight" ? indiceAtual + 1 : indiceAtual - 1;
      if (proximoIndice < 0 || proximoIndice >= visiveis.length) return;

      event.preventDefault();
      setBlocoAtivoId(visiveis[proximoIndice].id);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visiveis, blocoAtivoId]);

  const blocoAtivo = visiveis.find((bloco) => bloco.id === blocoAtivoId) ?? visiveis[0];
  const progresso = calcularProgresso(visiveis, respostas);
  const essenciaisVazios = camposEssenciaisVazios(visiveis, respostas);
  const temImagens = coletarImagens(visiveis, respostas, perguntasCustom).length > 0;

  function irParaCampo(blocoId: string, campoId: string) {
    setBlocoAtivoId(blocoId);
    setCampoParaFocar(campoId);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CabecalhoFormulario
        relatorioId={relatorioId}
        cliente={cliente}
        squadNome={squadNome}
        ano={ano}
        percentualGeral={progresso.percentualGeral}
        temImagens={temImagens}
      />
      <SeletorBlocosMobile
        blocos={visiveis}
        blocoAtivoId={blocoAtivoId}
        onSelecionar={setBlocoAtivoId}
        progressoPorBloco={progresso.porBloco}
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-tinta/10 px-3 py-6 md:block">
          <MenuBlocos
            blocos={visiveis}
            blocoAtivoId={blocoAtivoId}
            onSelecionar={setBlocoAtivoId}
            progressoPorBloco={progresso.porBloco}
          />
        </aside>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {essenciaisVazios.length > 0 && (
            <PainelFaltaPreencher itens={essenciaisVazios} onIrPara={irParaCampo} />
          )}
          {blocoAtivo?.id === "b15" ? (
            <BlocoPerguntasCustom
              relatorioId={relatorioId}
              perguntas={perguntasCustom}
              onMudou={setPerguntasCustom}
            />
          ) : (
            blocoAtivo && <BlocoAtivo bloco={blocoAtivo} relatorioId={relatorioId} />
          )}
        </main>
      </div>
    </div>
  );
}
