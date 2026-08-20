-- Coletor de Relatórios LETS — schema, gatilhos e RLS (Fase 2)
-- Cole este arquivo inteiro no SQL Editor do Supabase e rode de uma vez.

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
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (cliente, ano)
);

create table respostas (
  relatorio_id  uuid not null references relatorios(id) on delete cascade,
  campo_id      text not null,
  valor         jsonb,
  atualizado_por uuid references auth.users(id),
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

create table perfis (
  id        uuid primary key references auth.users(id) on delete cascade,
  nome      text,
  squad_id  uuid references squads(id)
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

  insert into respostas_log (relatorio_id, campo_id, valor_anterior, valor_novo, autor)
  values (
    NEW.relatorio_id,
    NEW.campo_id,
    case when TG_OP = 'UPDATE' then OLD.valor else null end,
    NEW.valor,
    NEW.atualizado_por
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
-- 3. Perfil automático — cria a linha em `perfis` assim que alguém faz login
--    pela primeira vez, com um nome derivado do e-mail. Sem isso, "quem mexeu"
--    não tem nome nenhum para mostrar (a tabela `auth.users` não é consultável
--    direto pelo cliente).
-- ============================================================================

create or replace function criar_perfil_para_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into perfis (id, nome)
  values (new.id, initcap(replace(split_part(new.email, '@', 1), '.', ' ')))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_criar_perfil_para_novo_usuario
after insert on auth.users
for each row
execute function criar_perfil_para_novo_usuario();

-- Backfill: cria perfil para quem já tinha logado antes deste script existir.
insert into perfis (id, nome)
select id, initcap(replace(split_part(email, '@', 1), '.', ' '))
from auth.users
on conflict (id) do nothing;

-- ============================================================================
-- 4. View de apoio ao painel — "quem mexeu por último e quando" em cada
--    relatório, já resolvido para nome (não só uuid). O painel faz um único
--    select nessa view em vez de montar N consultas por card.
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
  r.criado_em,
  r.atualizado_em,
  criador.nome as criado_por_nome,
  ultima.atualizado_em as ultima_edicao_em,
  ultima.autor as ultima_edicao_por,
  editor.nome as ultima_edicao_nome
from relatorios r
left join perfis criador on criador.id = r.criado_por
left join lateral (
  select atualizado_por as autor, atualizado_em
  from respostas
  where relatorio_id = r.id
  order by atualizado_em desc
  limit 1
) ultima on true
left join perfis editor on editor.id = ultima.autor;

-- ============================================================================
-- 5. RLS — ativa em todas as tabelas. Time pequeno e colaborativo: qualquer
--    autenticado lê e escreve tudo. O que importa é "quem fez", e isso o
--    histórico acima resolve — travar por squad só criaria atrito.
-- ============================================================================

alter table squads enable row level security;
alter table relatorios enable row level security;
alter table respostas enable row level security;
alter table respostas_log enable row level security;
alter table perguntas_custom enable row level security;
alter table perfis enable row level security;

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

create policy "autenticados leem e escrevem perfis"
  on perfis for all
  to authenticated
  using (true) with check (true);

-- ============================================================================
-- 6. Permissão de tabela — RLS filtra linhas, mas o Postgres também exige a
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
grant select, insert, update, delete on perfis to authenticated;
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
grant select, insert, update, delete on perfis to service_role;
grant select on relatorios_painel to service_role;
