import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SIGFAUNA MT",
    template: "%s · SIGFAUNA MT",
  },
  description:
    "SIGFAUNA MT — gestão de fauna silvestre: recebimento, acompanhamento e distribuição de resgates por bioma de MT.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
