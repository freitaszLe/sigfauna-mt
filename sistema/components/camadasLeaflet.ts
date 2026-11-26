import type { GeoJSON as CamadaGeoJSON, PathOptions } from "leaflet";
import {
  ESTILO_DA_CAMADA,
  ESTILO_DO_GRUPO,
  grupoDeProtecao,
  ROTULO_DA_CAMADA,
  ROTULO_DO_GRUPO,
  type Camada,
  type IdCamada,
  type PropriedadesCamada,
} from "@/lib/camadasSema";

function estiloDaFeicao(id: IdCamada, propriedades: PropriedadesCamada | undefined): PathOptions {
  const base =
    id === "UNIDADES_DE_CONSERVACAO"
      ? ESTILO_DO_GRUPO[grupoDeProtecao(propriedades?.categoria)]
      : ESTILO_DA_CAMADA[id];
  return {
    color: base.cor,
    weight: base.largura,
    fillColor: base.cor,
    fillOpacity: base.preenchimento,
    dashArray: "tracejado" in base ? base.tracejado : undefined,
  };
}

/** Desenha uma camada da SEMA com o estilo dela e a dica (nome, categoria e grupo) ao passar o mouse. */
export function desenharCamada(
  L: typeof import("leaflet"),
  id: IdCamada,
  dados: Camada,
): CamadaGeoJSON {
  return L.geoJSON(dados, {
    style: (feicao) => estiloDaFeicao(id, feicao?.properties as PropriedadesCamada),
    onEachFeature: (feicao, camada) => {
      const p = feicao.properties as PropriedadesCamada;
      const partes = [`<strong>${escapar(p.nome ?? "Sem nome")}</strong>`];
      if (id === "UNIDADES_DE_CONSERVACAO") {
        if (p.categoria) partes.push(escapar(p.categoria));
        partes.push(ROTULO_DO_GRUPO[grupoDeProtecao(p.categoria)]);
      } else {
        partes.push(ROTULO_DA_CAMADA[id].replace(/s$/, ""));
      }
      camada.bindTooltip(partes.join("<br>"), { sticky: true });
    },
  });
}

function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
