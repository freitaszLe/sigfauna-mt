"use client";

import "leaflet/dist/leaflet.css";
import type { CircleMarker, Map as MapaLeaflet } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { biomaPorCoordenada, LIMITE_MT, MALHA_BIOMAS, type PropriedadesBioma } from "@/lib/geo";
import type { BiomaCodigo, CoordenadaFicticia } from "@/lib/types";
import { COR_DO_BIOMA } from "./coresBiomas";
import styles from "./MapaBiomas.module.css";

type MapaSelecaoPontoProps = {
  ponto: CoordenadaFicticia | null;
  /** Ponto clicado dentro de MT e o bioma calculado pela malha oficial. */
  onEscolher: (ponto: CoordenadaFicticia, bioma: BiomaCodigo) => void;
  /** Clique fora de Mato Grosso. */
  onForaDeMT: () => void;
};

/** Arredonda como nos exemplos (3 casas): a coordenada é fictícia, não precisa de precisão. */
function arredondar(valor: number): number {
  return Math.round(valor * 1000) / 1000;
}

/** Mapa do cadastro: clique para marcar o ponto fictício do resgate. */
export default function MapaSelecaoPonto({ ponto, onEscolher, onForaDeMT }: MapaSelecaoPontoProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  const marcador = useRef<CircleMarker | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const aoEscolher = useRef(onEscolher);
  const aoSairDeMT = useRef(onForaDeMT);
  const [versaoMapa, setVersaoMapa] = useState(0);

  useEffect(() => {
    aoEscolher.current = onEscolher;
    aoSairDeMT.current = onForaDeMT;
  }, [onEscolher, onForaDeMT]);

  // Cria o mapa só no navegador e o destrói ao sair da página.
  useEffect(() => {
    let cancelado = false;
    let observador: ResizeObserver | null = null;

    import("leaflet").then((L) => {
      if (cancelado || !contenedor.current) return;
      leaflet.current = L;

      const instancia = L.map(contenedor.current, {
        zoomSnap: 0.25,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      });
      instancia.attributionControl.setPrefix(false);
      instancia.attributionControl.addAttribution("Fonte: IBGE — Biomas 1:250.000 (2025)");

      const limite = L.geoJSON(LIMITE_MT, {
        style: { color: "#212529", weight: 2, fill: false },
        interactive: false,
      }).addTo(instancia);

      // Biomas só como fundo; o clique vai para o mapa.
      L.geoJSON(MALHA_BIOMAS, {
        interactive: false,
        style: (feature) => ({
          color: "#ffffff",
          weight: 1,
          fillColor: COR_DO_BIOMA[(feature?.properties as PropriedadesBioma).codigo],
          fillOpacity: 0.55,
        }),
      }).addTo(instancia);

      instancia.fitBounds(limite.getBounds(), { padding: [8, 8] });
      instancia.on("click", (evento) => {
        const lat = arredondar(evento.latlng.lat);
        const lng = arredondar(evento.latlng.lng);
        const bioma = biomaPorCoordenada(lat, lng);
        if (bioma) aoEscolher.current({ lat, lng }, bioma);
        else aoSairDeMT.current();
      });

      mapa.current = instancia;
      setVersaoMapa((versao) => versao + 1);
      observador = new ResizeObserver(() => instancia.invalidateSize());
      observador.observe(contenedor.current);
    });

    return () => {
      cancelado = true;
      observador?.disconnect();
      mapa.current?.remove();
      mapa.current = null;
      marcador.current = null;
    };
  }, []);

  // Mostra o ponto escolhido (ou nenhum).
  useEffect(() => {
    const L = leaflet.current;
    if (versaoMapa === 0 || !L || !mapa.current) return;
    marcador.current?.remove();
    marcador.current = ponto
      ? L.circleMarker([ponto.lat, ponto.lng], {
          radius: 8,
          color: "#ffffff",
          weight: 2,
          fillColor: "#1c2833",
          fillOpacity: 0.95,
          interactive: false,
        }).addTo(mapa.current)
      : null;
  }, [versaoMapa, ponto]);

  return (
    <div
      ref={contenedor}
      className={`${styles.mapa} ${styles.mapaCadastro}`}
      role="region"
      aria-label="Mapa para marcar o ponto fictício do resgate"
      data-ponto={ponto ? `${ponto.lat},${ponto.lng}` : ""}
    />
  );
}
