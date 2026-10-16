import type { Metadata } from "next";
import { Suspense } from "react";
import FichaResgate from "@/components/FichaResgate";
import PageBlock from "@/components/PageBlock";
import blockStyles from "@/components/PageBlock.module.css";

export const metadata: Metadata = { title: "Ficha do resgate" };

export default function FichaResgatePage() {
  return (
    <Suspense
      fallback={
        <PageBlock title="Ficha do resgate">
          <p className={blockStyles.notice} role="status">
            Carregando…
          </p>
        </PageBlock>
      }
    >
      <FichaResgate />
    </Suspense>
  );
}
