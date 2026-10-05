export function LogoutButton() {
  return (
    <form method="post" action="/api/auth/sair">
      <button
        type="submit"
        className="rotulo border border-tinta/20 px-4 py-2 text-tinta hover:border-vermelho hover:text-vermelho"
      >
        Sair
      </button>
    </form>
  );
}
