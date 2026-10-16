import { expect, test, type Page } from "@playwright/test";
import { abrirComUsuario } from "./apoio";

// Ao trocar de fila pelo menu, o Next.js mantém a página anterior escondida no DOM.
const contador = (page: Page) => page.getByText(/casos nesta etapa$/).filter({ visible: true });

const SUBMENU = [
  "Todos os ativos",
  "Recebido",
  "Em triagem",
  "Em tratamento",
  "Em reabilitação",
  "Aguardando destinação",
  "Concluídos",
];

test.describe("Submenus do Acompanhamento", () => {
  test("submenu tem uma fila por etapa, com ícone e sem quantidade", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento");
    const submenu = page.getByRole("list", { name: "Etapas do acompanhamento" });
    await expect(submenu.getByRole("link")).toHaveCount(SUBMENU.length);
    for (const nome of SUBMENU) {
      const link = submenu.getByRole("link", { name: nome, exact: true });
      await expect(link).toBeVisible();
      await expect(link.locator("svg")).toHaveCount(1);
      await expect(link).not.toContainText(/\d/);
    }
  });

  test("submenu recolhe e abre pela seta", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento");
    const submenu = page.getByRole("list", { name: "Etapas do acompanhamento" });
    await expect(submenu).toBeVisible();
    await page.getByRole("button", { name: "Recolher etapas do acompanhamento" }).click();
    await expect(submenu).toHaveCount(0);
    await page.getByRole("button", { name: "Mostrar etapas do acompanhamento" }).click();
    await expect(submenu).toBeVisible();
  });

  test("fora do Acompanhamento o submenu começa fechado e pode ser aberto", async ({ page }) => {
    await abrirComUsuario(page, "/resgates");
    const submenu = page.getByRole("list", { name: "Etapas do acompanhamento" });
    await expect(submenu).toHaveCount(0);
    await page.getByRole("button", { name: "Mostrar etapas do acompanhamento" }).click();
    await submenu.getByRole("link", { name: "Concluídos", exact: true }).click();
    await expect(page).toHaveURL(/\/acompanhamento\/etapa\/concluidos$/);
  });

  test("fila de triagem mostra as respostas da conferência de entrada", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento");
    await page
      .getByRole("list", { name: "Etapas do acompanhamento" })
      .getByRole("link", { name: /^Em triagem/ })
      .click();
    await expect(page).toHaveURL(/\/acompanhamento\/etapa\/triagem$/);
    await expect(page.getByRole("heading", { name: "Acompanhamento · Em triagem" })).toBeVisible();
    await expect(page.getByText(/casos nesta etapa$/)).toHaveText("3 de 3 casos nesta etapa");
    for (const coluna of ["Peso", "Condição corporal", "Ferimentos", "Comportamento", "Na triagem desde"]) {
      await expect(page.getByRole("columnheader", { name: coluna })).toBeVisible();
    }
    await expect(page.getByRole("columnheader", { name: "Etapa atual" })).toHaveCount(0);
    const primeira = page.getByRole("row").nth(1);
    await expect(primeira).toContainText(/\d+,?\d* kg/);
  });

  test("fila de concluídos mostra a destinação registrada", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento/etapa/concluidos");
    await expect(page.getByText(/casos nesta etapa$/)).toHaveText("5 de 5 casos nesta etapa");
    const destinacoes = await page.getByRole("row").locator("td:nth-child(3)").allInnerTexts();
    expect(destinacoes).toHaveLength(5);
    for (const valor of destinacoes) {
      expect(["Soltura", "Transferência", "Permanência em cativeiro", "Óbito"]).toContain(valor);
    }
  });

  test("avaliação que muda a etapa move o caso de fila", async ({ page }) => {
    await abrirComUsuario(page, "/acompanhamento/r027");
    await page.locator("#avaliacao-peso").fill("4,2");
    await page.locator("#avaliacao-condicao").selectOption("Boa");
    await page.locator("#avaliacao-ferimentos").selectOption("Não");
    await page.locator("#avaliacao-comportamento").selectOption("Alerta");
    await page.locator("#campo-observacao-avaliacao").fill("Animal estável na chegada.");
    await page.getByRole("button", { name: "Registrar avaliação" }).click();
    await page.getByRole("button", { name: "Confirmar" }).click();
    await page.getByRole("button", { name: "OK" }).click();

    const submenu = page.getByRole("list", { name: "Etapas do acompanhamento" });
    await submenu.getByRole("link", { name: "Em triagem", exact: true }).click();
    await expect(contador(page)).toHaveText("4 de 4 casos nesta etapa");
    await expect(page.getByRole("row").filter({ hasText: "FS-2026-0027", visible: true })).toContainText("4,2 kg");
    await submenu.getByRole("link", { name: "Recebido", exact: true }).click();
    await expect(contador(page)).toHaveText("3 de 3 casos nesta etapa");
  });
});

test.describe("Tela de Resgates", () => {
  test("tabela do resgate tem coordenada e não tem etapa", async ({ page }) => {
    await abrirComUsuario(page, "/resgates");
    await expect(page.getByRole("columnheader", { name: "Coordenada fictícia" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Etapa atual" })).toHaveCount(0);
    await expect(page.locator("#filtro-etapa")).toHaveCount(0);
    const resumo = page.getByLabel("Resumo dos resgates");
    await expect(resumo).not.toContainText("coordenada");
    await expect(resumo).toContainText("26/09/2026");
  });
});
