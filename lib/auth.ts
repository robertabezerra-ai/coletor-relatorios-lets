const ALLOWED_DOMAIN = "letsmarketing.com.br";

export function isEmailDominioPermitido(email: string): boolean {
  const dominio = email.trim().toLowerCase().split("@")[1];
  return dominio === ALLOWED_DOMAIN;
}

export { ALLOWED_DOMAIN };
