import type { BiomaCodigo } from "@/lib/types";

/**
 * Cor fixa de cada bioma no mapa e na legenda. A cor identifica o bioma; a quantidade
 * aparece sempre como número na legenda e na dica do mapa.
 */
export const COR_DO_BIOMA: Record<BiomaCodigo, string> = {
  amazonia: "#2f7d4a",
  cerrado: "#c98b3b",
  pantanal: "#3e8ebf",
};
