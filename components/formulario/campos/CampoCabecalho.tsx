import type { Campo } from "@/lib/schema";

export function CampoCabecalho({ campo }: { campo: Campo }) {
  return (
    <div id={`campo-${campo.id}`} className="border-t-2 border-tinta/80 pb-2 pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-lg text-tinta">{campo.rotulo}</h3>
      {campo.formato && <p className="mt-1 text-sm text-cinza">{campo.formato}</p>}
    </div>
  );
}
