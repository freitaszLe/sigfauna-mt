"use client";

import { useState } from "react";
import { formatarDataHora } from "@/lib/agregacoes";
import { useResgates } from "@/lib/armazenamento";
import { CATALOGO_BIOMAS } from "@/lib/dados";
import {
  FILTROS_VAZIOS,
  filtrarResgates,
  temFiltroAtivo,
  type FiltrosResgates,
} from "@/lib/filtros";
import { ultimaMudanca } from "@/lib/fluxo";
import { ETAPAS, GRUPOS, type Resgate } from "@/lib/types";
import BiomaInfo from "./BiomaInfo";
import BotaoDetalhes from "./BotaoDetalhes";
import Paginacao, { usePaginacao } from "./Paginacao";
import StatusBadge from "./StatusBadge";
import { TOM_DA_ETAPA } from "./etapas";
import PageBlock from "./PageBlock";
import formStyles from "./Formulario.module.css";
import tableStyles from "./RecebimentosTable.module.css";

const ETAPAS_ATIVAS = ETAPAS.filter((etapa) => etapa !== "Concluído");

export default function PaginaAcompanhamento() {
  const { resgates } = useResgates();
  const [filtros, setFiltros] = useState<FiltrosResgates>(FILTROS_VAZIOS);
  const ativos = resgates.filter((resgate) => resgate.etapa !== "Concluído");
  const encontrados = filtrarResgates(ativos, filtros).sort((a, b) =>
    ultimaMudanca(b).localeCompare(ultimaMudanca(a)),
  );

  function alterar<K extends keyof FiltrosResgates>(campo: K, valor: FiltrosResgates[K]) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  }

  return (
    <PageBlock title="Acompanhamento">
      <p className={formStyles.hint}>
        O sistema registra as avaliações e os encaminhamentos escolhidos pela equipe. Não faz
        diagnóstico, decisão clínica nem autoriza soltura.
      </p>

      <div className={formStyles.filters} role="search" aria-label="Filtros do acompanhamento">
        <div className={formStyles.field}>
          <label htmlFor="acomp-busca" className={formStyles.label}>
            Buscar
          </label>
          <input
            id="acomp-busca"
            type="search"
            className={formStyles.input}
            placeholder="Protocolo, identificação ou espécie"
            value={filtros.busca}
            onChange={(e) => alterar("busca", e.target.value)}
          />
        </div>
        <div className={formStyles.field}>
          <label htmlFor="acomp-etapa" className={formStyles.label}>
            Etapa atual
          </label>
          <select
            id="acomp-etapa"
            className={formStyles.input}
            value={filtros.etapa}
            onChange={(e) => alterar("etapa", e.target.value as FiltrosResgates["etapa"])}
          >
            <option value="">Todas</option>
            {ETAPAS_ATIVAS.map((etapa) => (
              <option key={etapa} value={etapa}>
                {etapa}
              </option>
            ))}
          </select>
        </div>
        <div className={formStyles.field}>
          <label htmlFor="acomp-grupo" className={formStyles.label}>
            Grupo
          </label>
          <select
            id="acomp-grupo"
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
          <label htmlFor="acomp-bioma" className={formStyles.label}>
            Bioma
          </label>
          <select
            id="acomp-bioma"
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
          <strong>{encontrados.length}</strong> de {ativos.length} casos ativos ({resgates.length}{" "}
          resgates no total)
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

      {/* key volta a tabela para a página 1 quando os filtros mudam */}
      <TabelaCasosAtivos key={JSON.stringify(filtros)} casos={encontrados} filtrando={temFiltroAtivo(filtros)} />
    </PageBlock>
  );
}

function TabelaCasosAtivos({ casos, filtrando }: { casos: readonly Resgate[]; filtrando: boolean }) {
  const paginacao = usePaginacao(casos);
  return (
    <div>
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <caption className={tableStyles.caption}>
            Casos ativos (exceto concluídos), pela atualização mais recente
          </caption>
          <thead>
            <tr>
              <th scope="col">Protocolo</th>
              <th scope="col">Espécie</th>
              <th scope="col">Bioma do local</th>
              <th scope="col">Etapa atual</th>
              <th scope="col">Última atualização</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {casos.length === 0 ? (
              <tr>
                <td colSpan={6} className={tableStyles.empty}>
                  {filtrando ? "Nenhum caso ativo com esses filtros." : "Nenhum caso ativo."}
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
                  <td>
                    <BiomaInfo resgate={resgate} />
                  </td>
                  <td>
                    <StatusBadge label={resgate.etapa} tone={TOM_DA_ETAPA[resgate.etapa]} />
                  </td>
                  <td>{formatarDataHora(ultimaMudanca(resgate))}</td>
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
        rotulo="Paginação dos casos ativos"
      />
    </div>
  );
}
