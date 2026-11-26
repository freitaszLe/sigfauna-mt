import { expect, test } from "@playwright/test";

test.describe("Tela de entrada", () => {
  test("sem usuário na sessão, as páginas do sistema levam à entrada", async ({ page }) => {
    await page.goto("/resgates");
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test("a tela avisa que é um protótipo", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page.getByRole("note")).toContainText("Protótipo");
  });

  test("campos vazios pedem o e-mail e a senha", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Informe o e-mail e a senha." })).toBeVisible();
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test("qualquer e-mail e senha entram no sistema", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("qualquer@exemplo.test");
    await page.getByLabel("Senha").fill("qualquer-coisa");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Indicadores" })).toBeVisible();
  });
});
