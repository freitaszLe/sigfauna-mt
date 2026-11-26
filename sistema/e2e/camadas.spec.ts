import { expect, test } from "@playwright/test";
import { abrirComUsuario } from "./apoio";

test.describe("Camadas da SEMA e fotos de exemplo", () => {
  test("distribuição liga as unidades de conservação e mostra a legenda dos grupos", async ({ page }) => {
    await abrirComUsuario(page, "/distribuicao");
    const caixa = page.getByRole("group", { name: "Camadas da SEMA" });
    await expect(caixa).toBeVisible();
    await caixa.getByLabel("Unidades de conservação").check();
    await expect(caixa.getByText("Proteção integral")).toBeVisible();
    await expect(caixa.getByText("Uso sustentável")).toBeVisible();
  });

  test("ficha mostra a foto de exemplo, o local do resgate e as informações geográficas", async ({ page }) => {
    await abrirComUsuario(page, "/resgates");
    await page.locator("tbody tr").first().getByRole("link").first().click();
    await expect(page.getByRole("img", { name: /Foto de exemplo/ }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Local do resgate" })).toBeVisible();
    const quadro = page.getByText("Informações geográficas");
    await expect(quadro).toBeVisible();
    await quadro.click();
    await expect(page.getByText("Unidade de conservação", { exact: true })).toBeVisible();
    await expect(page.getByText("Terra indígena", { exact: true }).first()).toBeVisible();
  });
});
