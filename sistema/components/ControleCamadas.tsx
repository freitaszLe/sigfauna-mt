"use client";

import {
  CAMADAS,
  ESTILO_DA_CAMADA,
  ESTILO_DO_GRUPO,
  GRUPOS,
  ROTULO_DA_CAMADA,
  ROTULO_DO_GRUPO,
  type IdCamada,
} from "@/lib/camadasSema";
import styles from "./ControleCamadas.module.css";

type Props = {
  ligadas: readonly IdCamada[];
  onAlternar: (id: IdCamada) => void;
  /** true enquanto os arquivos das camadas são lidos. */
  carregando?: boolean;
};

/** Liga e desliga as camadas da SEMA e mostra a legenda de cada uma. */
export default function ControleCamadas({ ligadas, onAlternar, carregando }: Props) {
  return (
    <fieldset className={styles.caixa}>
      <legend className={styles.titulo}>Camadas da SEMA</legend>
      {CAMADAS.map((id) => {
        const ligada = ligadas.includes(id);
        return (
          <div key={id} className={styles.item}>
            <label className={styles.rotulo}>
              <input type="checkbox" checked={ligada} onChange={() => onAlternar(id)} />
              {ROTULO_DA_CAMADA[id]}
            </label>
            {ligada && id === "UNIDADES_DE_CONSERVACAO" ? (
              <ul className={styles.legenda}>
                {GRUPOS.map((g) => (
                  <li key={g}>
                    <i
                      className={styles.amostra}
                      style={{
                        background: `${ESTILO_DO_GRUPO[g].cor}55`,
                        borderColor: ESTILO_DO_GRUPO[g].cor,
                      }}
                    />
                    {ROTULO_DO_GRUPO[g]}
                  </li>
                ))}
              </ul>
            ) : null}
            {ligada && id !== "UNIDADES_DE_CONSERVACAO" ? (
              <ul className={styles.legenda}>
                <li>
                  <i
                    className={styles.amostra}
                    style={{
                      background: `${ESTILO_DA_CAMADA[id].cor}33`,
                      borderColor: ESTILO_DA_CAMADA[id].cor,
                      borderStyle: id === "ZONAS_DE_AMORTECIMENTO" ? "dashed" : "solid",
                    }}
                  />
                  {id === "ZONAS_DE_AMORTECIMENTO" ? "Entorno das unidades" : "Terra indígena"}
                </li>
              </ul>
            ) : null}
          </div>
        );
      })}
      <p className={styles.nota}>
        {carregando
          ? "Lendo as camadas…"
          : "Limite legal, não é uma cerca: o mapa informa, a decisão é da equipe técnica."}
      </p>
    </fieldset>
  );
}
