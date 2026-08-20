const MARCADOR = "██  1. SEÇÕES DO RELATÓRIO  ██";

// Substitui só o <script> isolado que contém SECOES/DADOS no template
// original — acha os limites pelo comentário-âncora, sem depender de
// espaçamento exato. Todo o resto do arquivo (CSS, logo, equipe, motor de
// renderização) sai byte a byte igual ao original.
export function injetarDados(
  template: string,
  secoes: Record<string, boolean>,
  dados: unknown,
): string {
  const indiceMarcador = template.indexOf(MARCADOR);
  if (indiceMarcador === -1) {
    throw new Error("Não encontrei o marcador de SEÇÕES no template do relatório.");
  }

  const indiceScriptAbre = template.lastIndexOf("<script>", indiceMarcador);
  const indiceScriptFecha = template.indexOf("</script>", indiceMarcador);
  if (indiceScriptAbre === -1 || indiceScriptFecha === -1) {
    throw new Error("Não encontrei os limites do bloco de dados no template do relatório.");
  }

  const inicioConteudo = indiceScriptAbre + "<script>".length;
  const antes = template.slice(0, inicioConteudo);
  const depois = template.slice(indiceScriptFecha);

  // Sem isso, um "</script" digitado por acaso em algum campo de texto
  // fecharia a tag e quebraria o HTML.
  const semFechamentoPrematuro = (json: string) => json.replace(/<\/script/gi, "<\\/script");

  const novoConteudo = `
const SECOES = ${semFechamentoPrematuro(JSON.stringify(secoes))};
const DADOS = ${semFechamentoPrematuro(JSON.stringify(dados, null, 2))};
`;

  return antes + novoConteudo + depois;
}
