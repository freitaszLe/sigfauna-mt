"use client";

import { useState } from "react";
import { ordenarRecentes } from "@/lib/agregacoes";
import { CATALOGO_BIOMAS } from "@/lib/dados";
import {
  FILTROS_VAZIOS,
  filtrarResgates,
  periodoInvertido,
  temFiltroAtivo,
  type FiltrosResgates,
} from "@/lib/filtros";
import { GRUPOS, METODOS_IDENTIFICACAO_BIOMA, type MetodoIdentificacaoBioma, type Resgate } from "@/lib/types";
import TabelaResgates from "./TabelaResgates";
import styles from "./Formulario.module.css";

const ROTULO_METODO: Record<MetodoIdentificacaoBioma, string> = {
  calculado: "Calculado pela coordenada",
  manual: "Escolhido no cadastro",
  simulado: "Simulado (exemplos)",
};

type ListaResgatesProps = {
  resgates: readonly Resgate[];
};

export default function ListaResgates({ resgates }: ListaResgatesProps) {
  const [filtros, setFiltros] = useState<FiltrosResgates>(FILTROS_VAZIOS);
  const encontrados = ordenarRecentes(filtrarResgates(resgates, filtros));
  const invertido = periodoInvertido(filtros);

  function alterar<K extends keyof FiltrosResgates>(campo: K, valor: FiltrosResgates[K]) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  }

  return (
    <>
      <div className={styles.filters} role="search" aria-label="Busca e filtros de resgates">
        <div className={styles.field}>
          <label htmlFor="filtro-busca" className={styles.label}>
            Buscar
          </label>
          <input
            id="filtro-busca"
            type="search"
            className={styles.input}
            placeholder="Protocolo, identificação ou espécie"
            value={filtros.busca}
            onChange={(evento) => alterar("busca", evento.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="filtro-grupo" className={styles.label}>
            Grupo
          </label>
          <select
            id="filtro-grupo"
            className={styles.input}
            value={filtros.grupo}
            onChange={(evento) => alterar("grupo", evento.target.value as FiltrosResgates["grupo"])}
          >
            <option value="">Todos</option>
            {GRUPOS.map((grupo) => (
              <option key={grupo} value={grupo}>
                {grupo}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="filtro-bioma" className={styles.label}>
            Bioma
          </label>
          <select
            id="filtro-bioma"
            className={styles.input}
            value={filtros.bioma}
            onChange={(evento) => alterar("bioma", evento.target.value as FiltrosResgates["bioma"])}
          >
            <option value="">Todos</option>
            {CATALOGO_BIOMAS.map((bioma) => (
              <option key={bioma.codigo} value={bioma.codigo}>
                {bioma.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="filtro-metodo" className={styles.label}>
            Identificação do bioma
          </label>
          <select
            id="filtro-metodo"
            className={styles.input}
            value={filtros.metodo}
            onChange={(evento) => alterar("metodo", evento.target.value as FiltrosResgates["metodo"])}
          >
            <option value="">Todas</option>
            {METODOS_IDENTIFICACAO_BIOMA.map((metodo) => (
              <option key={metodo} value={metodo}>
                {ROTULO_METODO[metodo]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="filtro-data-inicial" className={styles.label}>
            Resgate de
          </label>
          <input
            id="filtro-data-inicial"
            type="date"
            className={styles.input}
            value={filtros.dataInicial}
            onChange={(evento) => alterar("dataInicial", evento.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="filtro-data-final" className={styles.label}>
            até
          </label>
          <input
            id="filtro-data-final"
            type="date"
            className={styles.input}
            value={filtros.dataFinal}
            onChange={(evento) => alterar("dataFinal", evento.target.value)}
          />
        </div>
      </div>

      <p className={styles.hint}>
        O período usa a data do resgate e inclui as datas inicial e final.
      </p>
      {invertido ? (
        <p className={styles.error} role="alert">
          A data inicial é posterior à data final; nenhum resgate pode atender a esse período.
        </p>
      ) : null}

      <div className={styles.resultBar}>
        <span aria-live="polite">
          <strong>{encontrados.length}</strong> de {resgates.length} resgates
        </span>
        {temFiltroAtivo(filtros) ? (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setFiltros(FILTROS_VAZIOS)}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      <TabelaResgates
        key={JSON.stringify(filtros)}
        resgates={encontrados}
        mensagemVazia={
          resgates.length === 0
            ? "Nenhum resgate registrado."
            : "Nenhum resgate encontrado com esses filtros."
        }
      />
    </>
  );
}
