import { dataHoraLocal, OPERADOR_DEMONSTRACAO } from "./cadastro";
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

export type ErrosTransicao = {
  destino?: string;
  observacao?: string;
};

/** Retorna os erros da mudança; objeto vazio quando ela é permitida. */
export function validarTransicao(
  resgate: Resgate,
  destino: string,
  observacao: string,
): ErrosTransicao {
  const erros: ErrosTransicao = {};
  const permitidos = destinosPermitidos(resgate.etapa);

  if (permitidos.length === 0) {
    erros.destino = `O caso está em "${resgate.etapa}" e não tem próximas etapas.`;
  } else if (!destino) {
    erros.destino = "Selecione a próxima etapa.";
  } else if (!ETAPAS.includes(destino as Etapa)) {
    erros.destino = "Etapa desconhecida.";
  } else if (!permitidos.includes(destino as Etapa)) {
    erros.destino = `A mudança de "${resgate.etapa}" para "${destino}" não é permitida.`;
  }

  if (!observacao.trim()) erros.observacao = "Informe a observação da mudança.";

  return erros;
}

/** Aplica uma mudança já validada: troca a etapa e acrescenta um evento ao histórico. */
export function aplicarTransicao(
  resgate: Resgate,
  destino: Etapa,
  observacao: string,
  agora: Date,
): Resgate {
  return {
    ...resgate,
    etapa: destino,
    historico: [
      ...resgate.historico,
      {
        de: resgate.etapa,
        para: destino,
        dataHora: dataHoraLocal(agora),
        observacao: observacao.trim(),
        operador: OPERADOR_DEMONSTRACAO,
      },
    ],
  };
}

/** Data e hora do último evento do histórico (ISO 8601). */
export function ultimaMudanca(resgate: Resgate): string {
  return resgate.historico.at(-1)?.dataHora ?? resgate.dataResgate;
}
