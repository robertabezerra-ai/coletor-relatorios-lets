import type { Campo as CampoType } from "@/lib/schema";
import { CampoTexto } from "@/components/formulario/campos/CampoTexto";
import { CampoTextoLongo } from "@/components/formulario/campos/CampoTextoLongo";
import { CampoNumero } from "@/components/formulario/campos/CampoNumero";
import { CampoSelecao } from "@/components/formulario/campos/CampoSelecao";
import { CampoSelecaoEquipe } from "@/components/formulario/campos/CampoSelecaoEquipe";
import { CampoMultiSelecao } from "@/components/formulario/campos/CampoMultiSelecao";
import { CampoSerie12 } from "@/components/formulario/campos/CampoSerie12";
import { CampoTabela } from "@/components/formulario/campos/CampoTabela";
import { CampoGrupoRepetivel } from "@/components/formulario/campos/CampoGrupoRepetivel";
import { CampoImagem } from "@/components/formulario/campos/CampoImagem";
import { CampoPendente } from "@/components/formulario/campos/CampoPendente";

export function Campo({
  campo,
  relatorioId,
}: {
  campo: CampoType;
  relatorioId: string;
}) {
  switch (campo.tipo) {
    case "texto":
      return <CampoTexto campo={campo} relatorioId={relatorioId} />;
    case "textoLongo":
      return <CampoTextoLongo campo={campo} relatorioId={relatorioId} />;
    case "numero":
      return <CampoNumero campo={campo} relatorioId={relatorioId} />;
    case "selecao":
      return <CampoSelecao campo={campo} relatorioId={relatorioId} />;
    case "selecaoEquipe":
      return <CampoSelecaoEquipe campo={campo} relatorioId={relatorioId} />;
    case "multiSelecao":
      return <CampoMultiSelecao campo={campo} relatorioId={relatorioId} />;
    case "serie12":
      return <CampoSerie12 campo={campo} relatorioId={relatorioId} />;
    case "tabela":
    case "pessoas":
      return <CampoTabela campo={campo} relatorioId={relatorioId} />;
    case "grupoRepetivel":
      return <CampoGrupoRepetivel campo={campo} relatorioId={relatorioId} />;
    case "imagem":
      return <CampoImagem campo={campo} relatorioId={relatorioId} />;
    default:
      return <CampoPendente campo={campo} />;
  }
}
