import catalogoBiomas from "@/data/biomas-mt.json";
import demo from "@/data/resgates-demo.json";
import { BIOMAS, type Bioma, type BiomaCodigo, type Resgate } from "./types";
import { validarResgates } from "./validacao";

const resgatesValidados = validarResgates(demo);

if (!resgatesValidados) {
  throw new Error("data/resgates-demo.json não segue o formato de Resgate.");
}

/** Registros fictícios iniciais da demonstração. */
export const RESGATES_DEMO: readonly Resgate[] = resgatesValidados;

const biomasDoCatalogo = catalogoBiomas.biomas.filter((item): item is Bioma =>
  BIOMAS.includes(item.codigo as BiomaCodigo),
);

if (biomasDoCatalogo.length !== BIOMAS.length) {
  throw new Error("data/biomas-mt.json não corresponde aos códigos de bioma do sistema.");
}

/** Catálogo de biomas de MT verificado em fonte oficial (IBGE). */
export const CATALOGO_BIOMAS: readonly Bioma[] = biomasDoCatalogo;

export const FONTE_BIOMAS = {
  fonte: catalogoBiomas.fonte,
  url: catalogoBiomas.url,
  consultadoEm: catalogoBiomas.consultadoEm,
};

export function nomeDoBioma(codigo: BiomaCodigo): string {
  return CATALOGO_BIOMAS.find((item) => item.codigo === codigo)?.nome ?? codigo;
}
