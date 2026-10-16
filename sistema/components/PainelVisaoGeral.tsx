"use client";

import {
  contarPorBioma,
  contarPorGrupo,
  resumirPainel,
  ultimosRecebimentos,
} from "@/lib/agregacoes";
import { useResgates } from "@/lib/armazenamento";
import { nomeDoBioma } from "@/lib/dados";
import { biomaEfetivo } from "@/lib/geo";
import GraficoBarras from "./GraficoBarras";
import blockStyles from "./PageBlock.module.css";
import RecebimentosTable from "./RecebimentosTable";
import StatCard from "./StatCard";
import cardStyles from "./StatCard.module.css";

export default function PainelVisaoGeral() {
  const { resgates, origem } = useResgates();
  const resumo = resumirPainel(resgates);
  const calculados = resgates.filter(
    (resgate) => biomaEfetivo(resgate).metodo === "calculado",
  ).length;
  const divergentes = resgates.filter((resgate) => biomaEfetivo(resgate).diverge).length;

  return (
    <>
      {origem === "inicial" ? (
        <p className={blockStyles.notice} role="status">
          Carregando…
        </p>
      ) : null}

      <h2 className={blockStyles.sectionTitle}>Indicadores</h2>
      <div className={cardStyles.grid}>
        <StatCard label="Total de resgates" value={resumo.total} tone="info" />
        <StatCard label="Casos ativos" value={resumo.ativos} tone="warning" />
        <StatCard label="Em tratamento ou reabilitação" value={resumo.emCuidado} tone="danger" />
        <StatCard label="Concluídos" value={resumo.concluidos} tone="success" />
      </div>

      <h2 className={blockStyles.sectionTitle}>
        Resgates por bioma do local do resgate{" "}
        <span className={blockStyles.sectionNote}>
          ({calculados} de {resumo.total} calculados pela coordenada
          {calculados < resumo.total ? "; os demais pelo bioma informado" : ""};{" "}
          {divergentes === 0
            ? "nenhuma divergência com o registrado"
            : `${divergentes} divergência(s) com o registrado`}
          )
        </span>
      </h2>
      <GraficoBarras
        titulo="Resgates por bioma"
        dados={contarPorBioma(resgates).map((item) => ({
          rotulo: nomeDoBioma(item.bioma),
          total: item.total,
        }))}
      />
      <p className={blockStyles.sectionNote}>
        O bioma indica o local do resgate. Não comprova a origem natural do animal nem autoriza
        soltura.
      </p>

      <h2 className={blockStyles.sectionTitle}>Resgates por grupo</h2>
      <GraficoBarras
        titulo="Resgates por grupo"
        dados={contarPorGrupo(resgates).map((item) => ({
          rotulo: item.grupo,
          total: item.total,
        }))}
      />

      <h2 className={blockStyles.sectionTitle}>Últimos recebimentos</h2>
      <RecebimentosTable
        resgates={ultimosRecebimentos(resgates, 5)}
        legenda="Cinco resgates mais recentes pela data do resgate"
      />
    </>
  );
}
