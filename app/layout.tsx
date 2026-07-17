import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURUM Cinema by BYD — Visão de Parceria",
  description: "Uma proposta interativa de parceria entre AURUM Cinema e BYD.",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
