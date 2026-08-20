import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: relatorioId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login de novo." }, { status: 401 });
  }

  const formData = await request.formData();
  const arquivo = formData.get("arquivo");
  const campoId = formData.get("campo_id");

  if (!(arquivo instanceof File) || typeof campoId !== "string" || !campoId) {
    return NextResponse.json({ error: "Envie um arquivo e o campo_id." }, { status: 400 });
  }

  if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
    return NextResponse.json(
      { error: "Tipo de arquivo não permitido. Use PNG, JPG, WebP ou GIF." },
      { status: 400 },
    );
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ error: "Arquivo maior que 5 MB." }, { status: 400 });
  }

  const bufferOriginal = Buffer.from(await arquivo.arrayBuffer());

  let bufferWebp: Buffer;
  try {
    bufferWebp = await sharp(bufferOriginal).rotate().webp({ quality: 85 }).toBuffer();
  } catch {
    return NextResponse.json({ error: "Não foi possível processar essa imagem." }, { status: 400 });
  }

  const caminho = `${relatorioId}/${campoId}/${randomUUID()}.webp`;

  const { error: erroUpload } = await supabase.storage
    .from("relatorios")
    .upload(caminho, bufferWebp, { contentType: "image/webp" });

  if (erroUpload) {
    return NextResponse.json({ error: erroUpload.message }, { status: 500 });
  }

  const { data: assinada } = await supabase.storage
    .from("relatorios")
    .createSignedUrl(caminho, 60 * 60);

  return NextResponse.json({ caminho, url: assinada?.signedUrl ?? null });
}
