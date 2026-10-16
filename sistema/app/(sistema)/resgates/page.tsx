import type { Metadata } from "next";
import PaginaResgates from "@/components/PaginaResgates";

export const metadata: Metadata = { title: "Resgates e pacientes" };

export default function ResgatesPage() {
  return <PaginaResgates />;
}
