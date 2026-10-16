import type { Etapa } from "@/lib/types";
import type { Tone } from "./StatCard";

/** Cor de cada etapa; a etiqueta sempre mostra o nome da etapa junto. */
export const TOM_DA_ETAPA: Record<Etapa, Tone> = {
  Recebido: "info",
  "Em triagem": "warning",
  "Em tratamento": "danger",
  "Em reabilitação": "warning",
  "Aguardando destinação": "info",
  Concluído: "success",
};
