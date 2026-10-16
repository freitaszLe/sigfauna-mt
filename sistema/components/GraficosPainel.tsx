import type { Grupo } from "@/lib/types";
import styles from "./GraficosPainel.module.css";

export type FatiaGrafico = { rotulo: string; total: number; cor: string };

/** Cor fixa de cada grupo no gráfico de rosca; o nome e o número aparecem sempre na legenda. */
export const COR_DO_GRUPO: Record<Grupo, string> = {
  Ave: "#d99a1e",
  Mamífero: "#8b5e3c",
  Réptil: "#4f8a6b",
};

function porcentagem(parte: number, total: number): number {
  return total === 0 ? 0 : Math.round((parte / total) * 100);
}

type CartaoProps = { titulo: string; subtitulo: string; total: number; dados: FatiaGrafico[] };

/** Barras horizontais na cor de cada item, com quantidade e porcentagem escritas. */
export function CartaoBarras({ titulo, subtitulo, total, dados }: CartaoProps) {
  const maior = Math.max(1, ...dados.map((item) => item.total));
  return (
    <section className={styles.cartao} aria-labelledby={`titulo-${titulo}`}>
      <header className={styles.cabecalho}>
        <h3 id={`titulo-${titulo}`} className={styles.titulo}>
          {titulo}
        </h3>
        <span className={styles.subtitulo}>{subtitulo}</span>
      </header>
      <ul className={styles.barras} aria-label={titulo}>
        {dados.map((item) => (
          <li key={item.rotulo} className={styles.linhaBarra}>
            <span className={styles.rotuloBarra}>
              <span className={styles.amostra} style={{ background: item.cor }} aria-hidden="true" />
              {item.rotulo}
            </span>
            <span className={styles.trilha} aria-hidden="true">
              <span
                className={styles.barra}
                style={{ width: `${(item.total / maior) * 100}%`, background: item.cor }}
              />
            </span>
            <span className={styles.valor}>
              {item.total} <small>({porcentagem(item.total, total)}%)</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const RAIO = 15.9155; // circunferência de 100, para usar porcentagens no traço

/** Gráfico de rosca em SVG, com o total no centro e legenda com números. */
export function CartaoRosca({ titulo, subtitulo, total, dados }: CartaoProps) {
  const porcentagens = dados.map((item) => (total === 0 ? 0 : (item.total / total) * 100));
  const fatias = dados.map((item, indice) => ({
    ...item,
    fatia: porcentagens[indice],
    // A fatia começa onde terminam as anteriores.
    inicio: porcentagens.slice(0, indice).reduce((soma, valor) => soma + valor, 0),
  }));

  return (
    <section className={styles.cartao} aria-labelledby={`titulo-${titulo}`}>
      <header className={styles.cabecalho}>
        <h3 id={`titulo-${titulo}`} className={styles.titulo}>
          {titulo}
        </h3>
        <span className={styles.subtitulo}>{subtitulo}</span>
      </header>
      <div className={styles.rosca}>
        <svg viewBox="0 0 42 42" className={styles.svgRosca} aria-hidden="true" focusable="false">
          <circle cx="21" cy="21" r={RAIO} fill="none" stroke="#e7ebef" strokeWidth="6" />
          {fatias.map((item) =>
            item.fatia > 0 ? (
              <circle
                key={item.rotulo}
                cx="21"
                cy="21"
                r={RAIO}
                fill="none"
                stroke={item.cor}
                strokeWidth="6"
                strokeDasharray={`${item.fatia} ${100 - item.fatia}`}
                strokeDashoffset={25 - item.inicio}
              />
            ) : null,
          )}
          <text x="21" y="21" textAnchor="middle" className={styles.totalRosca}>
            {total}
          </text>
          <text x="21" y="27" textAnchor="middle" className={styles.legendaTotal}>
            resgates
          </text>
        </svg>
        <ul className={styles.legenda} aria-label={titulo}>
          {fatias.map((item) => (
            <li key={item.rotulo} className={styles.itemLegenda}>
              <span className={styles.amostra} style={{ background: item.cor }} aria-hidden="true" />
              <span className={styles.rotuloLegenda}>{item.rotulo}</span>
              <span className={styles.valor}>
                {item.total} <small>({porcentagem(item.total, total)}%)</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
