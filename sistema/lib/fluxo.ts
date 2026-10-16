import { dataHoraLocal, OPERADOR_PADRAO } from "./cadastro";
import { ETAPAS, type Etapa, type Resgate } from "./types";

/** Caminhos permitidos entre etapas, conforme docs/REQUISITOS.md. */
export const TRANSICOES: Record<Etapa, readonly Etapa[]> = {
  Recebido: ["Em triagem"],
  "Em triagem": ["Em tratamento", "Em reabilitação", "Aguardando destinação"],
  "Em tratamento": ["Em reabilitação"],
  "Em reabilitação": ["Aguardando destinação"],
  "Aguardando destinação": ["Concluído"],
  Concluído: [],
};

export function destinosPermitidos(etapa: Etapa): readonly Etapa[] {
  return TRANSICOES[etapa];
}

/**
 * Encaminhamentos possíveis após uma avaliação: permanecer na etapa atual (só registra a
 * avaliação) ou seguir para um dos caminhos permitidos. Caso concluído não tem encaminhamento.
 */
export function encaminhamentosPossiveis(etapa: Etapa): readonly Etapa[] {
  return etapa === "Concluído" ? [] : [etapa, ...destinosPermitidos(etapa)];
}

export type ErrosEncaminhamento = {
  destino?: string;
  observacao?: string;
};

/** Retorna os erros do encaminhamento; objeto vazio quando ele é permitido. */
export function validarEncaminhamento(
  resgate: Resgate,
  destino: string,
  observacao: string,
): ErrosEncaminhamento {
  const erros: ErrosEncaminhamento = {};
  const possiveis = encaminhamentosPossiveis(resgate.etapa);

  if (possiveis.length === 0) {
    erros.destino = `O caso está em "${resgate.etapa}" e não tem próximas etapas.`;
  } else if (!destino) {
    erros.destino = "Selecione o encaminhamento.";
  } else if (!ETAPAS.includes(destino as Etapa)) {
    erros.destino = "Etapa desconhecida.";
  } else if (!possiveis.includes(destino as Etapa)) {
    erros.destino = `A mudança de "${resgate.etapa}" para "${destino}" não é permitida.`;
  }

  if (!observacao.trim()) erros.observacao = "Informe a observação da avaliação.";

  return erros;
}

/**
 * Aplica um encaminhamento já validado. Se o destino é a própria etapa, registra só a
 * avaliação; senão, troca a etapa. Em ambos os casos guarda as respostas do formulário.
 */
export function aplicarEncaminhamento(
  resgate: Resgate,
  destino: Etapa,
  observacao: string,
  respostas: Record<string, string>,
  agora: Date,
  operador: string = OPERADOR_PADRAO,
): Resgate {
  const permanece = destino === resgate.etapa;
  return {
    ...resgate,
    etapa: destino,
    historico: [
      ...resgate.historico,
      {
        tipo: permanece ? "avaliacao" : "mudanca",
        de: resgate.etapa,
        para: destino,
        dataHora: dataHoraLocal(agora),
        observacao: observacao.trim(),
        operador,
        respostas,
      },
    ],
  };
}

/** Data e hora do último evento do histórico (ISO 8601). */
export function ultimaMudanca(resgate: Resgate): string {
  return resgate.historico.at(-1)?.dataHora ?? resgate.dataResgate;
}
