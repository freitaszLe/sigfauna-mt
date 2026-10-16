"use client";

import { useResgates } from "@/lib/armazenamento";
import styles from "./AvisoArmazenamento.module.css";

const MENSAGENS = {
  memoria:
    "O navegador bloqueou o armazenamento da sessão. As alterações ficam só na memória e serão perdidas ao recarregar a página.",
  corrompido:
    "Os dados salvos nesta aba estão em formato inválido e não foram usados. Nada será gravado até você usar \"Restaurar demonstração\" no menu.",
  versaoAnterior:
    "Os dados salvos nesta aba são de uma versão anterior do sistema (antes do recorte por bioma) e não foram usados. Nada será gravado até você usar \"Restaurar demonstração\" no menu.",
} as const;

export default function AvisoArmazenamento() {
  const { origem } = useResgates();
  if (origem !== "memoria" && origem !== "corrompido" && origem !== "versaoAnterior") {
    return null;
  }

  return (
    <p role="alert" className={styles.aviso}>
      {MENSAGENS[origem]}
    </p>
  );
}
