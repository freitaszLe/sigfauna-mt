import styles from "./GraficoBarras.module.css";

type GraficoBarrasProps = {
  titulo: string;
  dados: { rotulo: string; total: number }[];
};

/** Barras horizontais simples; o número aparece sempre ao lado da barra. */
export default function GraficoBarras({ titulo, dados }: GraficoBarrasProps) {
  const maior = Math.max(1, ...dados.map((item) => item.total));

  return (
    <ul className={styles.lista} aria-label={titulo}>
      {dados.map((item) => (
        <li key={item.rotulo} className={styles.linha}>
          <span className={styles.rotulo}>{item.rotulo}</span>
          <span className={styles.trilha} aria-hidden="true">
            <span
              className={styles.barra}
              style={{ width: `${(item.total / maior) * 100}%` }}
            />
          </span>
          <span className={styles.valor}>{item.total}</span>
        </li>
      ))}
    </ul>
  );
}
