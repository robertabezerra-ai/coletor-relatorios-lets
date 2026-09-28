// A prévia e os exemplos não buscam as imagens enviadas (mostram só o espaço
// reservado) — sem este aviso o consultor acha que o upload falhou.
export function AvisoImagemPrevia() {
  return (
    <p
      role="note"
      className="mb-3 border-l-2 border-vermelho bg-vermelho/5 px-3 py-2 text-sm text-tinta"
    >
      <strong className="font-semibold">Atenção:</strong> a imagem enviada aqui{" "}
      <strong className="font-semibold">não aparece na prévia</strong> — lá fica só um espaço
      reservado. Ela entra normalmente no relatório quando você clica em “Baixar relatório”.
    </p>
  );
}
