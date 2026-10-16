import { nomeDoBioma } from "@/lib/dados";
import { biomaEfetivo } from "@/lib/geo";
import type { Resgate } from "@/lib/types";
import styles from "./BiomaInfo.module.css";

/** Bioma efetivo com o método e, quando houver, o aviso de divergência ou de ponto fora da malha. */
export default function BiomaInfo({ resgate }: { resgate: Resgate }) {
  const bioma = biomaEfetivo(resgate);
  return (
    <>
      {nomeDoBioma(bioma.codigo)}
      <span className={styles.metodo}>{bioma.metodo}</span>
      {bioma.diverge ? (
        <span className={styles.alerta}>
          Diverge: registrado como {nomeDoBioma(bioma.registrado)}
        </span>
      ) : null}
      {bioma.foraDaMalha ? (
        <span className={styles.alerta}>Coordenada fora da malha de MT</span>
      ) : null}
    </>
  );
}
