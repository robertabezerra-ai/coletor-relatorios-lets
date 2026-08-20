import type { Campo } from "@/lib/schema";
import type { ConflitoCampo } from "@/hooks/useAutosaveCampo";
import { formatarValorCampo } from "@/lib/formatarValorCampo";

export function CampoWrapper({
  campo,
  conflito,
  onResolverConflito,
  children,
}: {
  campo: Campo;
  conflito?: ConflitoCampo | null;
  onResolverConflito?: (escolha: "manter_meu" | "usar_do_servidor") => void;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`campo-${campo.id}`}
      tabIndex={-1}
      className="flex flex-col gap-2 border-b border-tinta/10 py-5 outline-none first:pt-0"
    >
      <label htmlFor={campo.id} className="text-tinta">
        {campo.rotulo}
      </label>
      {campo.formato && <p className="text-sm italic text-cinza">{campo.formato}</p>}

      {conflito && onResolverConflito && (
        <div className="flex flex-col gap-2 border border-vermelho/40 bg-vermelho/5 p-3 text-sm">
          <p className="text-vermelho">
            Alguém mais alterou este campo enquanto você editava. Escolha qual valor manter:
          </p>
          <p className="text-tinta/70">
            <span className="text-cinza">No servidor:</span>{" "}
            {formatarValorCampo(conflito.valorServidor)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onResolverConflito("manter_meu")}
              className="rotulo border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho"
            >
              Manter o meu
            </button>
            <button
              type="button"
              onClick={() => onResolverConflito("usar_do_servidor")}
              className="rotulo border border-tinta/20 px-3 py-1.5 text-tinta hover:border-vermelho hover:text-vermelho"
            >
              Usar o do servidor
            </button>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
