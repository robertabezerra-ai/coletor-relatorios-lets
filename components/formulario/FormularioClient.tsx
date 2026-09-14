"use client";

import { useEffect, useState } from "react";
import { EstadoSalvamentoProvider } from "@/components/formulario/EstadoSalvamentoContext";
import { RespostasProvider, useRespostas } from "@/components/formulario/RespostasContext";
import { MenuBlocos } from "@/components/formulario/MenuBlocos";
import { SeletorBlocosMobile } from "@/components/formulario/SeletorBlocosMobile";
import { CabecalhoFormulario } from "@/components/formulario/CabecalhoFormulario";
import { BlocoAtivo } from "@/components/formulario/BlocoAtivo";
import { PainelFaltaPreencher } from "@/components/formulario/PainelFaltaPreencher";
import { PreviaAoVivo } from "@/components/formulario/PreviaAoVivo";
import { blocosVisiveis, obterSecoesSelecionadas, type Bloco } from "@/lib/schema";
import { calcularProgresso, camposEssenciaisVazios } from "@/lib/progresso";
import { coletarImagens } from "@/lib/docx/imagens";

export function FormularioClient({
  relatorioId,
  cliente,
  squadNome,
  ano,
  blocos,
  respostas,
  atualizacoes,
  podeEditar,
  criadoPorNome,
}: {
  relatorioId: string;
  cliente: string;
  squadNome: string;
  ano: number;
  blocos: Bloco[];
  respostas: Record<string, unknown>;
  atualizacoes: Record<string, string>;
  podeEditar: boolean;
  criadoPorNome: string | null;
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
          podeEditar={podeEditar}
          criadoPorNome={criadoPorNome}
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
  podeEditar,
  criadoPorNome,
}: {
  relatorioId: string;
  cliente: string;
  squadNome: string;
  ano: number;
  blocos: Bloco[];
  podeEditar: boolean;
  criadoPorNome: string | null;
}) {
  const { respostas } = useRespostas();
  const secoesSelecionadas = obterSecoesSelecionadas(respostas);
  const visiveis = blocosVisiveis(blocos, secoesSelecionadas);

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

  const indiceAtivo = visiveis.findIndex((bloco) => bloco.id === blocoAtivoId);
  const blocoAtivo = visiveis[indiceAtivo] ?? visiveis[0];
  const proximoBloco = indiceAtivo >= 0 ? visiveis[indiceAtivo + 1] : undefined;
  const progresso = calcularProgresso(visiveis, respostas);
  const essenciaisVazios = camposEssenciaisVazios(visiveis, respostas);
  const temImagens = coletarImagens(visiveis, respostas).length > 0;

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
        temImagens={temImagens}
      />

      {!podeEditar && (
        <p className="border-b border-tinta/10 bg-bege px-4 py-2 text-center text-sm text-cinza sm:px-6">
          {criadoPorNome
            ? `Só ${criadoPorNome}, quem criou este relatório, pode editá-lo. Você está vendo em modo leitura.`
            : "Só quem criou este relatório pode editá-lo. Você está vendo em modo leitura."}
        </p>
      )}

      <p className="border-b border-tinta/10 bg-vermelho/5 px-4 py-2 text-center text-sm text-vermelho sm:px-6">
        É importante compartilhar este conteúdo com o time antes da entrega final.
      </p>

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

          <div className={podeEditar ? undefined : "pointer-events-none opacity-60"}>
            {blocoAtivo && <BlocoAtivo bloco={blocoAtivo} relatorioId={relatorioId} />}
          </div>

          {proximoBloco && (
            <div className="mx-auto mt-8 flex max-w-2xl justify-end">
              <button
                type="button"
                onClick={() => setBlocoAtivoId(proximoBloco.id)}
                className="rotulo bg-vermelho px-4 py-2 text-creme hover:opacity-90"
              >
                Ir para: {proximoBloco.titulo} →
              </button>
            </div>
          )}
        </main>

        <aside className="hidden w-[440px] shrink-0 border-l border-tinta/10 xl:block">
          <PreviaAoVivo cliente={cliente} ano={ano} blocoAtivoId={blocoAtivoId} />
        </aside>
      </div>
    </div>
  );
}
