import Link from "next/link";
import styles from "./Ficha.module.css";

/** Botão de olho que abre a ficha do resgate (coluna Ação das tabelas). */
export default function BotaoDetalhes({ id, protocolo }: { id: string; protocolo: string }) {
  return (
    <Link
      href={`/acompanhamento/${id}`}
      className={styles.botaoOlho}
      aria-label={`Ver detalhes do resgate ${protocolo}`}
      title="Ver detalhes"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 5C6.5 5 2.2 8.6 1 12c1.2 3.4 5.5 7 11 7s9.8-3.6 11-7c-1.2-3.4-5.5-7-11-7Zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9Zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
        />
      </svg>
    </Link>
  );
}
