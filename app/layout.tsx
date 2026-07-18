import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURUM by BYD - Investment Experience",
  description: "Uma proposta interativa de parceria entre AURUM Cinema e BYD.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}



