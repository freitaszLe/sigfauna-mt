"use client";

import { useState } from "react";
import styles from "./Paginacao.module.css";

export const LINHAS_POR_PAGINA = 5;

/**
 * Divide uma lista em páginas de até 5 linhas. A página atual é limitada ao total,
 * então filtrar para menos itens nunca deixa a tabela numa página vazia.
 */
export function usePaginacao<T>(itens: readonly T[], porPagina = LINHAS_POR_PAGINA) {
  const [paginaPedida, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(itens.length / porPagina));
  const pagina = Math.min(paginaPedida, totalPaginas);
  const inicio = (pagina - 1) * porPagina;
  return {
    pagina,
    totalPaginas,
    setPagina,
    itensDaPagina: itens.slice(inicio, inicio + porPagina),
    primeiro: itens.length === 0 ? 0 : inicio + 1,
    ultimo: Math.min(inicio + porPagina, itens.length),
    total: itens.length,
  };
}

type PaginacaoProps = {
  pagina: number;
  totalPaginas: number;
  primeiro: number;
  ultimo: number;
  total: number;
  onMudar: (pagina: number) => void;
  rotulo?: string;
};

export default function Paginacao({
  pagina,
  totalPaginas,
  primeiro,
  ultimo,
  total,
  onMudar,
  rotulo = "Paginação da tabela",
}: PaginacaoProps) {
  if (total === 0) return null;

  return (
    <nav className={styles.paginacao} aria-label={rotulo}>
      <span className={styles.resumo}>
        Mostrando {primeiro}–{ultimo} de {total}
      </span>
      <div className={styles.controles}>
        <button
          type="button"
          className={styles.botao}
          onClick={() => onMudar(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
        >
          ‹ Anterior
        </button>
        <span className={styles.pagina} aria-current="page">
          Página {pagina} de {totalPaginas}
        </span>
        <button
          type="button"
          className={styles.botao}
          onClick={() => onMudar(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Próxima página"
        >
          Próxima ›
        </button>
      </div>
    </nav>
  );
}
