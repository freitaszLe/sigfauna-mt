import { expect, test } from "@playwright/test";

test.describe("Tela de entrada", () => {
  test("sem usuário na sessão, as páginas do sistema levam à entrada", async ({ page }) => {
    await page.goto("/resgates");
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test("e-mail ou senha errados mostram mensagem e não entram", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("equipe@exemplo.test");
    await page.getByLabel("Senha").fill("senha-errada");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "E-mail ou senha incorretos." })).toBeVisible();
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test("credencial do projeto entra no sistema", async ({ page }) => {
    const senha = process.env.E2E_SENHA;
    test.skip(!senha, "E2E_SENHA não definida (.env.local fora do Git)");
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("admin@admin.com");
    await page.getByLabel("Senha").fill(senha!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Indicadores" })).toBeVisible();
  });
});
