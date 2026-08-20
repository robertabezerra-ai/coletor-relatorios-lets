-- Migração: login único compartilhado da LETS no lugar do magic link por e-mail.
-- Cole este arquivo inteiro no SQL Editor do Supabase e rode de uma vez.
--
-- Com login compartilhado, todo mundo autentica como a MESMA conta do
-- Supabase Auth — então uuid (criado_por / atualizado_por) deixa de
-- distinguir pessoas. Esta migração acrescenta colunas de texto com o nome
-- escolhido por quem está usando o navegador naquele momento, e troca a view
-- do painel e o histórico para usar esse nome em vez do antigo join com
-- `perfis` (que só fazia sentido quando cada pessoa tinha sua própria conta).

-- ============================================================================
-- 1. Novas colunas de identidade
-- ============================================================================

alter table relatorios add column if not exists criador_nome text;
alter table respostas add column if not exists atualizado_por_nome text;
alter table respostas_log add column if not exists autor_nome text;

-- ============================================================================
-- 2. Gatilho de histórico — agora também copia o nome pra respostas_log
-- ============================================================================

create or replace function registrar_resposta()
returns trigger
language plpgsql
as $$
begin
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

  return NEW;
end;
$$;

-- ============================================================================
-- 3. View do painel — usa os nomes de texto direto, sem join com perfis
-- ============================================================================

-- CREATE OR REPLACE não deixa reordenar colunas de uma view existente — como
-- a posição de criado_por_nome muda em relação à view antiga, tem que
-- derrubar e recriar.
drop view if exists relatorios_painel;

create view relatorios_painel
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

grant select on relatorios_painel to authenticated;
grant select on relatorios_painel to service_role;

-- ============================================================================
-- 4. Perfis e o trigger que os criava ficam obsoletos — cada login novo não
--    é mais uma conta nova, então "perfil automático por conta" não faz
--    sentido. A tabela sai; nada mais no app depende dela.
-- ============================================================================

drop trigger if exists trg_criar_perfil_para_novo_usuario on auth.users;
drop function if exists criar_perfil_para_novo_usuario();
drop table if exists perfis;

-- ============================================================================
-- 5. Conta compartilhada do Supabase Auth que o servidor usa por trás da
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
