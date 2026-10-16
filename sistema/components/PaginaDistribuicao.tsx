"use client";

import { useMemo, useState } from "react";
import { contarPorBioma, ordenarRecentes, rankingDeEspecies } from "@/lib/agregacoes";
import { useResgates } from "@/lib/armazenamento";
import { CATALOGO_BIOMAS, nomeDoBioma } from "@/lib/dados";
import {
  FILTROS_VAZIOS,
  filtrarResgates,
  periodoInvertido,
  temFiltroAtivo,
  type FiltrosResgates,
} from "@/lib/filtros";
import { biomaEfetivo } from "@/lib/geo";
import { GRUPOS, type BiomaCodigo } from "@/lib/types";
import { COR_DO_BIOMA } from "./coresBiomas";
import MapaBiomas from "./MapaBiomas";
import PageBlock from "./PageBlock";
import blockStyles from "./PageBlock.module.css";
import RecebimentosTable from "./RecebimentosTable";
import styles from "./Distribuicao.module.css";
import formStyles from "./Formulario.module.css";

export default function PaginaDistribuicao() {
  const { resgates, origem } = useResgates();
  const [filtros, setFiltros] = useState<FiltrosResgates>(FILTROS_VAZIOS);
  const [selecionado, setSelecionado] = useState<BiomaCodigo | null>(null);

  const filtrados = useMemo(() => filtrarResgates(resgates, filtros), [resgates, filtros]);
  const contagens = useMemo(
    () =>
      Object.fromEntries(contarPorBioma(filtrados).map((item) => [item.bioma, item.total])) as Record<
        BiomaCodigo,
        number
      >,
    [filtrados],
  );
  const especies = useMemo(
    () => [...new Set(resgates.map((resgate) => resgate.especie))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [resgates],
  );
  const doSelecionado = selecionado
    ? filtrados.filter((resgate) => biomaEfetivo(resgate).codigo === selecionado)
    : [];
  const divergentes = filtrados.filter((resgate) => {
    const bioma = biomaEfetivo(resgate);
    return bioma.diverge || bioma.foraDaMalha;
  });
  const semCoordenada = filtrados.filter((resgate) => !resgate.coordenadaFicticia).length;

  function alterar<K extends keyof FiltrosResgates>(campo: K, valor: FiltrosResgates[K]) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  }

  return (
    <PageBlock title="Distribuição dos resgates">
      <p className={styles.aviso}>
        O bioma indica o local do resgate. Não comprova a origem natural do animal nem autoriza
        soltura. Coordenadas e registros são fictícios.
      </p>

      <div className={formStyles.filters} role="search" aria-label="Filtros do mapa">
        <div className={formStyles.field}>
          <label htmlFor="mapa-bioma" className={formStyles.label}>
            Bioma
          </label>
          <select
            id="mapa-bioma"
            className={formStyles.input}
            value={filtros.bioma}
            onChange={(e) => alterar("bioma", e.target.value as FiltrosResgates["bioma"])}
          >
            <option value="">Todos</option>
            {CATALOGO_BIOMAS.map((bioma) => (
              <option key={bioma.codigo} value={bioma.codigo}>
                {bioma.nome}
              </option>
            ))}
          </select>
        </div>
        <div className={formStyles.field}>
          <label htmlFor="mapa-grupo" className={formStyles.label}>
            Grupo
          </label>
          <select
            id="mapa-grupo"
            className={formStyles.input}
            value={filtros.grupo}
            onChange={(e) => alterar("grupo", e.target.value as FiltrosResgates["grupo"])}
          >
            <option value="">Todos</option>
            {GRUPOS.map((grupo) => (
              <option key={grupo} value={grupo}>
                {grupo}
              </option>
            ))}
          </select>
        </div>
        <div className={formStyles.field}>
          <label htmlFor="mapa-especie" className={formStyles.label}>
            Espécie
          </label>
          <select
            id="mapa-especie"
            className={formStyles.input}
            value={filtros.especie}
            onChange={(e) => alterar("especie", e.target.value)}
          >
            <option value="">Todas</option>
            {especies.map((especie) => (
              <option key={especie} value={especie}>
                {especie}
              </option>
            ))}
          </select>
        </div>
        <div className={formStyles.field}>
          <label htmlFor="mapa-data-inicial" className={formStyles.label}>
            Resgate de
          </label>
          <input
            id="mapa-data-inicial"
            type="date"
            className={formStyles.input}
            value={filtros.dataInicial}
            onChange={(e) => alterar("dataInicial", e.target.value)}
          />
        </div>
        <div className={formStyles.field}>
          <label htmlFor="mapa-data-final" className={formStyles.label}>
            até
          </label>
          <input
            id="mapa-data-final"
            type="date"
            className={formStyles.input}
            value={filtros.dataFinal}
            onChange={(e) => alterar("dataFinal", e.target.value)}
          />
        </div>
      </div>
      <p className={formStyles.hint}>
        O período usa a data do resgate e inclui as datas inicial e final.
      </p>
      {periodoInvertido(filtros) ? (
        <p className={formStyles.error} role="alert">
          A data inicial é posterior à data final; nenhum resgate pode atender a esse período.
        </p>
      ) : null}

      <div className={formStyles.resultBar}>
        <span aria-live="polite">
          <strong>{filtrados.length}</strong> de {resgates.length} resgates no mapa e na tabela
        </span>
        {temFiltroAtivo(filtros) ? (
          <button
            type="button"
            className={formStyles.secondaryButton}
            onClick={() => setFiltros(FILTROS_VAZIOS)}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className={styles.layout}>
        <div>
          {origem === "inicial" ? (
            <p className={blockStyles.notice} role="status">
              Carregando dados da sessão…
            </p>
          ) : (
            <MapaBiomas
              contagens={contagens}
              pontos={filtrados}
              selecionado={selecionado}
              onSelecionar={setSelecionado}
            />
          )}
        </div>

        <aside className={styles.lateral} aria-label="Legenda e resumo do bioma">
          <h2 className={blockStyles.sectionTitle}>Legenda</h2>
          <ul className={styles.legenda}>
            {CATALOGO_BIOMAS.map((bioma) => (
              <li key={bioma.codigo}>
                <button
                  type="button"
                  className={`${styles.itemLegenda} ${selecionado === bioma.codigo ? styles.itemAtivo : ""}`}
                  aria-pressed={selecionado === bioma.codigo}
                  onClick={() => setSelecionado(bioma.codigo)}
                >
                  <span
                    className={styles.amostra}
                    style={{ background: COR_DO_BIOMA[bioma.codigo] }}
                    aria-hidden="true"
                  />
                  <span>{bioma.nome}</span>
                  <strong>{contagens[bioma.codigo]}</strong>
                </button>
              </li>
            ))}
          </ul>
          <p className={formStyles.hint}>
            Cada bioma tem uma cor fixa; o número ao lado é a quantidade de resgates da amostra
            fictícia filtrada, não risco ambiental nem incidência populacional. Bioma mais claro e
            com borda tracejada: sem registros com os filtros atuais, o que não significa ausência
            de resgates reais. Pontos amarelos: bioma calculado diverge do registrado ou coordenada
            fora da malha.
          </p>

          <h2 className={blockStyles.sectionTitle}>Bioma selecionado</h2>
          {selecionado ? (
            <div className={styles.resumo} aria-live="polite">
              <p>
                <strong>{nomeDoBioma(selecionado)}</strong>: {doSelecionado.length} resgate(s) com
                os filtros atuais
              </p>
              {doSelecionado.length > 0 ? (
                <ol className={styles.ranking}>
                  {rankingDeEspecies(doSelecionado).map((item) => (
                    <li key={item.especie}>
                      {item.especie}: <strong>{item.total}</strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={formStyles.hint}>Nenhum resgate deste bioma com os filtros atuais.</p>
              )}
            </div>
          ) : (
            <p className={formStyles.hint}>Clique em um bioma no mapa ou na legenda.</p>
          )}

          <h2 className={blockStyles.sectionTitle}>Divergências</h2>
          {divergentes.length === 0 ? (
            <p className={formStyles.hint}>
              Nenhuma divergência entre o bioma calculado e o registrado nos resgates filtrados.
            </p>
          ) : (
            <ul className={styles.divergencias} role="alert">
              {divergentes.map((resgate) => {
                const bioma = biomaEfetivo(resgate);
                return (
                  <li key={resgate.id}>
                    {resgate.protocolo}:{" "}
                    {bioma.foraDaMalha
                      ? "coordenada fora da malha de MT; mantido o bioma registrado"
                      : `calculado ${nomeDoBioma(bioma.calculado ?? bioma.codigo)}, registrado ${nomeDoBioma(bioma.registrado)}`}
                  </li>
                );
              })}
            </ul>
          )}
          {semCoordenada > 0 ? (
            <p className={formStyles.hint}>
              {semCoordenada} resgate(s) sem coordenada: contados pelo bioma informado e sem ponto
              no mapa.
            </p>
          ) : null}
        </aside>
      </div>

      <RecebimentosTable
        resgates={ordenarRecentes(filtrados)}
        legenda="Resgates filtrados (mesmo conjunto do mapa), do mais recente para o mais antigo"
        mensagemVazia="Nenhum resgate encontrado com esses filtros."
      />
    </PageBlock>
  );
}
