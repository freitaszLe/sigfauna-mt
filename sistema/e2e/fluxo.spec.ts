import { expect, test, type Page } from "@playwright/test";
import { abrirComUsuario, confirmarAlertas } from "./apoio";

const legendaHistorico = (page: Page) => page.locator("caption").filter({ hasText: /eventos?,/ });

async function preencherEntrada(page: Page) {
  await page.locator("#avaliacao-peso").fill("4,2");
  await page.locator("#avaliacao-condicao").selectOption("Boa");
  await page.locator("#avaliacao-ferimentos").selectOption("Não");
  await page.locator("#avaliacao-comportamento").selectOption("Alerta");
}

test.describe("Fluxo e histórico", () => {
  test("avaliação de entrada muda a etapa e adiciona evento", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento/r027");
    await expect(page.getByRole("tab", { name: "Entrada (etapa atual)" })).toBeVisible();
    await expect(legendaHistorico(page)).toHaveText(/^1 evento,/);

    await preencherEntrada(page);
    await expect(page.getByText("Encaminhamento sugerido pelas respostas")).toContainText("Em triagem");
    await page.locator("#campo-observacao-avaliacao").fill("Animal estável na chegada.");
    await page.getByRole("button", { name: "Registrar avaliação" }).click();
    await expect(page.getByRole("dialog")).toContainText("FS-2026-0027: Recebido → Em triagem");
    await confirmarAlertas(page);

    await expect(page.getByRole("tab", { name: "Triagem (etapa atual)" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Entrada (avaliação registrada)" })).toBeVisible();
    await expect(legendaHistorico(page)).toHaveText(/^2 eventos,/);
    await expect(page.getByRole("cell", { name: "Recebido → Em triagem" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("tab", { name: "Triagem (etapa atual)" })).toBeVisible();
    await expect(legendaHistorico(page)).toHaveText(/^2 eventos,/);
  });

  test("avaliação sem alta mantém o caso na etapa e fica no histórico", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento/r020");
    await expect(page.getByRole("tab", { name: "Tratamento (etapa atual)" })).toBeVisible();
    const antes = Number((await legendaHistorico(page).innerText()).split(" ")[0]);

    await page.locator("#avaliacao-procedimento").fill("Curativo");
    await page.locator("#avaliacao-evolucao").selectOption("Estável");
    await page.locator("#avaliacao-alta").selectOption("Não");
    await expect(page.getByText("Encaminhamento sugerido pelas respostas")).toContainText(
      'Permanecer em "Em tratamento"',
    );
    await page.locator("#campo-observacao-avaliacao").fill("Segue em tratamento.");
    await page.getByRole("button", { name: "Registrar avaliação" }).click();
    await confirmarAlertas(page);

    await expect(page.getByRole("tab", { name: "Tratamento (etapa atual)" })).toBeVisible();
    await expect(legendaHistorico(page)).toHaveText(new RegExp(`^${antes + 1} eventos,`));
  });

  test("encaminhamento fora do fluxo é recusado sem alterar dados", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento/r028");
    await preencherEntrada(page);
    await page.locator("#campo-observacao-avaliacao").fill("Tentativa fora do fluxo.");
    // Opção que a interface não oferece, injetada para simular um caminho inválido.
    const seletor = page.locator("#campo-encaminhamento");
    await seletor.evaluate((el) => el.append(new Option("Concluído", "Concluído")));
    await seletor.selectOption("Concluído");
    await page.getByRole("button", { name: "Registrar avaliação" }).click();

    await expect(page.locator("#erro-encaminhamento")).toContainText("não é permitida");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("tab", { name: "Entrada (etapa atual)" })).toBeVisible();
    await expect(legendaHistorico(page)).toHaveText(/^1 evento,/);
  });

  test("caso concluído não recebe novas avaliações", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento/r001");
    await expect(page.getByText("Caso concluído: não há próximas etapas.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Registrar avaliação" })).toHaveCount(0);
  });
});
