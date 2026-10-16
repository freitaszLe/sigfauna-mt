"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { formatarDataHora } from "@/lib/agregacoes";
import { useResgates } from "@/lib/armazenamento";
import { CATALOGO_BIOMAS } from "@/lib/dados";
import { casosDaFila, entradaNaEtapa, filaPorSlug, type Fila } from "@/lib/filas";
import { FILTROS_VAZIOS, filtrarResgates, temFiltroAtivo, type FiltrosResgates } from "@/lib/filtros";
import { GRUPOS, type Resgate } from "@/lib/types";
import BotaoDetalhes from "./BotaoDetalhes";
import PageBlock from "./PageBlock";
import Paginacao, { usePaginacao } from "./Paginacao";
import StatusBadge from "./StatusBadge";
import { TOM_DA_ETAPA } from "./etapas";
import blockStyles from "./PageBlock.module.css";
import formStyles from "./Formulario.module.css";
import tableStyles from "./RecebimentosTable.module.css";

/** Página de uma etapa do Acompanhamento (submenu), com colunas próprias da etapa. */
export default function PaginaFila() {
  const { slug } = useParams<{ slug: string }>();
  const fila = filaPorSlug(slug);
  const { resgates, origem } = useResgates();

  if (!fila) {
    return (
      <PageBlock title="Acompanhamento">
        <p className={blockStyles.notice}>Etapa não encontrada.</p>
        <Link href="/acompanhamento">Voltar ao acompanhamento</Link>
      </PageBlock>
    );
  }

  return (
    <PageBlock title={`Acompanhamento · ${fila.nome}`}>
      {origem === "inicial" ? (
        <p className={blockStyles.notice} role="status">
          Carregando…
        </p>
      ) : (
        <ConteudoFila fila={fila} casos={casosDaFila(resgates, fila)} />
      )}
    </PageBlock>
  );
}

function ConteudoFila({ fila, casos }: { fila: Fila; casos: Resgate[] }) {
  const [filtros, setFiltros] = useState<FiltrosResgates>(FILTROS_VAZIOS);
  const encontrados = filtrarResgates(casos, filtros);
  const filtrando = temFiltroAtivo(filtros);

  function alterar<K extends keyof FiltrosResgates>(campo: K, valor: FiltrosResgates[K]) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  }

  return (
    <>
      <p className={formStyles.hint}>
        <StatusBadge label={fila.etapa} tone={TOM_DA_ETAPA[fila.etapa]} /> {fila.descricao} As
        colunas mostram as últimas respostas registradas; o sistema não faz diagnóstico.
      </p>

      <div className={formStyles.filters} role="search" aria-label={`Filtros: ${fila.nome}`}>
        <div className={formStyles.field}>
          <label htmlFor="fila-busca" className={formStyles.label}>
            Buscar
          </label>
          <input
            id="fila-busca"
            type="search"
            className={formStyles.input}
            placeholder="Protocolo, identificação ou espécie"
            value={filtros.busca}
            onChange={(e) => alterar("busca", e.target.value)}
          />
        </div>
        <div className={formStyles.field}>
          <label htmlFor="fila-grupo" className={formStyles.label}>
            Grupo
          </label>
          <select
            id="fila-grupo"
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
          <label htmlFor="fila-bioma" className={formStyles.label}>
            Bioma
          </label>
          <select
            id="fila-bioma"
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
      </div>

      <div className={formStyles.resultBar}>
        <span aria-live="polite">
          <strong>{encontrados.length}</strong> de {casos.length}{" "}
          {casos.length === 1 ? "caso" : "casos"} nesta etapa
        </span>
        {filtrando ? (
          <button
            type="button"
            className={formStyles.secondaryButton}
            onClick={() => setFiltros(FILTROS_VAZIOS)}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      <TabelaFila key={JSON.stringify(filtros)} fila={fila} casos={encontrados} filtrando={filtrando} />
    </>
  );
}

function TabelaFila({ fila, casos, filtrando }: { fila: Fila; casos: Resgate[]; filtrando: boolean }) {
  const paginacao = usePaginacao(casos);
  const totalColunas = fila.colunas.length + 4;
  const ordem =
    fila.etapa === "Concluído" ? "do mais recente para o mais antigo" : "há mais tempo na etapa primeiro";

  return (
    <div>
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <caption className={tableStyles.caption}>
            {fila.nome}: {ordem}
          </caption>
          <thead>
            <tr>
              <th scope="col">Protocolo</th>
              <th scope="col">Espécie</th>
              {fila.colunas.map((coluna) => (
                <th key={coluna.titulo} scope="col">
                  {coluna.titulo}
                </th>
              ))}
              <th scope="col">{fila.tituloDesde}</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {casos.length === 0 ? (
              <tr>
                <td colSpan={totalColunas} className={tableStyles.empty}>
                  {filtrando ? "Nenhum caso com esses filtros." : "Nenhum caso nesta etapa."}
                </td>
              </tr>
            ) : (
              paginacao.itensDaPagina.map((resgate) => (
                <tr key={resgate.id}>
                  <td>{resgate.protocolo}</td>
                  <td>
                    {resgate.especie}
                    <span className={tableStyles.secondary}>
                      {resgate.grupo} · {resgate.identificacao}
                    </span>
                  </td>
                  {fila.colunas.map((coluna) => (
                    <td key={coluna.titulo}>{coluna.valor(resgate)}</td>
                  ))}
                  <td>{formatarDataHora(entradaNaEtapa(resgate))}</td>
                  <td>
                    <BotaoDetalhes id={resgate.id} protocolo={resgate.protocolo} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Paginacao
        pagina={paginacao.pagina}
        totalPaginas={paginacao.totalPaginas}
        primeiro={paginacao.primeiro}
        ultimo={paginacao.ultimo}
        total={paginacao.total}
        onMudar={paginacao.setPagina}
        rotulo={`Paginação: ${fila.nome}`}
      />
    </div>
  );
}
