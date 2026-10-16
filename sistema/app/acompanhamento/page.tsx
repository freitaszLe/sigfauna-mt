import type { Metadata } from "next";
import PageBlock from "@/components/PageBlock";
import blockStyles from "@/components/PageBlock.module.css";

export const metadata: Metadata = { title: "Acompanhamento" };

export default function AcompanhamentoPage() {
  return (
    <PageBlock title="Acompanhamento">
      <p className={blockStyles.notice}>
        Casos ativos, etapa atual e histórico do animal serão implementados na
        etapa 07.
      </p>
    </PageBlock>
  );
}
