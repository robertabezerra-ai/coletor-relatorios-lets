export function formatarRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "agora há pouco";
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffHoras = Math.round(diffMin / 60);
  if (diffHoras < 24) return `há ${diffHoras}h`;

  const diffDias = Math.round(diffHoras / 24);
  if (diffDias === 1) return "há 1 dia";
  if (diffDias < 30) return `há ${diffDias} dias`;

  return new Date(iso).toLocaleDateString("pt-BR");
}
