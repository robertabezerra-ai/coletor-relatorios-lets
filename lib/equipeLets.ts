// Extraído de RELATORIO-BASE-2026.html (objeto EQUIPE_LETS). Atualize aqui
// quando alguém novo entrar na LETS — não leia o HTML em tempo de execução.

export type MembroEquipe = {
  nome: string;
  cargo: string;
  foto: string;
};

export const FOTO_BASE = "https://www.letsmarketing.com.br/wp-content/uploads/";

export const EQUIPE_LETS: MembroEquipe[] = [
  { nome: "Amanda Paccola", cargo: "Administradora", foto: "2026/04/AP-1.png" },
  { nome: "Fabio Bernardes", cargo: "Administrador", foto: "2026/04/FB-1-1.png" },
  { nome: "Rafael Gagliardi", cargo: "Administrador", foto: "2026/04/RG-1.png" },
  { nome: "Willian Fernandes", cargo: "Administrador", foto: "2026/04/WF-1-1.png" },
  { nome: "Karina Ifanger", cargo: "Sócia", foto: "2026/04/KI-1-1.png" },
  { nome: "Luana Pablos", cargo: "Sócia", foto: "2026/04/LP-1.png" },
  { nome: "Marina Toledo", cargo: "Sócia", foto: "2026/04/MT-1.png" },
  { nome: "Thais Rago", cargo: "Sócia", foto: "2026/04/TR-1.png" },
  { nome: "Thamires Telles", cargo: "Sócia", foto: "2026/04/TT-1-1.png" },
  { nome: "Camila Vichoski", cargo: "Líder", foto: "2026/04/CV-1.png" },
  { nome: "Gabriel Duarte", cargo: "Líder", foto: "2026/04/GD-1.png" },
  { nome: "Isabelle Brandão", cargo: "Líder", foto: "2026/04/IB-1.png" },
  { nome: "Nikolas Gói", cargo: "Líder", foto: "2026/04/NG-1.png" },
  { nome: "Roberta Bezerra", cargo: "Líder", foto: "2026/04/RB-1.png" },
  { nome: "Yasmin Brandão", cargo: "Líder", foto: "2026/04/YB-1.png" },
  { nome: "Alice Gonsalez", cargo: "Associada", foto: "2026/04/AG-1.png" },
  { nome: "Brenda Nascimento", cargo: "Associada", foto: "2026/04/BN-1.png" },
  { nome: "Daniel Chinelato", cargo: "Associado", foto: "2026/04/DC-1.png" },
  { nome: "Elane Ribeiro", cargo: "Associada", foto: "2026/07/Elane.png" },
  { nome: "Felipe Albuquerque", cargo: "Associado", foto: "2026/04/FA-1.png" },
  { nome: "Gabriel Faleiros", cargo: "Associado", foto: "2026/04/GF-1.png" },
  { nome: "Gabriela Grando", cargo: "Associada", foto: "" },
  { nome: "Gabriela Melle", cargo: "Associada", foto: "2026/04/GM-1.png" },
  { nome: "Giovanna Rocha", cargo: "Associada", foto: "2026/05/GR.png" },
  { nome: "Jaqueline Amaral", cargo: "Associada", foto: "2026/05/JA.png" },
  { nome: "Jennifer Alvino", cargo: "Associada", foto: "2026/05/JF.png" },
  { nome: "Jéssica Mendes", cargo: "Associada", foto: "2026/05/JM.png" },
  { nome: "Juliano Trevisan", cargo: "Associado", foto: "2026/05/JT.png" },
  { nome: "Julio Berriel", cargo: "Associado", foto: "2026/05/JB.png" },
  { nome: "Kely Santos Oliveira", cargo: "Designer", foto: "2026/07/Kely.png" },
  { nome: "Luiza Fazolo", cargo: "Associada", foto: "2026/05/LF.png" },
  { nome: "Maira Huffenbaecher", cargo: "Associada", foto: "2026/05/MH.png" },
  { nome: "Raquel Machado", cargo: "Associada", foto: "2026/05/RM.png" },
  { nome: "Stefany Oliveira", cargo: "Associada", foto: "2026/05/SO.png" },
  { nome: "Thiemy Ferreira", cargo: "Associada", foto: "2026/05/TF.png" },
  { nome: "Adilene Anjos", cargo: "Estagiária", foto: "2026/05/AA.png" },
  { nome: "Alan Luis de Figueiredo", cargo: "Colaborador", foto: "2026/07/Alan.png" },
  { nome: "Ana Beatriz Viana", cargo: "Colaboradora", foto: "2026/05/AB.png" },
  { nome: "Ana Luiza Bernardi", cargo: "Colaboradora", foto: "2026/05/AL.png" },
  { nome: "Ariane Souza da Silva", cargo: "Estagiária", foto: "2026/07/Ariane.png" },
  { nome: "Brenda Lachi", cargo: "Colaboradora", foto: "2026/05/BL.png" },
  { nome: "Carolina Garcia", cargo: "Colaboradora", foto: "2026/05/CG.png" },
  { nome: "Duisa Lorrana Ferreira", cargo: "Colaboradora", foto: "2026/05/DL.png" },
  { nome: "Érica Rodrigues", cargo: "Colaboradora", foto: "2026/05/erica.png" },
  { nome: "Gabriela Mendoça", cargo: "Estagiária", foto: "2026/05/GM.png" },
  { nome: "Laylla Cabral", cargo: "Colaboradora", foto: "2026/05/LC.png" },
  { nome: "Letícia Oliveira", cargo: "Estagiária", foto: "2026/07/Leticia.png" },
  { nome: "Lucas Luz", cargo: "Colaborador", foto: "2026/05/LL.png" },
  { nome: "Phamela Leticia da Silva", cargo: "Colaboradora", foto: "2026/07/Phamela.png" },
  { nome: "Vanessa Santos", cargo: "Colaboradora", foto: "2026/05/VS.png" },
  { nome: "Yanca Silva Suassui de Lima", cargo: "Colaboradora", foto: "2026/07/Yanca.png" },
];

export function buscarMembroEquipe(nome: string): MembroEquipe | undefined {
  return EQUIPE_LETS.find((membro) => membro.nome.toLowerCase() === nome.trim().toLowerCase());
}
