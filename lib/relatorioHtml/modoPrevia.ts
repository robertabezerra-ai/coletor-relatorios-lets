// Ajustes aplicados só quando o relatório é mostrado DENTRO do app (prévia ao
// vivo e exemplos de cada seção) — o HTML baixado continua igual ao template.
//
// - Sem o menu do template: dentro do iframe os links "#secao" resolvem
//   contra a URL da página do app e levavam a prévia para lugares errados.
// - Animações de entrada desligadas: a prévia é recarregada a cada resposta
//   e o conteúdo não pode ficar piscando/invisível esperando o scroll.
const CSS_PREVIA = `
.side{display:none!important}
.shell{display:block!important;min-height:0!important}
html{scroll-padding-top:0!important}
.reveal{opacity:1!important;transform:none!important;transition:none!important}
`;

// Qualquer link interno que sobrar só rola dentro da própria prévia; links
// externos (ex.: matérias da imprensa) abrem em outra aba.
const SCRIPT_PREVIA = `
document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest("a");if(!a)return;
  var h=a.getAttribute("href")||"";
  e.preventDefault();
  if(h.charAt(0)==="#"){var el=document.getElementById(h.slice(1));if(el)el.scrollIntoView();}
  else if(/^https?:/i.test(h)){window.open(h,"_blank","noopener");}
},true);
`;

// "capa" mostra só a abertura do relatório; qualquer outro valor é o id de
// uma <section> do template.
export type RecorteExemplo = { secao: string; cssExtra?: string };

function cssDoRecorte({ secao, cssExtra = "" }: RecorteExemplo): string {
  const esconder =
    secao === "capa"
      ? ".main>section,.foot{display:none!important}"
      : `.hero,.foot,.main>section:not(#${secao}){display:none!important}`;
  return esconder + cssExtra;
}

export function prepararParaPrevia(html: string, recorte?: RecorteExemplo): string {
  const css = CSS_PREVIA + (recorte ? cssDoRecorte(recorte) : "");
  return html
    .replace("</head>", `<style>${css}</style></head>`)
    .replace(/<\/body>(?![\s\S]*<\/body>)/, `<script>${SCRIPT_PREVIA}</script></body>`);
}

// O template é o mesmo para a prévia e para todos os exemplos — busca uma vez
// só por sessão da página.
let templatePromessa: Promise<string> | null = null;

export function carregarTemplate(): Promise<string> {
  if (!templatePromessa) {
    templatePromessa = fetch("/api/relatorio-template").then((resposta) => {
      if (!resposta.ok) throw new Error("Falha ao carregar o template.");
      return resposta.text();
    });
    templatePromessa.catch(() => {
      templatePromessa = null;
    });
  }
  return templatePromessa;
}
