import { campoVisivel, type Bloco, type Campo } from "@/lib/schema";
import { perguntaCustomParaCampo, type PerguntaCustom } from "@/lib/perguntasCustom";
import { slug } from "@/lib/docx/estilo";

export type ImagemColetada = { caminho: string; nome: string };

function extensaoDoCaminho(caminho: string): string {
  const partes = caminho.split(".");
  return partes.length > 1 ? partes[partes.length - 1] : "webp";
}

function coletarDoCampoImagem(campo: Campo, valor: unknown, contador: { valor: number }): ImagemColetada[] {
  if (!valor) return [];
  const itens = campo.multiplo ? (valor as { caminho: string }[]) : [valor as { caminho: string }];

  return itens
    .filter((item) => item?.caminho)
    .map((item) => {
      contador.valor += 1;
      return {
        caminho: item.caminho,
        nome: `${String(contador.valor).padStart(2, "0")}-${slug(campo.rotulo)}.${extensaoDoCaminho(item.caminho)}`,
      };
    });
}

function coletarDeCampos(
  campos: Campo[],
  valorDoCampo: (campoId: string) => unknown,
  contador: { valor: number },
): ImagemColetada[] {
  const imagens: ImagemColetada[] = [];

  for (const campo of campos) {
    const valor = valorDoCampo(campo.id);

    if (campo.tipo === "imagem") {
      imagens.push(...coletarDoCampoImagem(campo, valor, contador));
      continue;
    }

    if ((campo.tipo === "tabela" || campo.tipo === "pessoas") && Array.isArray(valor)) {
      const colunaImagem = (campo.colunas ?? []).find((coluna) => coluna.tipo === "imagem");
      if (colunaImagem) {
        for (const linha of valor as Record<string, unknown>[]) {
          const valorCelula = linha[colunaImagem.id];
          if (valorCelula) {
            imagens.push(
              ...coletarDoCampoImagem(
                { ...campo, rotulo: `${campo.rotulo}-${colunaImagem.rotulo}`, multiplo: false, tipo: "imagem" },
                valorCelula,
                contador,
              ),
            );
          }
        }
      }
      continue;
    }

    if (campo.tipo === "grupoRepetivel" && Array.isArray(valor)) {
      const camposFilhos = campo.campos ?? [];
      for (const item of valor as Record<string, unknown>[]) {
        imagens.push(...coletarDeCampos(camposFilhos, (id) => item[id], contador));
      }
    }

    if (campo.tipo === "grupoFixo" && valor && typeof valor === "object") {
      const camposFilhos = campo.campos ?? [];
      const item = valor as Record<string, unknown>;
      imagens.push(...coletarDeCampos(camposFilhos, (id) => item[id], contador));
    }
  }

  return imagens;
}

export function coletarImagens(
  blocosVisiveis: Bloco[],
  respostas: Record<string, unknown>,
  perguntasCustom: PerguntaCustom[],
): ImagemColetada[] {
  const contador = { valor: 0 };
  const imagens: ImagemColetada[] = [];

  for (const bloco of blocosVisiveis) {
    if (bloco.id === "b13") continue;
    const camposVisiveis = bloco.campos.filter((campo) => campoVisivel(campo, bloco, respostas));
    imagens.push(...coletarDeCampos(camposVisiveis, (campoId) => respostas[campoId], contador));
  }

  const camposCustom = perguntasCustom.map(perguntaCustomParaCampo);
  imagens.push(...coletarDeCampos(camposCustom, (campoId) => respostas[campoId], contador));

  return imagens;
}
