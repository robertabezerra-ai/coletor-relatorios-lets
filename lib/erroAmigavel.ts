type ErroSupabase = { code?: string; message: string };

// Nunca devolve o texto cru do Postgres/Storage para a tela — só o essencial
// para a pessoa entender o que fazer a seguir.
export function mensagemErroAmigavel(
  error: ErroSupabase,
  mensagemDuplicado = "Esse valor já existe. Escolha outro.",
): string {
  if (error.code === "23505") return mensagemDuplicado;
  if (error.code === "23503") {
    return "Não é possível concluir — há algo relacionado que impede essa ação.";
  }
  return "Não foi possível salvar agora. Tente de novo em instantes.";
}
