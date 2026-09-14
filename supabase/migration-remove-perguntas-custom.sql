-- Migração: remove a tabela de "perguntas personalizadas" — essa parte do
-- app foi retirada (Bloco 13/15 e o modal de criar pergunta não existem
-- mais). Cole este arquivo no SQL Editor do Supabase e rode de uma vez.

drop table if exists perguntas_custom;
