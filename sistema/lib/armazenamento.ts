import { useSyncExternalStore } from "react";
import { RESGATES_DEMO } from "./dados";
import { VERSAO_ESQUEMA, type EstadoArmazenado, type Resgate } from "./types";
import { validarEstadoArmazenado } from "./validacao";

/** Única chave usada pelo projeto no sessionStorage. */
export const CHAVE_SESSAO = "fauna-u06:v1";

/**
 * Origem dos dados exibidos:
 * - inicial: renderização no servidor e hidratação (sessão ainda não lida);
 * - sessao: dados lidos/gravados no sessionStorage desta aba;
 * - memoria: sessionStorage indisponível; a recarga perde as alterações;
 * - corrompido: conteúdo salvo inválido; nada é gravado até restaurar;
 * - versaoAnterior: conteúdo salvo em outra versão do esquema; nada é gravado até restaurar.
 */
export type OrigemDados = "inicial" | "sessao" | "memoria" | "corrompido" | "versaoAnterior";

export type EstadoResgates = {
  resgates: readonly Resgate[];
  origem: OrigemDados;
};

const ESTADO_SERVIDOR: EstadoResgates = { resgates: RESGATES_DEMO, origem: "inicial" };

let estadoAtual: EstadoResgates | null = null;
const ouvintes = new Set<() => void>();

function serializar(resgates: readonly Resgate[]): string {
  const estado: EstadoArmazenado = { versao: VERSAO_ESQUEMA, resgates: [...resgates] };
  return JSON.stringify(estado);
}

function lerSessao(): EstadoResgates {
  let bruto: string | null;
  try {
    bruto = window.sessionStorage.getItem(CHAVE_SESSAO);
  } catch {
    return { resgates: RESGATES_DEMO, origem: "memoria" };
  }

  // Primeira visita nesta aba: grava os exemplos. Só acontece quando não há nada salvo.
  if (bruto === null) {
    try {
      window.sessionStorage.setItem(CHAVE_SESSAO, serializar(RESGATES_DEMO));
      return { resgates: RESGATES_DEMO, origem: "sessao" };
    } catch {
      return { resgates: RESGATES_DEMO, origem: "memoria" };
    }
  }

  try {
    const conteudo: unknown = JSON.parse(bruto);
    const estado = validarEstadoArmazenado(conteudo);
    if (estado) return { resgates: estado.resgates, origem: "sessao" };
    const versao = (conteudo as { versao?: unknown } | null)?.versao;
    if (typeof versao === "number" && versao !== VERSAO_ESQUEMA) {
      return { resgates: RESGATES_DEMO, origem: "versaoAnterior" };
    }
  } catch {
    // JSON inválido: tratado como corrompido abaixo.
  }
  return { resgates: RESGATES_DEMO, origem: "corrompido" };
}

function obterEstado(): EstadoResgates {
  if (estadoAtual === null) estadoAtual = lerSessao();
  return estadoAtual;
}

function obterEstadoServidor(): EstadoResgates {
  return ESTADO_SERVIDOR;
}

function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

function definirEstado(novo: EstadoResgates) {
  estadoAtual = novo;
  ouvintes.forEach((ouvinte) => ouvinte());
}

/** Aplica uma alteração e grava na sessão quando ela está disponível e válida. */
export function atualizarResgates(alterar: (atuais: readonly Resgate[]) => Resgate[]) {
  const atual = obterEstado();
  const resgates = alterar(atual.resgates);
  let origem = atual.origem;
  if (origem === "sessao") {
    try {
      window.sessionStorage.setItem(CHAVE_SESSAO, serializar(resgates));
    } catch {
      origem = "memoria";
    }
  }
  definirEstado({ resgates, origem });
}

/** Volta aos registros iniciais removendo apenas a chave do projeto. */
export function restaurarDemonstracao() {
  try {
    window.sessionStorage.removeItem(CHAVE_SESSAO);
    window.sessionStorage.setItem(CHAVE_SESSAO, serializar(RESGATES_DEMO));
    definirEstado({ resgates: RESGATES_DEMO, origem: "sessao" });
  } catch {
    definirEstado({ resgates: RESGATES_DEMO, origem: "memoria" });
  }
}

/**
 * Estado compartilhado por todas as telas. No servidor e na hidratação usa os
 * exemplos; depois troca para o conteúdo da sessão, sem erro de hidratação.
 */
export function useResgates(): EstadoResgates {
  return useSyncExternalStore(assinar, obterEstado, obterEstadoServidor);
}
