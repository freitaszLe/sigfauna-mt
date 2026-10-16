"use client";

import Link from "next/link";
import { formatarData, ordenarRecentes } from "@/lib/agregacoes";
import { useResgates } from "@/lib/armazenamento";
import ListaResgates from "./ListaResgates";
import PageBlock from "./PageBlock";
import StatCard from "./StatCard";
import blockStyles from "./PageBlock.module.css";
import cardStyles from "./StatCard.module.css";
import formStyles from "./Formulario.module.css";

export default function PaginaResgates() {
  const { resgates } = useResgates();
  const ultimo = ordenarRecentes(resgates)[0];
  const especies = new Set(resgates.map((resgate) => resgate.especie)).size;

  return (
    <PageBlock
      title="Resgates e pacientes"
      actions={
        <Link href="/resgates/novo" className={blockStyles.primaryButton}>
          Novo
        </Link>
      }
    >
      <p className={formStyles.hint}>
        Registro do resgate: qual animal, onde (bioma e coordenada fictícia) e quando. O andamento
        de cada caso fica no <Link href="/acompanhamento">Acompanhamento</Link>.
      </p>

      <div className={cardStyles.grid} role="group" aria-label="Resumo dos resgates">
        <StatCard label="Resgates registrados" value={resgates.length} tone="info" />
        <StatCard
          label="Último resgate"
          value={ultimo ? formatarData(ultimo.dataResgate) : "—"}
          tone="success"
        />
        <StatCard label="Espécies diferentes" value={especies} tone="warning" />
      </div>

      <ListaResgates resgates={resgates} />
    </PageBlock>
  );
}
