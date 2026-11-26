import type { FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";

/**
 * Camadas oficiais da SEMA-MT (unidades de conservação, zonas de amortecimento e terras indígenas),
 * servidas como arquivos estáticos em /geo/sema. É só informação de apoio: unidade de conservação é
 * um limite legal, e não uma cerca; o mapa informa e a decisão é da equipe técnica.
 */
export type IdCamada = "UNIDADES_DE_CONSERVACAO" | "ZONAS_DE_AMORTECIMENTO" | "TERRAS_INDIGENAS";

export const CAMADAS: readonly IdCamada[] = [
  "UNIDADES_DE_CONSERVACAO",
  "ZONAS_DE_AMORTECIMENTO",
  "TERRAS_INDIGENAS",
];

export const ROTULO_DA_CAMADA: Readonly<Record<IdCamada, string>> = {
  UNIDADES_DE_CONSERVACAO: "Unidades de conservação",
  ZONAS_DE_AMORTECIMENTO: "Zonas de amortecimento",
  TERRAS_INDIGENAS: "Terras indígenas",
};

const ARQUIVO: Readonly<Record<IdCamada, string>> = {
  UNIDADES_DE_CONSERVACAO: "/geo/sema/unidades-de-conservacao.geo.json",
  ZONAS_DE_AMORTECIMENTO: "/geo/sema/zonas-de-amortecimento.geo.json",
  TERRAS_INDIGENAS: "/geo/sema/terras-indigenas.geo.json",
};

export type GrupoDeProtecao = "integral" | "sustentavel" | "outras";

const PROTECAO_INTEGRAL = new Set(["REBIO", "ESEC", "PARQUE", "MONAT", "REVIS"]);
const USO_SUSTENTAVEL = new Set(["APA", "ARIE", "RESEX", "RPPN", "FLONA", "RDS"]);

/** Agrupamento do SNUC pela sigla; sigla ambígua (PE, EP, RESEC) fica em "outras" até a SEMA confirmar. */
export function grupoDeProtecao(categoria: unknown): GrupoDeProtecao {
  const sigla = String(categoria ?? "").trim().toUpperCase();
  if (PROTECAO_INTEGRAL.has(sigla)) return "integral";
  return USO_SUSTENTAVEL.has(sigla) ? "sustentavel" : "outras";
}

export const ROTULO_DO_GRUPO: Readonly<Record<GrupoDeProtecao, string>> = {
  integral: "Proteção integral",
  sustentavel: "Uso sustentável",
  outras: "Outras categorias",
};

export const GRUPOS: readonly GrupoDeProtecao[] = ["integral", "sustentavel", "outras"];

export type Estilo = { cor: string; preenchimento: number; largura: number; tracejado?: string };

export const ESTILO_DO_GRUPO: Readonly<Record<GrupoDeProtecao, Estilo>> = {
  integral: { cor: "#5b21b6", preenchimento: 0.34, largura: 2.4 },
  sustentavel: { cor: "#a78bfa", preenchimento: 0.16, largura: 1.6 },
  outras: { cor: "#6b7280", preenchimento: 0.14, largura: 1.6 },
};

export const ESTILO_DA_CAMADA: Readonly<Record<Exclude<IdCamada, "UNIDADES_DE_CONSERVACAO">, Estilo>> = {
  ZONAS_DE_AMORTECIMENTO: { cor: "#c026d3", preenchimento: 0.05, largura: 1.6, tracejado: "7 5" },
  TERRAS_INDIGENAS: { cor: "#e11d48", preenchimento: 0.12, largura: 2 },
};

export type PropriedadesCamada = { nome?: string; categoria?: string };
export type Camada = FeatureCollection<Geometry, PropriedadesCamada>;
export type DadosDasCamadas = Partial<Record<IdCamada, Camada>>;

let promessa: Promise<DadosDasCamadas> | null = null;

/** Lê as três camadas uma vez só e guarda; camada que falhar fica de fora (o mapa continua). */
export function carregarCamadas(): Promise<DadosDasCamadas> {
  promessa ??= Promise.all(
    CAMADAS.map(async (id) => {
      try {
        const resposta = await fetch(ARQUIVO[id]);
        return resposta.ok ? ([id, (await resposta.json()) as Camada] as const) : null;
      } catch {
        return null;
      }
    }),
  ).then((itens) => Object.fromEntries(itens.filter((i) => i !== null)) as DadosDasCamadas);
  return promessa;
}

// ---- Contexto de um ponto (calculado na tela, não gravado) ----

type Poligonos = Position[][][];

function poligonosDe(geometria: Geometry): Poligonos {
  if (geometria.type === "Polygon") return [(geometria as Polygon).coordinates];
  if (geometria.type === "MultiPolygon") return (geometria as MultiPolygon).coordinates;
  return [];
}

function dentroDoAnel(lng: number, lat: number, anel: Position[]): boolean {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i];
    const [xj, yj] = anel[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

function contem(lng: number, lat: number, poligonos: Poligonos): boolean {
  return poligonos.some(
    ([externo, ...buracos]) =>
      dentroDoAnel(lng, lat, externo) && !buracos.some((b) => dentroDoAnel(lng, lat, b)),
  );
}

/** Distância em linha reta (haversine), em km. */
export function distanciaKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const h =
    Math.sin(rad(bLat - aLat) / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distância aproximada até a borda: o vértice mais próximo (os polígonos têm vértices densos). */
function distanciaAteABorda(lat: number, lng: number, poligonos: Poligonos): number {
  let menor = Infinity;
  for (const [externo] of poligonos) {
    for (const [x, y] of externo) {
      const d = distanciaKm(lat, lng, y, x);
      if (d < menor) menor = d;
    }
  }
  return menor;
}

export type AreaDoPonto = { nome: string; categoria: string; grupo: GrupoDeProtecao | null };
export type ResultadoDaCamada = {
  dentro: AreaDoPonto[];
  maisProxima: (AreaDoPonto & { km: number }) | null;
};
export type ContextoDoPonto = Partial<Record<IdCamada, ResultadoDaCamada>>;

export function calcularContexto(lat: number, lng: number, dados: DadosDasCamadas): ContextoDoPonto {
  const contexto: ContextoDoPonto = {};
  for (const id of CAMADAS) {
    const camada = dados[id];
    if (!camada) continue;
    const dentro: AreaDoPonto[] = [];
    let perto: (AreaDoPonto & { km: number }) | null = null;
    for (const feicao of camada.features) {
      const poligonos = poligonosDe(feicao.geometry);
      const categoria = String(feicao.properties?.categoria ?? "").trim();
      const area: AreaDoPonto = {
        nome: String(feicao.properties?.nome ?? "").trim() || "Sem nome",
        categoria,
        grupo: id === "UNIDADES_DE_CONSERVACAO" ? grupoDeProtecao(categoria) : null,
      };
      if (contem(lng, lat, poligonos)) {
        if (!dentro.some((a) => a.nome === area.nome)) dentro.push(area);
        continue;
      }
      const km = distanciaAteABorda(lat, lng, poligonos);
      if (!perto || km < perto.km) perto = { ...area, km };
    }
    contexto[id] = { dentro, maisProxima: dentro.length > 0 ? null : perto };
  }
  return contexto;
}

export function formatarKm(km: number): string {
  if (km < 1) return "menos de 1 km";
  return `${km.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}
