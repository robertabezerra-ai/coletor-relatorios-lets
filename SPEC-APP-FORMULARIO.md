# Coletor de Relatórios LETS · especificação para o Claude Code

Documento de construção do app que substitui o formulário em Word. Leia inteiro antes de
escrever qualquer código. As fases no final são a ordem de implementação sugerida — cada uma
pode ser colada como um pedido separado.

---

## 1. O problema

Hoje o consultor preenche um `.docx` de nove páginas sozinho, de uma vez, e ninguém mais vê
o andamento. Na prática os dados chegam em pedaços ao longo de semanas — o número da imprensa
vem do time de assessoria, o de rankings vem de outra pessoa, o texto de encerramento fica
para o fim.

O app precisa resolver exatamente isso: **guardar o preenchimento parcial, deixar claro o que
falta, registrar quem preencheu o quê, e no fim cuspir o `.docx` pronto** para seguir o fluxo
que já existe (o consultor leva o Word para o Claude, que monta o HTML do relatório).

O app **não** gera o relatório final. Ele só coleta.

---

## 2. Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Estilo | Tailwind CSS |
| Banco, autenticação e arquivos | Supabase (Postgres + Auth magic link + Storage) |
| Geração do Word | `docx` (npm), numa Route Handler com `runtime = "nodejs"` |
| Hospedagem | Vercel |

Não instale bibliotecas de formulário pesadas. `react-hook-form` é aceitável; qualquer coisa
além disso, prefira estado local simples.

---

## 3. Arquivos que acompanham esta spec

| Arquivo | O que é |
|---|---|
| `perguntas.schema.json` | **A espinha do projeto.** Todos os blocos, campos, tipos, formatos e níveis de obrigatoriedade. |
| `FORMULARIO-CONSULTOR.docx` | O formulário atual em Word. Serve de referência visual para o gerador do `.docx`. |
| `RELATORIO-BASE-2026.html` | O template do relatório. Contém o objeto `EQUIPE_LETS` — extraia dele a lista de nomes para o autocomplete. |
| `GUIA-DE-IDENTIDADE.md` | Cores, tipografia e tom de voz da LETS. |

**Regra inegociável:** `perguntas.schema.json` é a única fonte de verdade. A renderização do
formulário, o cálculo de progresso e o gerador de `.docx` derivam todos dele. Se alguém
precisar mudar uma pergunta, muda o JSON e mais nada. Não replique rótulos ou listas de
opções em componentes.

---

## 4. Modelo de dados

Rode este SQL no editor do Supabase.

```sql
-- Squads e chapters ------------------------------------------------------
create table squads (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null unique,
  tipo        text not null default 'squad' check (tipo in ('squad','chapter')),
  cor         text not null default '#D10A11',   -- cor do chip na interface
  arquivado   boolean not null default false,
  criado_em   timestamptz not null default now()
);

insert into squads (nome, cor) values
  ('Azul','#1E63C8'), ('Laranja','#E8720C'), ('Vermelho','#D10A11'),
  ('Rosa','#D64C8E'), ('Black','#1D1D1B');

-- Um relatório = um cliente em um ano ------------------------------------
create table relatorios (
  id            uuid primary key default gen_random_uuid(),
  cliente       text not null,
  ano           int  not null,
  squad_id      uuid not null references squads(id),
  status        text not null default 'rascunho'
                check (status in ('rascunho','em_revisao','concluido','arquivado')),
  criado_por    uuid not null references auth.users(id),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (cliente, ano)
);

-- Estado atual de cada campo ---------------------------------------------
create table respostas (
  relatorio_id  uuid not null references relatorios(id) on delete cascade,
  campo_id      text not null,          -- ex.: "cliente.nome", "resumo.kpis", "custom:<uuid>"
  valor         jsonb,                  -- texto, número, array de linhas, o que for
  atualizado_por uuid references auth.users(id),
  atualizado_em timestamptz not null default now(),
  primary key (relatorio_id, campo_id)
);

-- Histórico append-only ---------------------------------------------------
create table respostas_log (
  id            bigserial primary key,
  relatorio_id  uuid not null references relatorios(id) on delete cascade,
  campo_id      text not null,
  valor_anterior jsonb,
  valor_novo    jsonb,
  autor         uuid references auth.users(id),
  quando        timestamptz not null default now()
);

-- Perguntas personalizadas por cliente ------------------------------------
create table perguntas_custom (
  id           uuid primary key default gen_random_uuid(),
  relatorio_id uuid not null references relatorios(id) on delete cascade,
  rotulo       text not null,
  formato      text,                    -- texto de ajuda mostrado abaixo do rótulo
  tipo         text not null default 'textoLongo',
  ordem        int  not null default 0,
  criado_por   uuid references auth.users(id),
  criado_em    timestamptz not null default now()
);

-- Perfil do consultor ------------------------------------------------------
create table perfis (
  id        uuid primary key references auth.users(id) on delete cascade,
  nome      text,
  squad_id  uuid references squads(id)
);
```

**Gatilho de histórico** — toda escrita em `respostas` grava em `respostas_log` e atualiza
`relatorios.atualizado_em`. Faça isso num trigger no Postgres, não no código da aplicação:
assim nenhum caminho de escrita escapa do log.

**RLS** — ative em todas as tabelas. Política: qualquer usuário autenticado lê e escreve
tudo. A LETS é um time pequeno e colaborativo; travar por squad só criaria atrito quando
alguém precisar cobrir a conta de outro. O que importa é **saber quem fez**, e isso o log
resolve.

**Storage** — bucket privado `relatorios`, caminho `{relatorio_id}/{campo_id}/{arquivo}`.
Sirva por URL assinada; nunca deixe o bucket público.

---

## 5. Telas

### `/login`
Campo de e-mail, botão "Receber link de acesso". Só aceita `@letsmarketing.com.br` — valide
no cliente e de novo no servidor. Fundo escuro, logo da LETS centralizado.

### `/` — Painel
Lista de squads como colunas ou seções, cada uma com seus relatórios. Cada card mostra: nome
do cliente, ano, anel de progresso em porcentagem, status, quem mexeu por último e quando.

- Busca por nome de cliente no topo.
- Filtros: ano, status, squad.
- Botão **Novo relatório**: nome do cliente, ano e squad. O cliente nasce dentro do squad
  escolhido.
- Botão **Gerenciar squads**: criar, renomear, escolher cor, marcar como squad ou chapter,
  arquivar. Não permita excluir squad que tenha relatórios — só arquivar.
- Um relatório pode ser movido de squad depois (menu do card).

### `/relatorio/[id]` — Formulário
O coração do app.

**Coluna esquerda:** menu dos blocos, cada um com um indicador de estado — vazio, parcial ou
completo. Mesma lógica visual do menu lateral do relatório: numeração, marcador vermelho no
bloco ativo.

**Centro:** o bloco ativo, com seus campos renderizados a partir do schema. Cada campo mostra
o rótulo, o texto de `formato` como ajuda logo abaixo, e o input do `tipo` correspondente.

**Topo:** nome do cliente, squad, ano, barra de progresso geral e o texto "salvo há X".

**Salvamento:** automático, com *debounce* de 800 ms por campo. Indicador discreto de estado
— salvando, salvo, erro. Nunca exija clicar em "salvar". Se a requisição falhar, mantenha o
valor na tela, mostre o erro e tente de novo.

**Blocos condicionais:** um bloco com `dependeDeSecao` só aparece se aquela seção estiver
marcada no Bloco 0. Se o consultor desmarcar uma seção, **não apague as respostas** — esconda
o bloco e avise que os dados ficam guardados caso ele volte atrás.

**Bloco 13 — Perguntas personalizadas:** botão "Nova pergunta" que pede rótulo, texto de
ajuda e tipo (texto curto, texto longo, número, tabela livre). A pergunta criada é gravada em
`perguntas_custom` e passa a se comportar como qualquer outro campo, inclusive no `.docx`.

### `/relatorio/[id]/historico`
Linha do tempo do log, do mais recente para o mais antigo: quem, quando, qual campo, valor
anterior e valor novo. Filtro por pessoa e por bloco. Botão para restaurar um valor anterior
— que também vira uma nova entrada no log, nunca uma edição do passado.

---

## 6. Progresso e o que falta

Calcule a partir do `nivel` de cada campo, considerando só os blocos visíveis:

- `essencial` pesa 3, `importante` pesa 1, `opcional` pesa 0.
- Um campo conta como preenchido quando tem valor não vazio. Tabela conta quando atinge o
  `min`. `serie12` conta quando os doze meses estão preenchidos.
- Progresso do bloco e progresso geral usam a mesma fórmula.

No topo do formulário, um painel **"Falta preencher"** listando os campos essenciais ainda
vazios, cada um clicando direto para o campo. É a tela que o consultor vai olhar quando
voltar depois de duas semanas.

A exportação do `.docx` funciona a qualquer momento, mesmo incompleta — os campos vazios
saem marcados como `[PENDENTE]` no documento. Só o botão **Marcar como concluído** exige
100% dos essenciais.

---

## 7. Exportação para Word

Route Handler `GET /api/relatorio/[id]/docx`, `runtime = "nodejs"`.

Monta o documento percorrendo o schema na ordem, incluindo apenas blocos visíveis, e no fim
as perguntas personalizadas. Cada campo vira: rótulo em negrito vermelho numerado, linha de
`formato` em itálico cinza, e a resposta — ou `[PENDENTE]` quando vazia. Tabelas viram
tabelas do Word com cabeçalho preto e texto creme.

Reaproveite os helpers de estilo do `FORMULARIO-CONSULTOR.docx`: fonte Aptos, vermelho
`D10A11`, tinta `1D1D1B`, cinza `6E6A63`, caixas bege `F6F3EC`. Página A4, margens de 1,9 cm.

Capa do documento gerado: logo "LETS" em vermelho, nome do cliente, ano, squad, data da
exportação e o percentual de preenchimento.

Nome do arquivo: `formulario-{cliente-com-hifen}-{ano}.docx`.

---

## 8. Identidade visual do app

Siga o `GUIA-DE-IDENTIDADE.md`. Resumo operacional:

- Três cores: `#D10A11` vermelho, `#1D1D1B` tinta, `#EEE7D6` creme. As cores dos squads são
  a única exceção, e só aparecem em chips e anéis de progresso.
- Fonte Figtree em todo o app.
- Títulos em peso 300 com `letter-spacing` negativo. Rótulos em caixa alta, peso 600,
  `letter-spacing` largo, tamanho pequeno.
- Cantos retos. Sem sombra colorida, sem gradiente decorativo, sem emoji.
- O logo da LETS aparece uma vez por tela, no topo do menu.

---

## 9. Fases de implementação

Cada fase é um pedido independente. Não avance sem a anterior rodando.

**Fase 1 — Fundação.** Projeto Next.js com Tailwind e Figtree. Cliente Supabase. Login por
magic link restrito ao domínio da LETS. Middleware protegendo tudo exceto `/login`. Deploy
na Vercel funcionando.

**Fase 2 — Banco e painel.** SQL acima aplicado, com trigger de log e RLS. Painel listando
squads e relatórios, criação de relatório, gestão de squads e chapters.

**Fase 3 — Motor do formulário.** Carregue `perguntas.schema.json` e renderize o Bloco 1
inteiro. Implemente os tipos `texto`, `textoLongo`, `numero` e `selecao`, com salvamento
automático e indicador de estado. Só siga quando este ciclo estiver sólido — é o que todo
o resto reaproveita.

**Fase 4 — Tipos complexos.** `serie12` com colagem de linha, `tabela` com adicionar e
remover linha, `grupoRepetivel`, `multiSelecao` e `imagem` com upload para o Storage.
Autocomplete de pessoas lendo `EQUIPE_LETS`.

**Fase 5 — Progresso e condicionais.** Cálculo de progresso, indicadores por bloco, painel
"Falta preencher", blocos que aparecem e somem conforme o Bloco 0.

**Fase 6 — Personalizadas e histórico.** Criação de perguntas customizadas e a tela de
histórico com restauração.

**Fase 7 — Word.** Gerador do `.docx` e botão de download.

**Fase 8 — Acabamento.** Responsivo no celular, estados vazios, mensagens de erro, atalho
de teclado para navegar entre blocos, e revisão de acessibilidade — foco visível, rótulos
associados aos inputs, contraste mínimo.

---

## 10. Critérios de aceitação

- [ ] Duas pessoas preenchem o mesmo relatório em horários diferentes e nada se perde.
- [ ] Sair no meio e voltar dias depois mostra exatamente onde parou e o que falta.
- [ ] Criar um squad novo e mover um cliente para ele funciona sem tocar em código.
- [ ] Uma pergunta personalizada criada por um consultor aparece no `.docx` exportado.
- [ ] Desmarcar uma seção esconde o bloco sem apagar as respostas; remarcar traz tudo de volta.
- [ ] O histórico mostra quem alterou cada campo e permite voltar a um valor anterior.
- [ ] O `.docx` exportado abre no Word com a formatação da LETS e marca os pendentes.
- [ ] Nenhum rótulo ou lista de opções aparece hard-coded fora de `perguntas.schema.json`.

---

## 11. Cuidados

**Não use a Server Action para tudo.** Salvamento de campo é chamada frequente; use uma Route
Handler enxuta que recebe `{relatorio_id, campo_id, valor}` e devolve só o timestamp.

**Conflito de edição simultânea.** Duas pessoas no mesmo campo é raro, mas acontece. Compare
o `atualizado_em` que o cliente tem com o do banco antes de gravar; se divergir, mostre um
aviso com os dois valores e deixe a pessoa escolher. Não sobrescreva calado.

**Upload de imagem.** Valide tipo e tamanho no servidor, não só no cliente. Limite de 5 MB
por arquivo.

**Variáveis de ambiente na Vercel:** `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`. A service role só pode ser
usada em código de servidor — se ela vazar para o bundle do cliente, qualquer pessoa lê o
banco inteiro.

**Custo.** Nos volumes da LETS — algumas dezenas de relatórios por ano — Supabase e Vercel
ficam confortavelmente dentro do plano gratuito. O que estoura primeiro é o Storage, se
começarem a subir imagens pesadas; converta para WebP no upload.
