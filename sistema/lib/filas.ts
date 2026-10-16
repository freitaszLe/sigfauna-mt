import { formatarData } from "./agregacoes";
import { avaliacoesDaEtapa, formularioDaEtapa, textoResposta } from "./avaliacoes";
import { nomeDoBioma } from "./dados";
import { biomaEfetivo } from "./geo";
import type { Etapa, Resgate } from "./types";

/**
 * Filas do Acompanhamento: uma página por etapa (submenu), com colunas próprias tiradas
 * das avaliações já registradas. Só leitura; não altera os registros.
 */

export type ColunaFila = { titulo: string; valor: (resgate: Resgate) => string };

export type Fila = {
  slug: string;
  etapa: Etapa;
  /** Nome no submenu e no título da página. */
  nome: string;
  descricao: string;
  colunas: readonly ColunaFila[];
  /** Título da coluna de data em que o caso entrou na etapa. */
  tituloDesde: string;
};

/** Resposta mais recente de um campo do formulário da etapa, já formatada. */
export function respostaDaEtapa(resgate: Resgate, etapa: Etapa, campoId: string): string {
  const campo = formularioDaEtapa(etapa)?.campos.find((item) => item.id === campoId);
  const comRespostas = avaliacoesDaEtapa(resgate, etapa).filter((evento) => evento.respostas);
  const valor = comRespostas.at(-1)?.respostas?.[campoId];
  return campo ? textoResposta(campo, valor) : "—";
}

/** Data e hora em que o caso entrou na etapa atual (último evento que levou até ela). */
export function entradaNaEtapa(resgate: Resgate): string {
  const evento = resgate.historico.findLast(
    (item) => item.tipo !== "avaliacao" && item.para === resgate.etapa,
  );
  return evento?.dataHora ?? resgate.dataResgate;
}

function contarAvaliacoes(resgate: Resgate, etapa: Etapa): string {
  const total = avaliacoesDaEtapa(resgate, etapa).length;
  return total === 0 ? "Nenhuma" : String(total);
}

function etapaAnterior(resgate: Resgate): string {
  const evento = resgate.historico.findLast(
    (item) => item.tipo === "mudanca" && item.para === resgate.etapa,
  );
  return evento?.de ?? "—";
}

export const FILAS: readonly Fila[] = [
  {
    slug: "recebido",
    etapa: "Recebido",
    nome: "Recebido",
    descricao: "Animais que chegaram e aguardam a conferência de entrada.",
    tituloDesde: "Entrada em",
    colunas: [
      { titulo: "Bioma do local", valor: (r) => nomeDoBioma(biomaEfetivo(r).codigo) },
      { titulo: "Data do resgate", valor: (r) => formatarData(r.dataResgate) },
    ],
  },
  {
    slug: "triagem",
    etapa: "Em triagem",
    nome: "Em triagem",
    descricao: "Casos com a conferência de entrada feita, aguardando a avaliação de triagem.",
    tituloDesde: "Na triagem desde",
    colunas: [
      { titulo: "Peso", valor: (r) => respostaDaEtapa(r, "Recebido", "peso") },
      { titulo: "Condição corporal", valor: (r) => respostaDaEtapa(r, "Recebido", "condicao") },
      { titulo: "Ferimentos", valor: (r) => respostaDaEtapa(r, "Recebido", "ferimentos") },
      { titulo: "Comportamento", valor: (r) => respostaDaEtapa(r, "Recebido", "comportamento") },
    ],
  },
  {
    slug: "tratamento",
    etapa: "Em tratamento",
    nome: "Em tratamento",
    descricao: "Casos em tratamento, com a evolução registrada em cada avaliação.",
    tituloDesde: "No tratamento desde",
    colunas: [
      { titulo: "Avaliações", valor: (r) => contarAvaliacoes(r, "Em tratamento") },
      { titulo: "Último procedimento", valor: (r) => respostaDaEtapa(r, "Em tratamento", "procedimento") },
      { titulo: "Evolução", valor: (r) => respostaDaEtapa(r, "Em tratamento", "evolucao") },
    ],
  },
  {
    slug: "reabilitacao",
    etapa: "Em reabilitação",
    nome: "Em reabilitação",
    descricao: "Casos em reabilitação até ficarem aptos à destinação.",
    tituloDesde: "Na reabilitação desde",
    colunas: [
      { titulo: "Avaliações", valor: (r) => contarAvaliacoes(r, "Em reabilitação") },
      { titulo: "Locomoção ou voo", valor: (r) => respostaDaEtapa(r, "Em reabilitação", "locomocao") },
      { titulo: "Alimentação autônoma", valor: (r) => respostaDaEtapa(r, "Em reabilitação", "alimentacao") },
    ],
  },
  {
    slug: "destinacao",
    etapa: "Aguardando destinação",
    nome: "Aguardando destinação",
    descricao: "Casos aptos que aguardam o registro da destinação.",
    tituloDesde: "Aguardando desde",
    colunas: [
      { titulo: "Veio de", valor: etapaAnterior },
      { titulo: "Locomoção ou voo", valor: (r) => respostaDaEtapa(r, "Em reabilitação", "locomocao") },
      { titulo: "Apto à destinação", valor: (r) => respostaDaEtapa(r, "Em reabilitação", "apto") },
    ],
  },
  {
    slug: "concluidos",
    etapa: "Concluído",
    nome: "Concluídos",
    descricao: "Casos encerrados, com a destinação e o documento registrados.",
    tituloDesde: "Concluído em",
    colunas: [
      { titulo: "Destinação", valor: (r) => respostaDaEtapa(r, "Aguardando destinação", "destinacao") },
      { titulo: "Documento", valor: (r) => respostaDaEtapa(r, "Aguardando destinação", "documento") },
    ],
  },
];

export function filaPorSlug(slug: string): Fila | undefined {
  return FILAS.find((fila) => fila.slug === slug);
}

/** Fila de espera: quem está há mais tempo na etapa vem primeiro; concluídos, do mais recente. */
export function casosDaFila(resgates: readonly Resgate[], fila: Fila): Resgate[] {
  const casos = resgates.filter((resgate) => resgate.etapa === fila.etapa);
  const ordem = fila.etapa === "Concluído" ? -1 : 1;
  return casos.sort((a, b) => ordem * entradaNaEtapa(a).localeCompare(entradaNaEtapa(b)));
}
