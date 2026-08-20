import { CampoWrapper } from "@/components/formulario/campos/CampoWrapper";
import type { Campo } from "@/lib/schema";

export function CampoPendente({ campo }: { campo: Campo }) {
  return (
    <CampoWrapper campo={campo}>
      <p className="border border-dashed border-tinta/20 px-3 py-2 text-sm text-cinza">
        Tipo de campo &ldquo;{campo.tipo}&rdquo; não reconhecido. Avise quem cuida do app.
      </p>
    </CampoWrapper>
  );
}
