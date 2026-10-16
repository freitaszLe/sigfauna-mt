"use client";

import { formatarData } from "@/lib/agregacoes";
import type { CoordenadaFicticia, Resgate } from "@/lib/types";
import BiomaInfo from "./BiomaInfo";
import BotaoDetalhes from "./BotaoDetalhes";
import Paginacao, { usePaginacao } from "./Paginacao";
import styles from "./RecebimentosTable.module.css";

/** Coordenada fictícia com vírgula decimal (padrão brasileiro). */
export function formatarCoordenada(coordenada: CoordenadaFicticia | null): string {
  if (!coordenada) return "Sem coordenada";
  const numero = (valor: number) =>
    valor.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 4 });
  return `${numero(coordenada.lat)}; ${numero(coordenada.lng)}`;
}

type TabelaResgatesProps = {
  resgates: readonly Resgate[];
  mensagemVazia: string;
};

/**
 * Tabela da tela de Resgates: dados do resgate em si (animal, local e data).
 * A etapa e o tratamento ficam no Acompanhamento.
 */
export default function TabelaResgates({ resgates, mensagemVazia }: TabelaResgatesProps) {
  const paginacao = usePaginacao(resgates);
  const legenda = "Resgates registrados, do mais recente para o mais antigo";

  return (
    <div>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <caption className={styles.caption}>{legenda}</caption>
          <thead>
            <tr>
              <th scope="col">Protocolo</th>
              <th scope="col">Animal</th>
              <th scope="col">Grupo</th>
              <th scope="col">Bioma do local</th>
              <th scope="col">Coordenada fictícia</th>
              <th scope="col">Data do resgate</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {resgates.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  {mensagemVazia}
                </td>
              </tr>
            ) : (
              paginacao.itensDaPagina.map((resgate) => (
                <tr key={resgate.id}>
                  <td>{resgate.protocolo}</td>
                  <td>
                    {resgate.especie}
                    <span className={styles.secondary}>{resgate.identificacao}</span>
                  </td>
                  <td>{resgate.grupo}</td>
                  <td>
                    <BiomaInfo resgate={resgate} />
                  </td>
                  <td className={styles.numero}>{formatarCoordenada(resgate.coordenadaFicticia)}</td>
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
