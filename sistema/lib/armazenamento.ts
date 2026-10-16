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
 * - memoria: sessionStorage indisponível; a recarga perde as alterações.
 */
export type OrigemDados = "inicial" | "sessao" | "memoria";

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

/** Grava os dados iniciais na sessão (ou mantém em memória se o armazenamento falhar). */
function gravarDadosIniciais(): EstadoResgates {
  try {
    window.sessionStorage.setItem(CHAVE_SESSAO, serializar(RESGATES_DEMO));
    return { resgates: RESGATES_DEMO, origem: "sessao" };
  } catch {
    return { resgates: RESGATES_DEMO, origem: "memoria" };
  }
}

/**
 * Ao recarregar, a aba continua com os dados da sessão. Os dados iniciais são gravados
 * quando a aba ainda não tem nada salvo, quando o conteúdo salvo é de outra versão dos
 * dados ou quando está em formato inválido.
 */
function lerSessao(): EstadoResgates {
  let bruto: string | null;
  try {
    bruto = window.sessionStorage.getItem(CHAVE_SESSAO);
  } catch {
    return { resgates: RESGATES_DEMO, origem: "memoria" };
  }

  if (bruto !== null) {
    try {
      const estado = validarEstadoArmazenado(JSON.parse(bruto));
      if (estado) return { resgates: estado.resgates, origem: "sessao" };
    } catch {
      // JSON inválido: substituído pelos dados iniciais abaixo.
    }
  }
  return gravarDadosIniciais();
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

/** Aplica uma alteração e grava na sessão quando ela está disponível. */
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

/**
 * Estado compartilhado por todas as telas. No servidor e na hidratação usa os
 * exemplos; depois troca para o conteúdo da sessão, sem erro de hidratação.
 */
export function useResgates(): EstadoResgates {
  return useSyncExternalStore(assinar, obterEstado, obterEstadoServidor);
}
