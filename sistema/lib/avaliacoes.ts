import type { Etapa, EventoHistorico, Resgate } from "./types";

/**
 * Formulários de avaliação por etapa. As respostas são registros e observações da equipe;
 * a regra só SUGERE o encaminhamento, que a pessoa confirma (não é decisão clínica automática).
 */

export type Campo =
  | { id: string; rotulo: string; tipo: "escolha"; opcoes: readonly string[] }
  | { id: string; rotulo: string; tipo: "numero"; unidade: string }
  | { id: string; rotulo: string; tipo: "texto"; dica?: string };

export type Formulario = {
  etapa: Etapa;
  aba: string;
  titulo: string;
  campos: readonly Campo[];
  /** Etapa sugerida pelas respostas; a própria etapa significa "permanece". */
  sugerir: (respostas: Record<string, string>) => Etapa;
};

const SIM_NAO = ["Sim", "Não"] as const;

export const FORMULARIOS: readonly Formulario[] = [
  {
    etapa: "Recebido",
    aba: "Entrada",
    titulo: "Conferência de entrada",
    campos: [
      { id: "peso", rotulo: "Peso", tipo: "numero", unidade: "kg" },
      { id: "condicao", rotulo: "Condição corporal", tipo: "escolha", opcoes: ["Boa", "Regular", "Ruim"] },
      { id: "ferimentos", rotulo: "Ferimentos visíveis?", tipo: "escolha", opcoes: SIM_NAO },
      { id: "comportamento", rotulo: "Comportamento", tipo: "escolha", opcoes: ["Alerta", "Apático", "Agitado"] },
    ],
    sugerir: () => "Em triagem",
  },
  {
    etapa: "Em triagem",
    aba: "Triagem",
    titulo: "Avaliação de triagem",
    campos: [
      { id: "cuidados", rotulo: "Necessita cuidados veterinários?", tipo: "escolha", opcoes: SIM_NAO },
      { id: "condicionamento", rotulo: "Necessita condicionamento ou reabilitação?", tipo: "escolha", opcoes: SIM_NAO },
    ],
    sugerir: (r) =>
      r.cuidados === "Sim"
        ? "Em tratamento"
        : r.condicionamento === "Sim"
          ? "Em reabilitação"
          : "Aguardando destinação",
  },
  {
    etapa: "Em tratamento",
    aba: "Tratamento",
    titulo: "Evolução do tratamento",
    campos: [
      { id: "procedimento", rotulo: "Procedimento registrado", tipo: "texto", dica: "Ex.: curativo, imobilização" },
      { id: "evolucao", rotulo: "Evolução", tipo: "escolha", opcoes: ["Melhora", "Estável", "Piora"] },
      { id: "alta", rotulo: "Alta do tratamento?", tipo: "escolha", opcoes: SIM_NAO },
    ],
    sugerir: (r) => (r.alta === "Sim" ? "Em reabilitação" : "Em tratamento"),
  },
  {
    etapa: "Em reabilitação",
    aba: "Reabilitação",
    titulo: "Avaliação de reabilitação",
    campos: [
      { id: "locomocao", rotulo: "Locomoção ou voo", tipo: "escolha", opcoes: ["Adequado", "Parcial", "Inadequado"] },
      { id: "alimentacao", rotulo: "Alimentação autônoma?", tipo: "escolha", opcoes: SIM_NAO },
      { id: "apto", rotulo: "Apto à destinação?", tipo: "escolha", opcoes: SIM_NAO },
    ],
    sugerir: (r) => (r.apto === "Sim" ? "Aguardando destinação" : "Em reabilitação"),
  },
  {
    etapa: "Aguardando destinação",
    aba: "Destinação",
    titulo: "Registro da destinação",
    campos: [
      {
        id: "destinacao",
        rotulo: "Destinação registrada",
        tipo: "escolha",
        opcoes: ["Soltura", "Transferência", "Permanência em cativeiro", "Óbito"],
      },
      { id: "documento", rotulo: "Documento de referência", tipo: "texto", dica: "Ex.: Termo nº 2026/031" },
    ],
    sugerir: () => "Concluído",
  },
];

export function formularioDaEtapa(etapa: Etapa): Formulario | undefined {
  return FORMULARIOS.find((formulario) => formulario.etapa === etapa);
}

/** Etapa avaliada em um evento: a origem de uma mudança ou a etapa de uma avaliação. */
export function etapaAvaliada(evento: EventoHistorico): Etapa | null {
  if (evento.tipo === "entrada") return null;
  return evento.tipo === "avaliacao" ? evento.para : evento.de;
}

/** Eventos de avaliação feitos durante a etapa informada, em ordem cronológica. */
export function avaliacoesDaEtapa(resgate: Resgate, etapa: Etapa): EventoHistorico[] {
  return resgate.historico.filter((evento) => etapaAvaliada(evento) === etapa);
}

/** Erros por campo; objeto vazio quando todas as respostas são válidas. */
export function validarRespostas(
  formulario: Formulario,
  respostas: Record<string, string>,
): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const campo of formulario.campos) {
    const valor = (respostas[campo.id] ?? "").trim();
    if (!valor) {
      erros[campo.id] = `Informe: ${campo.rotulo.replace(/\?$/, "")}.`;
    } else if (campo.tipo === "escolha" && !campo.opcoes.includes(valor)) {
      erros[campo.id] = "Opção fora da lista.";
    } else if (campo.tipo === "numero") {
      const numero = Number(valor.replace(",", "."));
      if (!Number.isFinite(numero) || numero <= 0) erros[campo.id] = "Informe um número maior que zero.";
    }
  }
  return erros;
}

/** Texto de exibição de uma resposta (com unidade, quando houver). */
export function textoResposta(campo: Campo, valor: string | undefined): string {
  if (!valor) return "—";
  return campo.tipo === "numero" ? `${valor.replace(".", ",")} ${campo.unidade}` : valor;
}
