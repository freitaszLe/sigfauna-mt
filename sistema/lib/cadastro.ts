import { BIOMAS, GRUPOS, type BiomaCodigo, type Grupo, type Resgate } from "./types";

/** Valores digitados no formulário, ainda sem validação. */
export type EntradaRecebimento = {
  protocolo: string;
  identificacao: string;
  especie: string;
  grupo: string;
  biomaCodigo: string;
  dataResgate: string;
  observacao: string;
};

export type ErrosRecebimento = Partial<Record<keyof EntradaRecebimento, string>>;

export const OPERADOR_DEMONSTRACAO = "Operador fictício (demonstração)";

export const ENTRADA_VAZIA: EntradaRecebimento = {
  protocolo: "",
  identificacao: "",
  especie: "",
  grupo: "",
  biomaCodigo: "",
  dataResgate: "",
  observacao: "",
};

/** Protocolos são comparados sem espaços nas pontas e sem diferenciar maiúsculas. */
export function normalizarProtocolo(protocolo: string): string {
  return protocolo.trim().toUpperCase();
}

export function protocoloJaExiste(protocolo: string, resgates: readonly Resgate[]): boolean {
  const alvo = normalizarProtocolo(protocolo);
  return resgates.some((resgate) => normalizarProtocolo(resgate.protocolo) === alvo);
}

function doisDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

/** Data local no formato AAAA-MM-DD. */
export function dataLocal(agora: Date): string {
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

/** Data e hora local em ISO 8601 com o fuso do navegador, como nos exemplos. */
export function dataHoraLocal(agora: Date): string {
  const deslocamento = -agora.getTimezoneOffset();
  const sinal = deslocamento >= 0 ? "+" : "-";
  const absoluto = Math.abs(deslocamento);
  const fuso = `${sinal}${doisDigitos(Math.floor(absoluto / 60))}:${doisDigitos(absoluto % 60)}`;
  return `${dataLocal(agora)}T${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}:${doisDigitos(agora.getSeconds())}${fuso}`;
}

function ehDataValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [ano, mes, dia] = valor.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
  );
}

/** Retorna os erros por campo; objeto vazio quando a entrada pode ser gravada. */
export function validarRecebimento(
  entrada: EntradaRecebimento,
  resgates: readonly Resgate[],
  hoje: string,
): ErrosRecebimento {
  const erros: ErrosRecebimento = {};

  if (!entrada.protocolo.trim()) {
    erros.protocolo = "Informe o protocolo.";
  } else if (protocoloJaExiste(entrada.protocolo, resgates)) {
    erros.protocolo = `O protocolo ${normalizarProtocolo(entrada.protocolo)} já está registrado.`;
  }

  if (!entrada.identificacao.trim()) erros.identificacao = "Informe a identificação do animal.";
  if (!entrada.especie.trim()) erros.especie = "Informe a espécie.";

  if (!entrada.grupo) {
    erros.grupo = "Selecione o grupo.";
  } else if (!GRUPOS.includes(entrada.grupo as Grupo)) {
    erros.grupo = "Grupo fora da lista do sistema.";
  }

  if (!entrada.biomaCodigo) {
    erros.biomaCodigo = "Selecione o bioma do local do resgate.";
  } else if (!BIOMAS.includes(entrada.biomaCodigo as BiomaCodigo)) {
    erros.biomaCodigo = "Bioma fora do catálogo.";
  }

  if (!entrada.dataResgate) {
    erros.dataResgate = "Informe a data do resgate.";
  } else if (!ehDataValida(entrada.dataResgate)) {
    erros.dataResgate = "Data do resgate inválida.";
  } else if (entrada.dataResgate > hoje) {
    erros.dataResgate = "A data do resgate não pode ser futura.";
  }

  return erros;
}

/** Próximo protocolo livre no padrão FS-AAAA-NNNN para o ano informado. */
export function proximoProtocolo(resgates: readonly Resgate[], ano: number): string {
  const prefixo = `FS-${ano}-`;
  const maior = resgates.reduce((atual, resgate) => {
    const protocolo = normalizarProtocolo(resgate.protocolo);
    if (!protocolo.startsWith(prefixo)) return atual;
    const numero = Number(protocolo.slice(prefixo.length));
    return Number.isInteger(numero) ? Math.max(atual, numero) : atual;
  }, 0);
  return `${prefixo}${String(maior + 1).padStart(4, "0")}`;
}

function proximoId(resgates: readonly Resgate[]): string {
  const maior = resgates.reduce((atual, resgate) => {
    const numero = Number(resgate.id.replace(/^r/, ""));
    return Number.isInteger(numero) ? Math.max(atual, numero) : atual;
  }, 0);
  return `r${String(maior + 1).padStart(3, "0")}`;
}

/** Monta o resgate a partir de uma entrada já validada. */
export function criarResgate(
  entrada: EntradaRecebimento,
  resgates: readonly Resgate[],
  agora: Date,
): Resgate {
  const observacao = entrada.observacao.trim();
  return {
    id: proximoId(resgates),
    protocolo: normalizarProtocolo(entrada.protocolo),
    identificacao: entrada.identificacao.trim(),
    especie: entrada.especie.trim(),
    grupo: entrada.grupo as Grupo,
    biomaCodigo: entrada.biomaCodigo as BiomaCodigo,
    metodoIdentificacaoBioma: "manual",
    coordenadaFicticia: null,
    dataResgate: entrada.dataResgate,
    etapa: "Recebido",
    observacao,
    historico: [
      {
        de: null,
        para: "Recebido",
        dataHora: dataHoraLocal(agora),
        observacao: observacao || "Entrada registrada no cadastro.",
        operador: OPERADOR_DEMONSTRACAO,
      },
    ],
  };
}
