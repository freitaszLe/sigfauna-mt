"use client";

import { nomeDoBioma } from "@/lib/dados";
import {
  calcularContexto,
  formatarKm,
  ROTULO_DO_GRUPO,
  type DadosDasCamadas,
  type ResultadoDaCamada,
} from "@/lib/camadasSema";
import type { BiomaCodigo, CoordenadaFicticia } from "@/lib/types";
import styles from "./QuadroGeografico.module.css";

type Props = {
  ponto: CoordenadaFicticia;
  bioma: BiomaCodigo | null;
  dados: DadosDasCamadas | null;
};

function Linha({ rotulo, resultado }: { rotulo: string; resultado?: ResultadoDaCamada }) {
  if (!resultado) return <li><span className={styles.rotulo}>{rotulo}</span><span className={styles.mudo}>Sem dados no momento</span></li>;
  return (
    <li>
      <span className={styles.rotulo}>{rotulo}</span>
      <span>
        {resultado.dentro.length > 0 ? (
          resultado.dentro.map((a) => (
            <span key={a.nome} className={styles.bloco}>
              {a.nome}
              {a.categoria ? <span className={styles.mudo}> ({a.categoria})</span> : null}
              {a.grupo && a.grupo !== "outras" ? <span className={styles.selo}>{ROTULO_DO_GRUPO[a.grupo]}</span> : null}
            </span>
          ))
        ) : (
          <>
            <span className={styles.mudo}>Nenhuma</span>
            {resultado.maisProxima ? (
              <span className={styles.mudo}>
                {" "}· a mais próxima é {resultado.maisProxima.nome}
                {resultado.maisProxima.categoria ? ` (${resultado.maisProxima.categoria})` : ""}, a {formatarKm(resultado.maisProxima.km)}
              </span>
            ) : null}
          </>
        )}
      </span>
    </li>
  );
}

/** Informações geográficas do ponto, calculadas na tela com as camadas da SEMA; não são gravadas. */
export default function QuadroGeografico({ ponto, bioma, dados }: Props) {
  const contexto = dados ? calcularContexto(ponto.lat, ponto.lng, dados) : {};
  const uc = contexto.UNIDADES_DE_CONSERVACAO;
  const za = contexto.ZONAS_DE_AMORTECIMENTO;
  const ti = contexto.TERRAS_INDIGENAS;
  const resumo = [
    bioma ? nomeDoBioma(bioma) : null,
    uc ? (uc.dentro.length > 0 ? "em unidade de conservação" : "fora de unidade de conservação") : null,
    za && za.dentro.length > 0 ? "em zona de amortecimento" : null,
    ti && ti.dentro.length > 0 ? "em terra indígena" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <details className={styles.quadro}>
      <summary>
        <strong>Informações geográficas</strong>
        <span className={styles.mudo}>{dados ? resumo : "Lendo as camadas…"}</span>
      </summary>
      <ul className={styles.lista}>
        <li>
          <span className={styles.rotulo}>Bioma</span>
          <span>{bioma ? nomeDoBioma(bioma) : <span className={styles.mudo}>Não identificado</span>}</span>
        </li>
        <Linha rotulo="Unidade de conservação" resultado={uc} />
        {za && za.dentro.length > 0 ? (
          <li>
            <span className={styles.rotulo}>Zona de amortecimento</span>
            <span>{za.dentro.map((a) => `de ${a.nome}`).join("; ")}</span>
          </li>
        ) : null}
        <Linha rotulo="Terra indígena" resultado={ti} />
      </ul>
      <p className={styles.nota}>
        Calculado na tela com as camadas da SEMA-MT (dados abertos); não é gravado nem decide a soltura.
      </p>
    </details>
  );
}
