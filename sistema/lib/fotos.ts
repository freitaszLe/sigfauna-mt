/**
 * Fotos de exemplo dos animais, por espécie (public/fotos). São observações do iNaturalist
 * com licença CC0 1.0 (domínio público); os créditos estão em public/fotos/creditos.json.
 * Uso apenas ilustrativo nos casos fictícios; o animal da foto não é o do registro.
 */
const ARQUIVO_POR_ESPECIE: Readonly<Record<string, string>> = {
  "Arara-canindé": "arara-caninde",
  "Bugio-preto": "bugio-preto",
  "Coruja-buraqueira": "coruja-buraqueira",
  "Jacaré-do-pantanal": "jacare-do-pantanal",
  Capivara: "capivara",
  "Papagaio-verdadeiro": "papagaio-verdadeiro",
  "Jabuti-piranga": "jabuti-piranga",
  "Lobo-guará": "lobo-guara",
  "Tucano-toco": "tucano-toco",
  Jiboia: "jiboia",
  "Tamanduá-bandeira": "tamandua-bandeira",
};

export function fotoDaEspecie(especie: string): string | null {
  const arquivo = ARQUIVO_POR_ESPECIE[especie];
  return arquivo ? `/fotos/${arquivo}.jpg` : null;
}
