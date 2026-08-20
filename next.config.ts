import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que o template do relatório HTML (lido via fs em runtime, não
  // importado) vá junto no bundle da função serverless na Vercel.
  outputFileTracingIncludes: {
    "/api/relatorio/[id]/html": ["./lib/relatorioHtml/template.html"],
  },
};

export default nextConfig;
