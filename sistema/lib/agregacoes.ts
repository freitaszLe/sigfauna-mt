import { biomaEfetivo } from "./geo";
import {
  BIOMAS,
  ETAPAS,
  GRUPOS,
  type BiomaCodigo,
  type Etapa,
  type Grupo,
  type Resgate,
} from "./types";

export type ResumoPainel = {
  total: number;
  ativos: number;
  emCuidado: number;
  concluidos: number;
};

export function contarPorEtapa(resgates: readonly Resgate[]): Record<Etapa, number> {
  const contagem = Object.fromEntries(ETAPAS.map((etapa) => [etapa, 0])) as Record<Etapa, number>;
  for (const resgate of resgates) contagem[resgate.etapa] += 1;
  return contagem;
}

export function resumirPainel(resgates: readonly Resgate[]): ResumoPainel {
  const porEtapa = contarPorEtapa(resgates);
  return {
    total: resgates.length,
    ativos: resgates.length - porEtapa["Concluído"],
    emCuidado: porEtapa["Em tratamento"] + porEtapa["Em reabilitação"],
    concluidos: porEtapa["Concluído"],
  };
}

/** Quantidade por grupo, da maior para a menor; grupos sem registro aparecem com 0. */
export function contarPorGrupo(resgates: readonly Resgate[]): { grupo: Grupo; total: number }[] {
  return GRUPOS.map((grupo) => ({
    grupo,
    total: resgates.filter((resgate) => resgate.grupo === grupo).length,
  })).sort((a, b) => b.total - a.total || a.grupo.localeCompare(b.grupo, "pt-BR"));
}

/**
 * Quantidade por bioma do local do resgate (bioma efetivo: calculado pela coordenada
 * quando houver), na ordem do catálogo; biomas sem registro aparecem com 0.
 */
export function contarPorBioma(
  resgates: readonly Resgate[],
): { bioma: BiomaCodigo; total: number }[] {
  return BIOMAS.map((bioma) => ({
    bioma,
    total: resgates.filter((resgate) => biomaEfetivo(resgate).codigo === bioma).length,
  }));
}

/** Espécies em ordem decrescente de quantidade; empate em ordem alfabética. */
export function rankingDeEspecies(
  resgates: readonly Resgate[],
): { especie: string; total: number }[] {
  const contagem = new Map<string, number>();
  for (const resgate of resgates) {
    contagem.set(resgate.especie, (contagem.get(resgate.especie) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([especie, total]) => ({ especie, total }))
    .sort((a, b) => b.total - a.total || a.especie.localeCompare(b.especie, "pt-BR"));
}

/** Ordena pela data do resgate, mais recente primeiro; empate resolvido pelo protocolo. */
export function ordenarRecentes(resgates: readonly Resgate[]): Resgate[] {
  return [...resgates].sort(
    (a, b) => b.dataResgate.localeCompare(a.dataResgate) || b.protocolo.localeCompare(a.protocolo),
  );
}

export function ultimosRecebimentos(resgates: readonly Resgate[], quantidade: number): Resgate[] {
  return ordenarRecentes(resgates).slice(0, quantidade);
}

export function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "AAAA-MM-DDTHH:MM..." → "DD/MM/AAAA HH:MM", sem converter fuso. */
export function formatarDataHora(dataHoraIso: string): string {
  const hora = dataHoraIso.slice(11, 16);
  return hora ? `${formatarData(dataHoraIso)} ${hora}` : formatarData(dataHoraIso);
}
