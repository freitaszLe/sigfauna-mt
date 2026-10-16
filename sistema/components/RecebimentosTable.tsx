"use client";

import { formatarData } from "@/lib/agregacoes";
import type { Resgate } from "@/lib/types";
import BiomaInfo from "./BiomaInfo";
import BotaoDetalhes from "./BotaoDetalhes";
import Paginacao, { usePaginacao } from "./Paginacao";
import StatusBadge from "./StatusBadge";
import { TOM_DA_ETAPA } from "./etapas";
import styles from "./RecebimentosTable.module.css";

type RecebimentosTableProps = {
  resgates: readonly Resgate[];
  legenda: string;
  mensagemVazia?: string;
};

/** Tabela de resgates com paginação de até 5 linhas por página. */
export default function RecebimentosTable({
  resgates,
  legenda,
  mensagemVazia = "Nenhum resgate registrado.",
}: RecebimentosTableProps) {
  const paginacao = usePaginacao(resgates);

  return (
    <div>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <caption className={styles.caption}>{legenda}</caption>
          <thead>
            <tr>
              <th scope="col">Protocolo</th>
              <th scope="col">Espécie</th>
              <th scope="col">Bioma do local</th>
              <th scope="col">Etapa atual</th>
              <th scope="col">Data do resgate</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {resgates.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  {mensagemVazia}
                </td>
              </tr>
            ) : (
              paginacao.itensDaPagina.map((resgate) => (
                <tr key={resgate.id}>
                  <td>{resgate.protocolo}</td>
                  <td>
                    {resgate.especie}
                    <span className={styles.secondary}>
                      {resgate.grupo} · {resgate.identificacao}
                    </span>
                  </td>
                  <td>
                    <BiomaInfo resgate={resgate} />
                  </td>
                  <td>
                    <StatusBadge label={resgate.etapa} tone={TOM_DA_ETAPA[resgate.etapa]} />
                  </td>
                  <td>{formatarData(resgate.dataResgate)}</td>
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
        rotulo={`Paginação: ${legenda}`}
      />
    </div>
  );
}
