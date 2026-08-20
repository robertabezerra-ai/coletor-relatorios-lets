export const CORES = {
  vermelho: "D10A11",
  tinta: "1D1D1B",
  cinza: "6E6A63",
  bege: "F6F3EC",
  creme: "EEE7D6",
  preto: "000000",
  branco: "FFFFFF",
};

export const FONTE = "Aptos";
export const MARGEM_MM = 19;

const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

export function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nomeArquivo(cliente: string, ano: number): string {
  return `formulario-${slug(cliente)}-${ano}.docx`;
}

export function nomeArquivoImagens(cliente: string, ano: number): string {
  return `imagens-${slug(cliente)}-${ano}.zip`;
}
