export const ETAPAS = [
  "Recebido",
  "Em triagem",
  "Em tratamento",
  "Em reabilitação",
  "Aguardando destinação",
  "Concluído",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export const GRUPOS = ["Ave", "Mamífero", "Réptil"] as const;

export type Grupo = (typeof GRUPOS)[number];

/** Códigos internos dos biomas de MT (catálogo em data/biomas-mt.json). */
export const BIOMAS = ["amazonia", "cerrado", "pantanal"] as const;

export type BiomaCodigo = (typeof BIOMAS)[number];

/**
 * Como o bioma do local do resgate foi identificado:
 * - simulado: atribuído aos exemplos iniciais, sem cálculo geográfico;
 * - manual: escolhido pelo usuário no cadastro;
 * - calculado: obtido da coordenada fictícia pela malha oficial (etapa 09).
 * Não indica a origem natural do animal.
 */
export const METODOS_IDENTIFICACAO_BIOMA = ["simulado", "manual", "calculado"] as const;

export type MetodoIdentificacaoBioma = (typeof METODOS_IDENTIFICACAO_BIOMA)[number];

/** Coordenada sempre fictícia (graus decimais, WGS 84). */
export type CoordenadaFicticia = {
  lat: number;
  lng: number;
};

/**
 * Tipos de evento do histórico:
 * - entrada: registro do recebimento (de = null);
 * - mudanca: avaliação da etapa com encaminhamento para outra etapa;
 * - avaliacao: avaliação registrada sem mudar de etapa (de = para).
 */
export const TIPOS_EVENTO = ["entrada", "mudanca", "avaliacao"] as const;

export type TipoEvento = (typeof TIPOS_EVENTO)[number];

export type EventoHistorico = {
  tipo: TipoEvento;
  /** Etapa de origem; null no evento de entrada. */
  de: Etapa | null;
  para: Etapa;
  /** Data e hora no formato ISO 8601 com fuso. */
  dataHora: string;
  observacao: string;
  /** Nome de quem registrou o evento. */
  operador: string;
  /** Respostas do formulário de avaliação da etapa de origem (id do campo → valor). */
  respostas?: Record<string, string>;
};

export type Resgate = {
  id: string;
  protocolo: string;
  identificacao: string;
  especie: string;
  grupo: Grupo;
  /** Bioma do local do resgate; não comprova origem natural nem autoriza soltura. */
  biomaCodigo: BiomaCodigo;
  metodoIdentificacaoBioma: MetodoIdentificacaoBioma;
  /** Vazia até as etapas 08/09. */
  coordenadaFicticia: CoordenadaFicticia | null;
  /** Data do resgate, AAAA-MM-DD. */
  dataResgate: string;
  etapa: Etapa;
  observacao: string;
  historico: EventoHistorico[];
};

export type Bioma = {
  codigo: BiomaCodigo;
  nome: string;
};

/** Versão do formato e dos dados iniciais; ao mudar, sessões antigas recebem os dados atuais. */
export const VERSAO_ESQUEMA = 4;

export type EstadoArmazenado = {
  versao: typeof VERSAO_ESQUEMA;
  resgates: Resgate[];
};
