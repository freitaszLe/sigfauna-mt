"use client";

import "leaflet/dist/leaflet.css";
import type { GeoJSON as CamadaGeoJSON, LayerGroup, Map as MapaLeaflet, PathOptions } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { nomeDoBioma } from "@/lib/dados";
import { biomaEfetivo, LIMITE_MT, MALHA_BIOMAS, type PropriedadesBioma } from "@/lib/geo";
import type { BiomaCodigo, Resgate } from "@/lib/types";
import { COR_DO_BIOMA } from "./coresBiomas";
import styles from "./MapaBiomas.module.css";

type MapaBiomasProps = {
  contagens: Record<BiomaCodigo, number>;
  pontos: readonly Resgate[];
  selecionado: BiomaCodigo | null;
  onSelecionar: (bioma: BiomaCodigo) => void;
};

export default function MapaBiomas({
  contagens,
  pontos,
  selecionado,
  onSelecionar,
}: MapaBiomasProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  const camadaBiomas = useRef<CamadaGeoJSON | null>(null);
  const camadaPontos = useRef<LayerGroup | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const aoSelecionar = useRef(onSelecionar);
  // Muda a cada criação do mapa; a página pode ser ocultada e reexibida (cacheComponents),
  // o que destrói e recria o Leaflet sem desmontar o estado do componente.
  const [versaoMapa, setVersaoMapa] = useState(0);

  useEffect(() => {
    aoSelecionar.current = onSelecionar;
  }, [onSelecionar]);

  // Cria o mapa uma vez, só no navegador, e o destrói ao sair da página.
  useEffect(() => {
    let cancelado = false;

    import("leaflet").then((L) => {
      if (cancelado || !contenedor.current) return;
      leaflet.current = L;

      const instancia = L.map(contenedor.current, {
        zoomSnap: 0.25,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      instancia.attributionControl.setPrefix(false);
      instancia.attributionControl.addAttribution(
        "Fonte: IBGE — Biomas 1:250.000 (2025) e limite estadual",
      );

      const limite = L.geoJSON(LIMITE_MT, {
        style: { color: "#212529", weight: 2, fill: false },
        interactive: false,
      }).addTo(instancia);

      camadaBiomas.current = L.geoJSON(MALHA_BIOMAS, {
        onEachFeature: (feature, camada) => {
          const propriedades = feature.properties as PropriedadesBioma;
          camada.on("click", () => aoSelecionar.current(propriedades.codigo));
        },
      }).addTo(instancia);

      camadaPontos.current = L.layerGroup().addTo(instancia);
      instancia.fitBounds(limite.getBounds(), { padding: [8, 8] });

      mapa.current = instancia;
      setVersaoMapa((versao) => versao + 1);
    });

    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      camadaBiomas.current = null;
      camadaPontos.current = null;
    };
  }, []);

  // Atualiza cores, destaque e pontos quando filtros ou seleção mudam.
  useEffect(() => {
    const L = leaflet.current;
    if (versaoMapa === 0 || !L || !camadaBiomas.current || !camadaPontos.current) return;

    camadaBiomas.current.setStyle((feature) => {
      const codigo = (feature?.properties as PropriedadesBioma).codigo;
      const total = contagens[codigo];
      // Cor fixa por bioma; sem registros com os filtros atuais: mais clara e borda tracejada.
      const estilo: PathOptions = {
        color: codigo === selecionado ? "#212529" : total === 0 ? "#6c757d" : "#ffffff",
        weight: codigo === selecionado ? 3 : total === 0 ? 1.5 : 1,
        fillColor: COR_DO_BIOMA[codigo],
        fillOpacity: total === 0 ? 0.2 : 0.65,
        dashArray: total === 0 ? "4 4" : undefined,
      };
      return estilo;
    });
    camadaBiomas.current.eachLayer((camada) => {
      const propriedades = (camada as unknown as { feature: { properties: PropriedadesBioma } })
        .feature.properties;
      camada.unbindTooltip();
      camada.bindTooltip(`${propriedades.nome}: ${contagens[propriedades.codigo]} resgate(s)`, {
        sticky: true,
      });
    });

    camadaPontos.current.clearLayers();
    for (const resgate of pontos) {
      if (!resgate.coordenadaFicticia) continue;
      const bioma = biomaEfetivo(resgate);
      const alerta = bioma.diverge || bioma.foraDaMalha;
      L.circleMarker([resgate.coordenadaFicticia.lat, resgate.coordenadaFicticia.lng], {
        radius: alerta ? 7 : 5,
        color: alerta ? "#7a4d00" : "#ffffff",
        weight: alerta ? 2 : 1,
        fillColor: alerta ? "#ffc107" : "#1c2833",
        fillOpacity: 0.9,
      })
        .bindTooltip(
          `${resgate.protocolo} · ${resgate.especie} · ${nomeDoBioma(bioma.codigo)} (${bioma.metodo})` +
            (bioma.diverge ? ` · diverge do registrado (${nomeDoBioma(bioma.registrado)})` : "") +
            (bioma.foraDaMalha ? " · coordenada fora da malha de MT" : ""),
        )
        .addTo(camadaPontos.current);
    }
  }, [versaoMapa, contagens, pontos, selecionado]);

  return (
    <div
      ref={contenedor}
      className={styles.mapa}
      role="region"
      aria-label="Mapa dos biomas de Mato Grosso com os pontos fictícios dos resgates filtrados"
    />
  );
}
