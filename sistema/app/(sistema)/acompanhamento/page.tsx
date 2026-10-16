import type { Metadata } from "next";
import PaginaAcompanhamento from "@/components/PaginaAcompanhamento";

export const metadata: Metadata = { title: "Acompanhamento" };

export default function AcompanhamentoPage() {
  return <PaginaAcompanhamento />;
}
