import { formatarData } from "@/lib/agregacoes";
import { nomeDoBioma } from "@/lib/dados";
import type { Resgate } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { TOM_DA_ETAPA } from "./etapas";
import styles from "./RecebimentosTable.module.css";

type RecebimentosTableProps = {
  resgates: readonly Resgate[];
  legenda: string;
};

export default function RecebimentosTable({ resgates, legenda }: RecebimentosTableProps) {
  return (
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
          </tr>
        </thead>
        <tbody>
          {resgates.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.empty}>
                Nenhum resgate registrado nesta sessão.
              </td>
            </tr>
          ) : (
            resgates.map((resgate) => (
              <tr key={resgate.id}>
                <td>{resgate.protocolo}</td>
                <td>
                  {resgate.especie}
                  <span className={styles.secondary}>
                    {resgate.grupo} · {resgate.identificacao}
                  </span>
                </td>
                <td>
                  {nomeDoBioma(resgate.biomaCodigo)}
                  <span className={styles.secondary}>{resgate.metodoIdentificacaoBioma}</span>
                </td>
                <td>
                  <StatusBadge label={resgate.etapa} tone={TOM_DA_ETAPA[resgate.etapa]} />
                </td>
                <td>{formatarData(resgate.dataResgate)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
