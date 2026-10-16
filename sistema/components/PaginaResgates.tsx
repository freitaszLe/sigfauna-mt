"use client";

import Link from "next/link";
import { useResgates } from "@/lib/armazenamento";
import ListaResgates from "./ListaResgates";
import PageBlock from "./PageBlock";
import blockStyles from "./PageBlock.module.css";

export default function PaginaResgates() {
  const { resgates } = useResgates();

  return (
    <PageBlock
      title="Resgates e pacientes"
      actions={
        <Link href="/resgates/novo" className={blockStyles.primaryButton}>
          Novo
        </Link>
      }
    >
      <ListaResgates resgates={resgates} />
    </PageBlock>
  );
}
