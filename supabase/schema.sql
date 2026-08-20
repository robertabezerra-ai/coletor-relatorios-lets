-- Coletor de Relatórios LETS — schema, gatilhos e RLS
-- Cole este arquivo inteiro no SQL Editor do Supabase e rode de uma vez.
--
-- Autenticação: login único compartilhado da LETS (não é magic link por
-- e-mail individual). Todo mundo autentica como a MESMA conta do Supabase
-- Auth por trás da senha compartilhada — por isso "quem fez o quê" é
-- resolvido por um nome de texto escolhido no navegador (ver seção 3), não
-- pelo uuid da conta. Veja o rodapé deste arquivo para os passos de criar
-- essa conta compartilhada.

-- ============================================================================
-- 1. Tabelas (seção 4 da spec)
-- ============================================================================

create table squads (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null unique,
  tipo        text not null default 'squad' check (tipo in ('squad','chapter')),
  cor         text not null default '#D10A11',
  arquivado   boolean not null default false,
  criado_em   timestamptz not null default now()
);

insert into squads (nome, cor) values
  ('Azul','#1E63C8'), ('Laranja','#E8720C'), ('Vermelho','#D10A11'),
  ('Rosa','#D64C8E'), ('Black','#1D1D1B');

create table relatorios (
  id            uuid primary key default gen_random_uuid(),
  cliente       text not null,
  ano           int  not null,
  squad_id      uuid not null references squads(id),
  status        text not null default 'rascunho'
                check (status in ('rascunho','em_revisao','concluido','arquivado')),
  criado_por    uuid not null references auth.users(id),
  criador_nome  text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (cliente, ano)
);

create table respostas (
  relatorio_id  uuid not null references relatorios(id) on delete cascade,
  campo_id      text not null,
  valor         jsonb,
  atualizado_por uuid references auth.users(id),
  atualizado_por_nome text,
  atualizado_em timestamptz not null default now(),
  primary key (relatorio_id, campo_id)
);

create table respostas_log (
  id            bigserial primary key,
  relatorio_id  uuid not null references relatorios(id) on delete cascade,
  campo_id      text not null,
  valor_anterior jsonb,
  valor_novo    jsonb,
  autor         uuid references auth.users(id),
  autor_nome    text,
  quando        timestamptz not null default now()
);

create table perguntas_custom (
  id           uuid primary key default gen_random_uuid(),
  relatorio_id uuid not null references relatorios(id) on delete cascade,
  rotulo       text not null,
  formato      text,
  tipo         text not null default 'textoLongo',
  ordem        int  not null default 0,
  criado_por   uuid references auth.users(id),
  criado_em    timestamptz not null default now()
);

-- Índices para os padrões de consulta do app (nenhum vem de graça com FK no Postgres).
create index idx_relatorios_squad_id on relatorios(squad_id);
create index idx_respostas_relatorio_id on respostas(relatorio_id);
create index idx_respostas_log_relatorio_id on respostas_log(relatorio_id);
create index idx_perguntas_custom_relatorio_id on perguntas_custom(relatorio_id);

-- ============================================================================
-- 2. Gatilho de histórico — toda escrita em `respostas` grava em
--    `respostas_log` e atualiza `relatorios.atualizado_em`. Fica no Postgres,
--    então nenhum caminho de escrita (app, script, edição manual) escapa do log.
-- ============================================================================

create or replace function registrar_resposta()
returns trigger
language plpgsql
as $$
begin
  -- Reescrever o mesmo valor não conta como edição: não loga, não bagunça o
  -- "quem mexeu por último".
  if TG_OP = 'UPDATE' and NEW.valor is not distinct from OLD.valor then
    return NEW;
  end if;

  NEW.atualizado_em := now();

  insert into respostas_log (relatorio_id, campo_id, valor_anterior, valor_novo, autor, autor_nome)
  values (
    NEW.relatorio_id,
    NEW.campo_id,
    case when TG_OP = 'UPDATE' then OLD.valor else null end,
    NEW.valor,
    NEW.atualizado_por,
    NEW.atualizado_por_nome
  );

  update relatorios
  set atualizado_em = now()
  where id = NEW.relatorio_id;

  return NEW;
end;
$$;

create trigger trg_registrar_resposta
before insert or update on respostas
for each row
execute function registrar_resposta();

-- ============================================================================
-- 3. View de apoio ao painel — "quem mexeu por último e quando" em cada
--    relatório, já com o nome de texto (não uuid — com login compartilhado o
--    uuid é o mesmo pra todo mundo). O painel faz um único select nessa view
--    em vez de montar N consultas por card.
-- ============================================================================

-- security_invoker garante que a política RLS avaliada seja a de quem está
-- consultando (authenticated), e não a do dono da view — sem isso, a view
-- rodaria com privilégio de superusuário e vazaria para além da política.
create or replace view relatorios_painel
with (security_invoker = true)
as
select
  r.id,
  r.cliente,
  r.ano,
  r.squad_id,
  r.status,
  r.criado_por,
  r.criador_nome as criado_por_nome,
  r.criado_em,
  r.atualizado_em,
  ultima.atualizado_por as ultima_edicao_por,
  ultima.atualizado_por_nome as ultima_edicao_nome,
  ultima.atualizado_em as ultima_edicao_em
from relatorios r
left join lateral (
  select atualizado_por, atualizado_por_nome, atualizado_em
  from respostas
  where relatorio_id = r.id
  order by atualizado_em desc
  limit 1
) ultima on true;

-- ============================================================================
-- 4. RLS — ativa em todas as tabelas. Time pequeno e colaborativo: qualquer
--    autenticado lê e escreve tudo. O que importa é "quem fez", e isso o
--    histórico acima resolve — travar por squad só criaria atrito.
-- ============================================================================

alter table squads enable row level security;
alter table relatorios enable row level security;
alter table respostas enable row level security;
alter table respostas_log enable row level security;
alter table perguntas_custom enable row level security;

create policy "autenticados leem e escrevem squads"
  on squads for all
  to authenticated
  using (true) with check (true);

create policy "autenticados leem e escrevem relatorios"
  on relatorios for all
  to authenticated
  using (true) with check (true);

create policy "autenticados leem e escrevem respostas"
  on respostas for all
  to authenticated
  using (true) with check (true);

create policy "autenticados leem e escrevem respostas_log"
  on respostas_log for all
  to authenticated
  using (true) with check (true);

create policy "autenticados leem e escrevem perguntas_custom"
  on perguntas_custom for all
  to authenticated
  using (true) with check (true);

-- ============================================================================
-- 5. Permissão de tabela — RLS filtra linhas, mas o Postgres também exige a
--    permissão de tabela em si; sem isso, "permission denied" mesmo com a
--    política certa.
-- ============================================================================

grant usage on schema public to authenticated;
grant usage on all sequences in schema public to authenticated;

grant select, insert, update, delete on squads to authenticated;
grant select, insert, update, delete on relatorios to authenticated;
grant select, insert, update, delete on respostas to authenticated;
grant select, insert, update, delete on respostas_log to authenticated;
grant select, insert, update, delete on perguntas_custom to authenticated;
grant select on relatorios_painel to authenticated;

-- service_role é usado por scripts administrativos e futuras rotinas de
-- servidor; nesse projeto os privilégios padrão não vieram pré-configurados
-- para ele também, então precisa do grant explícito como o de authenticated.
grant usage on schema public to service_role;
grant usage on all sequences in schema public to service_role;

grant select, insert, update, delete on squads to service_role;
grant select, insert, update, delete on relatorios to service_role;
grant select, insert, update, delete on respostas to service_role;
grant select, insert, update, delete on respostas_log to service_role;
grant select, insert, update, delete on perguntas_custom to service_role;
grant select on relatorios_painel to service_role;

-- ============================================================================
-- 6. Conta compartilhada do Supabase Auth que o servidor usa por trás da
--    senha única — crie manualmente antes de configurar as variáveis de
--    ambiente:
--
--    Painel do Supabase → Authentication → Users → Add user
--      Email: use algo que não seja um e-mail real de ninguém, ex.:
--             equipe-lets@letsmarketing.com.br
--      Password: gere uma senha forte e aleatória (não é a senha que a
--             equipe vai digitar — essa fica só nas variáveis de ambiente)
--      Marque "Auto Confirm User"
--
--    Depois, cadastre em .env.local (e nas variáveis de ambiente da Vercel):
--      AUTH_SHARED_EMAIL=equipe-lets@letsmarketing.com.br
--      AUTH_SHARED_PASSWORD=a senha forte gerada acima
--      PAINEL_SENHA=a senha que a equipe da LETS vai digitar pra entrar
-- ============================================================================
