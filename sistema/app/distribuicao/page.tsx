import type { Metadata } from "next";
import PageBlock from "@/components/PageBlock";
import blockStyles from "@/components/PageBlock.module.css";

export const metadata: Metadata = { title: "Distribuição dos resgates" };

export default function DistribuicaoPage() {
  return (
    <PageBlock title="Distribuição dos resgates">
      <p className={blockStyles.notice}>
        O mapa por regiões de Mato Grosso, os filtros e o resumo regional serão
        implementados nas etapas 08 e 09.
      </p>
    </PageBlock>
  );
}
