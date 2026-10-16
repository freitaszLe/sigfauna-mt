import { expect, test } from "@playwright/test";
import { abrirComUsuario } from "./apoio";

// Não há botão de restaurar (retirado a pedido da aluna): os dados iniciais voltam
// numa aba nova ou quando a sessão salva é de versão anterior ou inválida.

const contador = /de \d+ resgates$/;

test("aba nova começa com os 30 exemplos", async ({ page }) => {
  await abrirComUsuario(page, "/resgates");
  await expect(page.getByText(contador)).toHaveText("30 de 30 resgates");
});

for (const [caso, conteudo] of [
  ["versão anterior", JSON.stringify({ versao: 3, resgates: [] })],
  ["conteúdo inválido", "{quebrado"],
] as const) {
  test(`sessão com ${caso} é trocada pelos dados iniciais`, async ({ page }) => {
    await page.addInitScript((valor) => {
      if (!window.sessionStorage.getItem("e2e:semeado")) {
        window.sessionStorage.setItem("e2e:semeado", "1");
        window.sessionStorage.setItem("fauna-u06:v1", valor);
      }
    }, conteudo);
    await abrirComUsuario(page, "/resgates");
    await expect(page.getByText(contador)).toHaveText("30 de 30 resgates");
    const versao = await page.evaluate(
      () => JSON.parse(window.sessionStorage.getItem("fauna-u06:v1") ?? "{}").versao,
    );
    expect(versao).toBe(4);
  });
}
