import type { FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import malhaBiomas from "@/data/geo/biomas-mt.geo.json";
import limiteMt from "@/data/geo/limite-mt.geo.json";
import { BIOMAS, type BiomaCodigo, type MetodoIdentificacaoBioma, type Resgate } from "./types";

export type PropriedadesBioma = {
  codigo: BiomaCodigo;
  nome: string;
  cdBiomaIbge: number;
  areaKm2: number;
};

type Geometria = Polygon | MultiPolygon;

/** Malha oficial dos biomas de MT (IBGE, etapa 08). */
export const MALHA_BIOMAS = malhaBiomas as unknown as FeatureCollection<
  Geometria,
  PropriedadesBioma
>;

/** Limite de MT obtido pela dissolução dos três biomas. */
export const LIMITE_MT = limiteMt as unknown as FeatureCollection<Geometria>;

if (
  MALHA_BIOMAS.features.length !== BIOMAS.length ||
  !MALHA_BIOMAS.features.every((feature) => BIOMAS.includes(feature.properties.codigo))
) {
  throw new Error("data/geo/biomas-mt.geo.json não corresponde aos códigos de bioma do sistema.");
}

/** Teste de ponto em anel pelo método do raio (coordenadas [lng, lat]). */
function dentroDoAnel(lng: number, lat: number, anel: Position[]): boolean {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i];
    const [xj, yj] = anel[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      dentro = !dentro;
    }
  }
  return dentro;
}

function dentroDaGeometria(lng: number, lat: number, geometria: Geometria): boolean {
  const poligonos = geometria.type === "MultiPolygon" ? geometria.coordinates : [geometria.coordinates];
  return poligonos.some(
    ([externo, ...buracos]) =>
      dentroDoAnel(lng, lat, externo) && !buracos.some((buraco) => dentroDoAnel(lng, lat, buraco)),
  );
}

/** Bioma oficial que contém a coordenada; null se estiver fora de MT. */
export function biomaPorCoordenada(lat: number, lng: number): BiomaCodigo | null {
  const encontrado = MALHA_BIOMAS.features.find((feature) =>
    dentroDaGeometria(lng, lat, feature.geometry),
  );
  return encontrado ? encontrado.properties.codigo : null;
}

export type BiomaEfetivo = {
  /** Bioma usado em painel, lista, filtros e mapa. */
  codigo: BiomaCodigo;
  metodo: MetodoIdentificacaoBioma;
  /** Bioma gravado no registro (simulado ou manual). */
  registrado: BiomaCodigo;
  /** Bioma obtido pela coordenada; null sem coordenada ou fora da malha. */
  calculado: BiomaCodigo | null;
  /** Coordenada existe, mas não cai em nenhum bioma de MT. */
  foraDaMalha: boolean;
  /** Bioma calculado diferente do registrado. */
  diverge: boolean;
};

const cache = new WeakMap<Resgate, BiomaEfetivo>();

/**
 * Com coordenada fictícia, o bioma calculado pela malha oficial prevalece (REQUISITOS.md).
 * Sem coordenada, ou com coordenada fora da malha, vale o bioma registrado; nada é
 * associado silenciosamente a outro bioma. Os dados gravados não são alterados.
 */
export function biomaEfetivo(resgate: Resgate): BiomaEfetivo {
  const guardado = cache.get(resgate);
  if (guardado) return guardado;

  const registrado = resgate.biomaCodigo;
  let resultado: BiomaEfetivo;

  if (!resgate.coordenadaFicticia) {
    resultado = {
      codigo: registrado,
      metodo: resgate.metodoIdentificacaoBioma,
      registrado,
      calculado: null,
      foraDaMalha: false,
      diverge: false,
    };
  } else {
    const { lat, lng } = resgate.coordenadaFicticia;
    const calculado = biomaPorCoordenada(lat, lng);
    resultado = calculado
      ? {
          codigo: calculado,
          metodo: "calculado",
          registrado,
          calculado,
          foraDaMalha: false,
          diverge: calculado !== registrado,
        }
      : {
          codigo: registrado,
          metodo: resgate.metodoIdentificacaoBioma,
          registrado,
          calculado: null,
          foraDaMalha: true,
          diverge: false,
        };
  }

  cache.set(resgate, resultado);
  return resultado;
}
