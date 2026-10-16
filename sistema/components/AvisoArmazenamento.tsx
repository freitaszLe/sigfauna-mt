"use client";

import { useResgates } from "@/lib/armazenamento";
import styles from "./AvisoArmazenamento.module.css";

/** Aviso quando o navegador bloqueia o armazenamento e as alterações ficam só na memória. */
export default function AvisoArmazenamento() {
  const { origem } = useResgates();
  if (origem !== "memoria") return null;

  return (
    <p role="alert" className={styles.aviso}>
      O navegador bloqueou o armazenamento da sessão. As alterações ficam só na memória e serão
      perdidas ao recarregar a página.
    </p>
  );
}
