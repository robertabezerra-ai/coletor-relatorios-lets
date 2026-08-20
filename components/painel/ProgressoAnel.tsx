const RAIO = 18;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export function ProgressoAnel({ progresso }: { progresso: number }) {
  const offset = CIRCUNFERENCIA * (1 - progresso / 100);

  return (
    <div className="relative h-11 w-11 shrink-0">
      <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={RAIO}
          fill="none"
          stroke="var(--color-tinta)"
          strokeOpacity="0.1"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={RAIO}
          fill="none"
          stroke="var(--color-vermelho)"
          strokeWidth="3"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-tinta">
        {progresso}%
      </span>
    </div>
  );
}
