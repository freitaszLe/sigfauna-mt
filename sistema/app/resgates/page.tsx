import type { Metadata } from "next";
import PageBlock from "@/components/PageBlock";
import blockStyles from "@/components/PageBlock.module.css";

export const metadata: Metadata = { title: "Resgates e pacientes" };

export default function ResgatesPage() {
  return (
    <PageBlock
      title="Resgates e pacientes"
      actions={
        <button
          type="button"
          className={blockStyles.primaryButton}
          disabled
          title="Disponível na etapa 06"
        >
          Novo
        </button>
      }
    >
      <p className={blockStyles.notice}>
        Lista, pesquisa, filtros e novo recebimento serão implementados na etapa 06.
      </p>
    </PageBlock>
  );
}
