import { expect, test, type Page } from "@playwright/test";
import { abrirComUsuario, arquivoDePrint } from "./apoio";

const contador = (page: Page) => page.getByText(/resgates no mapa e na tabela$/);
const legenda = (page: Page, bioma: string) =>
  page.getByRole("complementary", { name: "Legenda e resumo do bioma" }).getByRole("button", { name: new RegExp(`^${bioma}`) });
const resumo = (page: Page) => page.getByRole("complementary").locator("[aria-live=polite]");

async function abrirMapa(page: Page) {
  await abrirComUsuario(page, "/distribuicao");
  await expect(page.getByRole("region", { name: /Mapa dos biomas/ })).toBeVisible();
  await expect(page.locator(".leaflet-overlay-pane path").first()).toBeVisible();
}

test.describe("Mapa por bioma", () => {
  test("legenda e contador sem filtros", async ({ page }) => {
    await abrirMapa(page);
    await expect(contador(page)).toHaveText("30 de 30 resgates no mapa e na tabela");
    await expect(legenda(page, "Amazônia")).toContainText("12");
    await expect(legenda(page, "Cerrado")).toContainText("12");
    await expect(legenda(page, "Pantanal")).toContainText("6");
  });

  test("bioma selecionado mostra total e ranking de espécies", async ({ page }) => {
    await abrirMapa(page);
    await legenda(page, "Cerrado").click();
    await expect(legenda(page, "Cerrado")).toHaveAttribute("aria-pressed", "true");
    await expect(resumo(page)).toContainText("Cerrado: 12 resgate(s) com os filtros atuais");
    await expect(resumo(page).getByRole("listitem")).toHaveCount(8);
    await expect(resumo(page)).toContainText("Lobo-guará: 2");

    await page.screenshot({
      path: arquivoDePrint("print-2-mapa-bioma"),
      fullPage: true,
    });
  });

  test("filtros de grupo e período atualizam contador, legenda, resumo e tabela", async ({ page }) => {
    await abrirMapa(page);
    await legenda(page, "Cerrado").click();

    await page.locator("#mapa-grupo").selectOption("Ave");
    await expect(contador(page)).toHaveText("11 de 30 resgates no mapa e na tabela");
    await expect(legenda(page, "Cerrado")).toContainText("5");
    await expect(resumo(page)).toContainText("Cerrado: 5 resgate(s)");
    await expect(page.getByText(/^Mostrando 1–5 de 11$/)).toBeVisible();

    await page.getByRole("button", { name: "Limpar filtros" }).click();
    await page.locator("#mapa-data-inicial").fill("2026-09-01");
    await expect(contador(page)).toHaveText("9 de 30 resgates no mapa e na tabela");
    await expect(legenda(page, "Cerrado")).toContainText("4");
    await expect(page.getByText(/^Mostrando 1–5 de 9$/)).toBeVisible();
  });
});
