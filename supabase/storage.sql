-- Coletor de Relatórios LETS — bucket de Storage para imagens (Fase 4)
-- Cole este arquivo inteiro no SQL Editor do Supabase e rode de uma vez.

insert into storage.buckets (id, name, public)
values ('relatorios', 'relatorios', false)
on conflict (id) do nothing;

create policy "autenticados leem arquivos de relatorios"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'relatorios');

create policy "autenticados sobem arquivos de relatorios"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'relatorios');

create policy "autenticados atualizam arquivos de relatorios"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'relatorios')
  with check (bucket_id = 'relatorios');

create policy "autenticados excluem arquivos de relatorios"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'relatorios');

-- Mesma lição da Fase 2: este projeto não vem com grant automático.
grant usage on schema storage to authenticated, service_role;
grant select, insert, update, delete on storage.objects to authenticated;
grant select, insert, update, delete on storage.objects to service_role;
