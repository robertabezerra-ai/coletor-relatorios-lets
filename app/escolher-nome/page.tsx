import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EscolherNomeForm } from "@/components/identidade/EscolherNomeForm";

export default async function EscolherNomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-10 bg-tinta px-6 py-12">
      <div className="text-center">
        <p className="text-2xl font-light tracking-tight text-creme">
          <span className="font-semibold text-vermelho">LETS</span> · Relatórios
        </p>
        <p className="mt-3 text-creme/60">Quem é você?</p>
      </div>
      <EscolherNomeForm />
    </div>
  );
}
