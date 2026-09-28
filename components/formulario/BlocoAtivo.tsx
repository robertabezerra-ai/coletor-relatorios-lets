"use client";

import { Campo } from "@/components/formulario/Campo";
import { ExemploSecao } from "@/components/formulario/ExemploSecao";
import { useRespostas } from "@/components/formulario/RespostasContext";
import { campoVisivel, numeroDoBloco, type Bloco } from "@/lib/schema";

export function BlocoAtivo({
  bloco,
  relatorioId,
}: {
  bloco: Bloco;
  relatorioId: string;
}) {
  const { respostas } = useRespostas();
  const camposVisiveis = bloco.campos.filter((campo) => campoVisivel(campo, bloco, respostas));

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <h2 className="text-2xl font-light text-tinta">
        {numeroDoBloco(bloco.id)}. {bloco.titulo}
      </h2>
      {bloco.descricao && <p className="mt-2 text-cinza">{bloco.descricao}</p>}

      {bloco.id === "b0" && (
        <p className="mt-2 text-sm text-cinza">
          Desmarcar uma seção esconde o bloco correspondente do menu — as respostas continuam
          guardadas e voltam se você marcar de novo.
        </p>
      )}

      <ExemploSecao key={bloco.id} blocoId={bloco.id} />

      {bloco.somenteLeitura && bloco.campos.length === 0 && (
        <p className="mt-6 text-sm text-cinza">
          Bloco de texto fixo — nada para preencher aqui.
        </p>
      )}

      {bloco.campos.length === 0 && !bloco.somenteLeitura && (
        <p className="mt-6 text-sm text-cinza">Chega numa próxima fase.</p>
      )}

      <div className="mt-6 flex flex-col">
        {camposVisiveis.map((campo) => (
          <Campo key={campo.id} campo={campo} relatorioId={relatorioId} />
        ))}
      </div>
    </div>
  );
}
