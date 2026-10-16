import { expect, test } from "@playwright/test";
import { abrirComUsuario, confirmarAlertas } from "./apoio";

test.describe("Cadastro e recarga", () => {
  test("campos obrigatórios vazios mostram mensagens e nada é gravado", async ({ page }) => {
    await abrirComUsuario(page, "/resgates/novo");
    await page.locator("#campo-protocolo").fill("");
    await page.getByRole("button", { name: "Registrar recebimento" }).click();
    const resumo = page.getByRole("alert").filter({ hasText: "Nada foi gravado" });
    await expect(resumo).toBeVisible();
    await expect(resumo.getByRole("listitem")).toHaveCount(6);
  });

  test("protocolo duplicado é recusado", async ({ page }) => {
    await abrirComUsuario(page, "/resgates/novo");
    await page.locator("#campo-protocolo").fill("FS-2026-0001");
    await page.locator("#campo-identificacao").fill("Macho adulto · anilha MT-0099");
    await page.locator("#campo-especie").fill("Tucano-toco");
    await page.locator("#campo-grupo").selectOption("Ave");
    await page.locator("#campo-biomaCodigo").selectOption("cerrado");
    await page.locator("#campo-dataResgate").fill("2026-09-30");
    await page.getByRole("button", { name: "Registrar recebimento" }).click();
    await expect(page.locator("#erro-protocolo")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("novo resgate aparece na lista e continua após recarregar", async ({ page }) => {
    await abrirComUsuario(page, "/resgates/novo");
    const protocolo = await page.locator("#campo-protocolo").inputValue();
    expect(protocolo).toBe("FS-2026-0031");
    await page.locator("#campo-identificacao").fill("Fêmea adulta · anilha MT-0031");
    await page.locator("#campo-especie").fill("Tucano-toco");
    await page.locator("#campo-grupo").selectOption("Ave");
    await page.locator("#campo-biomaCodigo").selectOption("cerrado");
    await page.locator("#campo-dataResgate").fill("2026-09-30");
    await page.getByRole("button", { name: "Registrar recebimento" }).click();
    await confirmarAlertas(page);

    await expect(page).toHaveURL(/\/resgates$/);
    const contador = page.getByText(/de 31 resgates$/);
    await expect(contador).toHaveText("31 de 31 resgates");
    await expect(page.getByRole("cell", { name: protocolo, exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByText(/de 31 resgates$/)).toHaveText("31 de 31 resgates");
    await expect(page.getByRole("cell", { name: protocolo, exact: true })).toBeVisible();

    // Bioma escolhido no cadastro, sem coordenada: aparece no filtro "Escolhido no cadastro".
    await page.locator("#filtro-metodo").selectOption("manual");
    await expect(page.getByText(/de 31 resgates$/)).toHaveText("1 de 31 resgates");
    const linha = page.getByRole("row").filter({ hasText: protocolo });
    await expect(linha).toContainText("Sem coordenada");
    await expect(linha).toContainText("manual");
  });
});
