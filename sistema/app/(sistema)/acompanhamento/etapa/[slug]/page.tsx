import type { Metadata } from "next";
import { Suspense } from "react";
import PageBlock from "@/components/PageBlock";
import PaginaFila from "@/components/PaginaFila";
import blockStyles from "@/components/PageBlock.module.css";
import { FILAS } from "@/lib/filas";

export const metadata: Metadata = { title: "Acompanhamento por etapa" };

export function generateStaticParams() {
  return FILAS.map((fila) => ({ slug: fila.slug }));
}

export default function FilaPage() {
  return (
    <Suspense
      fallback={
        <PageBlock title="Acompanhamento">
          <p className={blockStyles.notice} role="status">
            Carregando…
          </p>
        </PageBlock>
      }
    >
      <PaginaFila />
    </Suspense>
  );
}
