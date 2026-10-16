import type { Metadata } from "next";
import TelaEntrada from "@/components/TelaEntrada";

export const metadata: Metadata = { title: "Acesso" };

export default function EntrarPage() {
  return <TelaEntrada />;
}
