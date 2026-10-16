import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fauna Silvestre",
    template: "%s · Fauna Silvestre",
  },
  description:
    "Sistema básico de recebimento, acompanhamento e distribuição regional de resgates de fauna — dados fictícios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
