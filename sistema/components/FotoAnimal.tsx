import { fotoDaEspecie } from "@/lib/fotos";
import styles from "./FotoAnimal.module.css";

type Props = { especie: string; tamanho?: "mini" | "grande" };

/** Foto de exemplo da espécie (CC0); sem foto cadastrada, mostra um espaço neutro. */
export default function FotoAnimal({ especie, tamanho = "mini" }: Props) {
  const src = fotoDaEspecie(especie);
  const classe = `${styles.foto} ${tamanho === "grande" ? styles.grande : styles.mini}`;
  if (!src) return <span className={`${classe} ${styles.sem}`} aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`Foto de exemplo: ${especie}`} className={classe} loading="lazy" />;
}
