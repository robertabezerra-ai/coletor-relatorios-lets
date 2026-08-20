import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coletor de Relatórios · LETS",
  description: "Coleta e acompanhamento dos relatórios anuais da LETS.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-white text-tinta">
        {children}
      </body>
    </html>
  );
}
