"use client";

import type { LayerGroup, Map as MapaLeaflet } from "leaflet";
import { useEffect, useRef, useState, type RefObject } from "react";
import { carregarCamadas, CAMADAS, type DadosDasCamadas, type IdCamada } from "@/lib/camadasSema";
import { desenharCamada } from "./camadasLeaflet";

/**
 * Liga as camadas da SEMA a um mapa Leaflet já criado: lê os arquivos uma vez, desenha só as camadas
 * ligadas e devolve os dados (para o quadro geográfico) e o estado de carregamento.
 */
export function useCamadasSema(
  mapa: RefObject<MapaLeaflet | null>,
  leaflet: RefObject<typeof import("leaflet") | null>,
  versaoMapa: number,
  inicial: readonly IdCamada[],
) {
  const [ligadas, setLigadas] = useState<readonly IdCamada[]>(inicial);
  const [dados, setDados] = useState<DadosDasCamadas | null>(null);
  const grupos = useRef<Partial<Record<IdCamada, LayerGroup>>>({});

  useEffect(() => {
    let ativo = true;
    carregarCamadas().then((d) => ativo && setDados(d));
    return () => {
      ativo = false;
    };
  }, []);

  // O mapa foi recriado: descarta o que estava desenhado nele.
  useEffect(() => {
    grupos.current = {};
  }, [versaoMapa]);

  useEffect(() => {
    const L = leaflet.current;
    const instancia = mapa.current;
    if (versaoMapa === 0 || !L || !instancia || !dados) return;
    for (const id of CAMADAS) {
      const quer = ligadas.includes(id) && dados[id];
      const atual = grupos.current[id];
      if (quer && !atual) {
        const camada = desenharCamada(L, id, dados[id]!);
        camada.addTo(instancia);
        grupos.current[id] = camada as unknown as LayerGroup;
      } else if (!quer && atual) {
        atual.remove();
        delete grupos.current[id];
      }
    }
  }, [versaoMapa, ligadas, dados, mapa, leaflet]);

  return {
    ligadas,
    dados,
    carregando: dados === null,
    alternar: (id: IdCamada) =>
      setLigadas((atual) => (atual.includes(id) ? atual.filter((c) => c !== id) : [...atual, id])),
  };
}
