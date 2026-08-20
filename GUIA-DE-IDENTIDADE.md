# Identidade do relatório anual LETS

Documento de referência para quem for **estender** o relatório — criar uma seção nova,
adaptar um componente, ajustar um texto. Anexe este arquivo junto com a base sempre que
pedir ao Claude algo além de preencher dados.

Regra que resume tudo: **o relatório é uma extensão do site da LETS, não um documento
de agência.** Mesma paleta, mesma tipografia, mesma sobriedade. Se um elemento novo não
poderia aparecer em letsmarketing.com.br, ele não entra aqui.

---

## 1. Cores

São três. Não existe uma quarta.

| Token CSS | Hex | Uso |
|---|---|---|
| `--red` | `#D10A11` | Ênfase, números de destaque, palavras em itálico nos títulos, numeração das seções, barras de dado do cliente. Vermelho é acento — nunca fundo de área grande, salvo o logo. |
| `--ink` | `#1D1D1B` | Texto corrido e fundo das seções escuras. |
| `--cream` | `#EEE7D6` | Fundo das seções de respiro e texto sobre fundo escuro. |

Opacidades já definidas em `:root` — use estas, não invente rgba nova:
`--ink-70` (texto secundário), `--ink-45` (rótulos), `--ink-12` (linhas e bordas),
`--cream-70`, `--cream-20`.

Verde (`#0f7a4a` claro, `#5fd39b` escuro) aparece **só** em variação positiva de
indicador. Não é cor de marca e não deve ser usado para mais nada.

---

## 2. Tipografia

Fonte única: **Figtree**, carregada do Google Fonts.

| Elemento | Peso | Detalhe |
|---|---|---|
| Títulos `h1`–`h4` | 300 | `letter-spacing` negativo. Título grande é leve, nunca bold. |
| Palavra de ênfase no título | 300 itálico | Dentro de `<em>`, sai vermelha automaticamente |
| Texto corrido | 300 | |
| Rótulos, tags, eyebrows | 600–700 | Caixa alta, `letter-spacing` largo, tamanho pequeno |
| Números grandes | 300 | `letter-spacing` bem negativo; sufixo (k, %, M) em itálico vermelho a metade do tamanho |

O contraste da marca é **título enorme e leve × rótulo minúsculo e pesado**. É isso que dá
o ar editorial. Título em bold quebra a identidade.

---

## 3. Esqueleto da página

O relatório é um `.shell` de duas colunas: `.side` (menu lateral fixo, sempre visível, com
numeração das seções e barra de progresso) e `.main` (capa, seções e rodapé). Abaixo de
1080 px o menu vira barra superior sozinho.

**O logo da LETS aparece uma única vez**, no topo do menu lateral. Não repita o logo na capa,
nas seções nem no rodapé — o rodapé usa texto.

---

## 4. Anatomia de uma seção

Toda seção segue exatamente esta estrutura:

```html
<section class="sec sec--cream" id="minha-secao">
  <div class="wrap">
    <div class="sec-head reveal">
      <div class="eyebrow"><i>04</i> Rótulo curto da seção</div>
      <h2>Título com <em>palavra em vermelho</em></h2>
      <p class="lead">Uma frase de contexto. Opcional.</p>
    </div>
    <!-- conteúdo, montado com os componentes da seção 4 -->
  </div>
</section>
```

No código, use o helper: `head(n, "Rótulo", 'Título com <em>ênfase</em>', "Frase de contexto")`.
A numeração vem sozinha e se reajusta quando uma seção é desligada.

**Fundos alternam.** A ordem natural é claro → creme → escuro → claro. O motor já corrige
repetições quando uma seção é desligada; você só declara o `bg` pretendido (`"white"`,
`"cream"` ou `"ink"`).

**Títulos.** Sempre com uma palavra ou expressão em `<em>`, e só uma. Curtos, de preferência
sem substantivo abstrato: *"Onde a marca foi vista"* funciona; *"Análise de performance dos
canais digitais"* não.

---

## 5. Componentes disponíveis

Reaproveite. Criar componente novo é a última alternativa, não a primeira.

| Classe | Para que serve |
|---|---|
| `.kpi-grid` > `.kpi` | Faixa de números grandes com variação e nota. Variante `.tight` para blocos mais estreitos |
| `.grid` + `.g2` `.g3` `.g4` | Grades responsivas de 2, 3 ou 4 colunas |
| `.card` + `.card-h` | Cartão com cabeçalho (título à esquerda, tag vermelha à direita) |
| `.metric-row` | Linha de métrica: rótulo à esquerda, valor e variação à direita |
| `.chart-box` > `canvas` | Contêiner de gráfico Chart.js com altura fixa |
| `.pilar-grid` > `.pilar` | Pilares numerados com filete vermelho no topo |
| `.deliv-grid` > `.deliv` | Entregas: número grande + descrição, em duas colunas |
| `.team-grid` > `.person` | Card de pessoa: foto retrato 3:4 em preto e branco, colorindo no hover. Sempre em linha cheia, 4 colunas no desktop |
| `.subhead` | Divisor interno de seção, com filete acima |
| `.tl` > `.tl-item` | Linha do tempo com marcador vermelho, texto e imagem |
| `.clip` | Item de clipping: veículo, título, data |
| `.rk` | Card de ranking com filete vermelho no topo |
| `.bmc` + `.dumb` | Cartão de comparativo: multiplicador em número grande e trilho com dois pontos, cliente em vermelho e setor em contorno |
| `.q` > `.q-item` | Coluna de trimestre do planejamento |
| `.reveal` | Anima a entrada ao rolar. Adicione em todo bloco de conteúdo |

Gráficos: só linha, para evolução, e barra, para contagem. Sempre vermelhos, sem legenda, sem
borda, sem canto arredondado. Nada de pizza, rosca ou radar. Comparação entre dois valores usa
o cartão `.bmc` com o trilho `.dumb` — nunca barras empilhadas.

---

## 6. Como o time da LETS é montado

O arquivo carrega um diretório `EQUIPE_LETS` com nome, cargo institucional e foto de todo
mundo, compilado do site oficial. Em `DADOS.valor.time` o consultor escreve **apenas nomes**:

```js
time: [
  { nome:"Roberta Bezerra", papelNaConta:"Consultora responsável" },
  "Willian Fernandes",
  "Camila Vichoski"
]
```

Foto e cargo saem do diretório. `papelNaConta` sobrescreve o cargo e move o institucional
para uma linha menor abaixo. Pessoa fora do diretório recebe avatar com as iniciais.

Quando alguém novo entrar na LETS, adicione uma linha em `EQUIPE_LETS` no formato
`"Nome Completo":["Cargo","2026/04/ARQUIVO.png"]` — o caminho é relativo a
`wp-content/uploads/` no site.

---

## 7. Tom de voz

- Frase curta. Ordem direta. Sem adjetivo de agência.
- **Todo elogio ancorado num número.** "Crescimento expressivo" não existe; "o tráfego
  cresceu 84%" existe.
- Voz da consultoria, não do cliente: *"o escritório"*, nunca *"nós"* ou *"vocês"*.
- Português do Brasil, vírgula decimal, ponto de milhar.
- Nada de emoji, exclamação ou jargão em inglês que tenha equivalente em português.
- Leitura de canal: uma a duas frases, sempre interpretando o número — o que ele significa,
  não o que ele é.

---

## 8. Antes de dar por pronto

- [ ] Nenhuma cor fora das três da marca (verde só em variação positiva).
- [ ] Nenhuma fonte além de Figtree.
- [ ] Título com exatamente uma palavra em `<em>`.
- [ ] Componente reaproveitado; CSS novo só se realmente não havia alternativa.
- [ ] Blocos de conteúdo com `.reveal`.
- [ ] Chave registrada em `SECOES` e objeto adicionado ao `REGISTRO`.
- [ ] O logo da LETS continua aparecendo uma única vez.
- [ ] Testado com a seção desligada (`false`) — a numeração e o menu continuam corretos.
- [ ] Testado no celular e na impressão em PDF.
