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
import { COR_DO_BIOMA } from "./coresBiomas";
import { CartaoBarras, CartaoRosca, COR_DO_GRUPO } from "./GraficosPainel";
import graficoStyles from "./GraficosPainel.module.css";
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

      <h2 className={blockStyles.sectionTitle}>Distribuição dos resgates</h2>
      <div className={graficoStyles.grade}>
        <CartaoBarras
          titulo="Resgates por bioma"
          subtitulo={`${calculados} de ${resumo.total} calculados pela coordenada · ${
            divergentes === 0 ? "nenhuma divergência" : `${divergentes} divergência(s)`
          }`}
          total={resumo.total}
          dados={contarPorBioma(resgates).map((item) => ({
            rotulo: nomeDoBioma(item.bioma),
            total: item.total,
            cor: COR_DO_BIOMA[item.bioma],
          }))}
        />
        <CartaoRosca
          titulo="Resgates por grupo"
          subtitulo="Aves, mamíferos e répteis"
          total={resumo.total}
          dados={contarPorGrupo(resgates).map((item) => ({
            rotulo: item.grupo,
            total: item.total,
            cor: COR_DO_GRUPO[item.grupo],
          }))}
        />
      </div>
      <p className={blockStyles.sectionNote}>
        O bioma indica o local do resgate. Não comprova a origem natural do animal nem autoriza
        soltura.
      </p>

      <h2 className={blockStyles.sectionTitle}>Últimos recebimentos</h2>
      <RecebimentosTable
        resgates={ultimosRecebimentos(resgates, 5)}
        legenda="Cinco resgates mais recentes pela data do resgate"
      />
    </>
  );
}
