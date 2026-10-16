import type { BiomaCodigo, Etapa, Grupo, Resgate } from "./types";

export type FiltrosResgates = {
  busca: string;
  grupo: Grupo | "";
  bioma: BiomaCodigo | "";
  etapa: Etapa | "";
  /** AAAA-MM-DD, inclusive. */
  dataInicial: string;
  /** AAAA-MM-DD, inclusive. */
  dataFinal: string;
};

export const FILTROS_VAZIOS: FiltrosResgates = {
  busca: "",
  grupo: "",
  bioma: "",
  etapa: "",
  dataInicial: "",
  dataFinal: "",
};

/** Minúsculas e sem acentos, para busca tolerante. */
export function normalizarTexto(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function periodoInvertido(filtros: FiltrosResgates): boolean {
  return Boolean(filtros.dataInicial && filtros.dataFinal && filtros.dataInicial > filtros.dataFinal);
}

export function temFiltroAtivo(filtros: FiltrosResgates): boolean {
  return Object.values(filtros).some((valor) => valor !== "");
}

/**
 * Aplica busca e filtros combinados. O período usa a data do resgate e inclui
 * as duas pontas.
 */
export function filtrarResgates(
  resgates: readonly Resgate[],
  filtros: FiltrosResgates,
): Resgate[] {
  const termo = normalizarTexto(filtros.busca);
  return resgates.filter((resgate) => {
    if (
      termo &&
      ![resgate.protocolo, resgate.identificacao, resgate.especie].some((campo) =>
        normalizarTexto(campo).includes(termo),
      )
    ) {
      return false;
    }
    if (filtros.grupo && resgate.grupo !== filtros.grupo) return false;
    if (filtros.bioma && resgate.biomaCodigo !== filtros.bioma) return false;
    if (filtros.etapa && resgate.etapa !== filtros.etapa) return false;
    if (filtros.dataInicial && resgate.dataResgate < filtros.dataInicial) return false;
    if (filtros.dataFinal && resgate.dataResgate > filtros.dataFinal) return false;
    return true;
  });
}
