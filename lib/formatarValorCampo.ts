export function formatarValorCampo(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "(vazio)";

  if (Array.isArray(valor)) {
    if (valor.length === 0) return "(vazio)";
    if (valor.every((item) => typeof item !== "object" || item === null)) {
      return valor.map((item) => String(item)).join(", ");
    }
    return `${valor.length} item${valor.length > 1 ? "s" : ""}`;
  }

  if (typeof valor === "object") {
    if ("caminho" in (valor as Record<string, unknown>)) return "1 imagem";
    return JSON.stringify(valor);
  }

  return String(valor);
}
