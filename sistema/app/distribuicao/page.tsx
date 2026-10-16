import type { Metadata } from "next";
import PaginaDistribuicao from "@/components/PaginaDistribuicao";

export const metadata: Metadata = { title: "Distribuição dos resgates" };

export default function DistribuicaoPage() {
  return <PaginaDistribuicao />;
}
