// Logo após o login, o token pode chegar ao Postgres um instante antes dos
// serviços do Supabase estarem sincronizados entre si, e a primeira consulta
// falha com "JWT issued at future" (PGRST303). É passageiro — tentar de novo
// alguns instantes depois resolve sozinho, sem precisar mostrar erro.
export async function comRetentativa<T>(
  fn: () => Promise<T>,
  tentativas = 2,
  esperaMs = 600,
): Promise<T> {
  try {
    return await fn();
  } catch (erro) {
    if (tentativas <= 0) throw erro;
    await new Promise((resolver) => setTimeout(resolver, esperaMs));
    return comRetentativa(fn, tentativas - 1, esperaMs);
  }
}
