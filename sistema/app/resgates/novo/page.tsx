import type { Metadata } from "next";
import PaginaNovoRecebimento from "@/components/PaginaNovoRecebimento";

export const metadata: Metadata = { title: "Novo recebimento" };

export default function NovoRecebimentoPage() {
  return <PaginaNovoRecebimento />;
}
