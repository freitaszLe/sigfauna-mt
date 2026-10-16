import {
  BIOMAS,
  ETAPAS,
  GRUPOS,
  METODOS_IDENTIFICACAO_BIOMA,
  VERSAO_ESQUEMA,
  type EstadoArmazenado,
  type EventoHistorico,
  type Resgate,
} from "./types";

type Bruto = Record<string, unknown>;

function ehObjeto(valor: unknown): valor is Bruto {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function ehTexto(valor: unknown): valor is string {
  return typeof valor === "string";
}

function ehEtapa(valor: unknown): boolean {
  return ETAPAS.includes(valor as (typeof ETAPAS)[number]);
}

function ehEvento(valor: unknown): valor is EventoHistorico {
  return (
    ehObjeto(valor) &&
    (valor.de === null || ehEtapa(valor.de)) &&
    ehEtapa(valor.para) &&
    ehTexto(valor.dataHora) &&
    ehTexto(valor.observacao) &&
    ehTexto(valor.operador)
  );
}

function ehCoordenada(valor: unknown): boolean {
  return (
    valor === null ||
    (ehObjeto(valor) &&
      typeof valor.lat === "number" &&
      typeof valor.lng === "number" &&
      Number.isFinite(valor.lat) &&
      Number.isFinite(valor.lng))
  );
}

function ehResgate(valor: unknown): valor is Resgate {
  return (
    ehObjeto(valor) &&
    ehTexto(valor.id) &&
    ehTexto(valor.protocolo) &&
    ehTexto(valor.identificacao) &&
    ehTexto(valor.especie) &&
    GRUPOS.includes(valor.grupo as (typeof GRUPOS)[number]) &&
    BIOMAS.includes(valor.biomaCodigo as (typeof BIOMAS)[number]) &&
    METODOS_IDENTIFICACAO_BIOMA.includes(
      valor.metodoIdentificacaoBioma as (typeof METODOS_IDENTIFICACAO_BIOMA)[number],
    ) &&
    ehCoordenada(valor.coordenadaFicticia) &&
    ehTexto(valor.dataResgate) &&
    ehEtapa(valor.etapa) &&
    ehTexto(valor.observacao) &&
    Array.isArray(valor.historico) &&
    valor.historico.every(ehEvento)
  );
}

/** Retorna a lista se todos os itens tiverem o formato esperado; senão, null. */
export function validarResgates(valor: unknown): Resgate[] | null {
  return Array.isArray(valor) && valor.every(ehResgate) ? valor : null;
}

/** Valida o conteúdo salvo na sessão, incluindo a versão do esquema. */
export function validarEstadoArmazenado(valor: unknown): EstadoArmazenado | null {
  if (!ehObjeto(valor) || valor.versao !== VERSAO_ESQUEMA) return null;
  const resgates = validarResgates(valor.resgates);
  return resgates ? { versao: VERSAO_ESQUEMA, resgates } : null;
}
