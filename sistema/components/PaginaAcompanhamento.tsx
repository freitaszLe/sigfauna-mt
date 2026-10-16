"use client";

import Link from "next/link";
import { formatarDataHora } from "@/lib/agregacoes";
import { useResgates } from "@/lib/armazenamento";
import { nomeDoBioma } from "@/lib/dados";
import { ultimaMudanca } from "@/lib/fluxo";
import StatusBadge from "./StatusBadge";
import { TOM_DA_ETAPA } from "./etapas";
import PageBlock from "./PageBlock";
import styles from "./Ficha.module.css";
import formStyles from "./Formulario.module.css";
import tableStyles from "./RecebimentosTable.module.css";

export default function PaginaAcompanhamento() {
  const { resgates } = useResgates();
  const ativos = resgates
    .filter((resgate) => resgate.etapa !== "Concluído")
    .sort((a, b) => ultimaMudanca(b).localeCompare(ultimaMudanca(a)));

  return (
    <PageBlock title="Acompanhamento">
      <p className={formStyles.hint}>
        O sistema registra a etapa escolhida pela equipe. Não faz diagnóstico, decisão clínica nem
        autoriza soltura.
      </p>

      <div className={formStyles.resultBar}>
        <span>
          <strong>{ativos.length}</strong> casos ativos de {resgates.length} resgates
        </span>
      </div>

      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <caption className={tableStyles.caption}>
            Casos ativos (exceto concluídos), pela mudança de etapa mais recente
          </caption>
          <thead>
            <tr>
              <th scope="col">Protocolo</th>
              <th scope="col">Espécie</th>
              <th scope="col">Bioma do local</th>
              <th scope="col">Etapa atual</th>
              <th scope="col">Última mudança</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {ativos.length === 0 ? (
              <tr>
                <td colSpan={6} className={tableStyles.empty}>
                  Nenhum caso ativo nesta sessão.
                </td>
              </tr>
            ) : (
              ativos.map((resgate) => (
                <tr key={resgate.id}>
                  <td>{resgate.protocolo}</td>
                  <td>
                    {resgate.especie}
                    <span className={tableStyles.secondary}>
                      {resgate.grupo} · {resgate.identificacao}
                    </span>
                  </td>
                  <td>{nomeDoBioma(resgate.biomaCodigo)}</td>
                  <td>
                    <StatusBadge label={resgate.etapa} tone={TOM_DA_ETAPA[resgate.etapa]} />
                  </td>
                  <td>{formatarDataHora(ultimaMudanca(resgate))}</td>
                  <td>
                    <Link
                      href={`/acompanhamento/${resgate.id}`}
                      className={styles.botaoOlho}
                      aria-label={`Abrir ficha do resgate ${resgate.protocolo}`}
                      title="Abrir ficha"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          fill="currentColor"
                          d="M12 5C6.5 5 2.2 8.6 1 12c1.2 3.4 5.5 7 11 7s9.8-3.6 11-7c-1.2-3.4-5.5-7-11-7Zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9Zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
                        />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageBlock>
  );
}
