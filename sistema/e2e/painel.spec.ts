import { expect, test, type Page } from "@playwright/test";
import { abrirComUsuario, arquivoDePrint } from "./apoio";

// Totais conhecidos de data/resgates-demo.json (30 resgates fictícios).
const INDICADORES = {
  "Total de resgates": 30,
  "Casos ativos": 25,
  "Em tratamento ou reabilitação": 11,
  Concluídos: 5,
};

async function linhasDoGrafico(page: Page, titulo: string) {
  const itens = page.getByRole("list", { name: titulo }).getByRole("listitem");
  return (await itens.allInnerTexts()).map((texto) => texto.replace(/\s+/g, " ").trim());
}

test("painel mostra os totais da amostra conhecida", async ({ page }) => {
  await abrirComUsuario(page, "/");
  await expect(page.getByRole("heading", { name: "Indicadores" })).toBeVisible();

  for (const [rotulo, valor] of Object.entries(INDICADORES)) {
    const cartao = page.getByText(rotulo, { exact: true }).locator("..");
    await expect(cartao).toContainText(String(valor));
  }

  expect(await linhasDoGrafico(page, "Resgates por bioma")).toEqual(
    expect.arrayContaining(["Amazônia 12", "Cerrado 12", "Pantanal 6"]),
  );
  expect(await linhasDoGrafico(page, "Resgates por grupo")).toEqual(
    expect.arrayContaining(["Ave 11", "Mamífero 11", "Réptil 8"]),
  );

  await page.screenshot({ path: arquivoDePrint("print-1-painel"), fullPage: true });
});
