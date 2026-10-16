import ExampleTable from "@/components/ExampleTable";
import PageBlock from "@/components/PageBlock";
import blockStyles from "@/components/PageBlock.module.css";
import StatCard from "@/components/StatCard";
import cardStyles from "@/components/StatCard.module.css";

export default function VisaoGeralPage() {
  return (
    <PageBlock title="Visão geral">
      <h2 className={blockStyles.sectionTitle}>
        Indicadores{" "}
        <span className={blockStyles.sectionNote}>
          (valores de exemplo; os totais virão dos dados na etapa 05)
        </span>
      </h2>
      <div className={cardStyles.grid}>
        <StatCard label="Recebidos" value={0} tone="info" />
        <StatCard label="Em tratamento" value={0} tone="warning" />
        <StatCard label="Óbitos" value={0} tone="danger" />
        <StatCard label="Solturas" value={0} tone="success" />
      </div>

      <h2 className={blockStyles.sectionTitle}>Últimos recebimentos</h2>
      <ExampleTable />
    </PageBlock>
  );
}
