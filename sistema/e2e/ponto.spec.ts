import { expect, test, type Page } from "@playwright/test";
import { abrirComUsuario, confirmarAlertas } from "./apoio";

const COR_CERRADO = "#c98b3b";

function mapaDoCadastro(page: Page) {
  return page.getByRole("region", { name: "Mapa para marcar o ponto fictício do resgate" });
}

async function preencherDados(page: Page) {
  await page.locator("#campo-identificacao").fill("Macho adulto · anilha MT-0031");
  await page.locator("#campo-especie").fill("Arara-canindé");
  await page.locator("#campo-grupo").selectOption("Ave");
  await page.locator("#campo-dataResgate").fill("2026-10-01");
}

/** Clica no centro do contorno do Cerrado (fica dentro do bioma no recorte de MT). */
async function clicarNoCerrado(page: Page) {
  const mapa = mapaDoCadastro(page);
  const cerrado = mapa.locator(`path[fill="${COR_CERRADO}"]`);
  await expect(cerrado).toHaveCount(1);
  await mapa.scrollIntoViewIfNeeded();
  const caixa = await cerrado.boundingBox();
  if (!caixa) throw new Error("Contorno do Cerrado sem posição na tela.");
  await page.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
}

test.describe("Ponto fictício no cadastro", () => {
  test("clique fora de Mato Grosso mostra aviso e não marca ponto", async ({ page }) => {
    await abrirComUsuario(page, "/resgates/novo");
    const mapa = mapaDoCadastro(page);
    await expect(mapa.locator("path").first()).toBeVisible();
    await mapa.scrollIntoViewIfNeeded();
    const caixa = await mapa.boundingBox();
    if (!caixa) throw new Error("Mapa sem posição na tela.");
    await page.mouse.click(caixa.x + caixa.width - 25, caixa.y + 25);
    await expect(page.getByRole("alert").filter({ hasText: "dentro de Mato Grosso" })).toBeVisible();
    await expect(page.getByText("Nenhum ponto marcado")).toBeVisible();
    await expect(page.locator("#campo-biomaCodigo")).toBeEnabled();
  });

  test("ponto no mapa calcula o bioma e o resgate aparece no mapa da distribuição", async ({ page }) => {
    await abrirComUsuario(page, "/resgates/novo");
    const protocolo = await page.locator("#campo-protocolo").inputValue();
    await preencherDados(page);
    await clicarNoCerrado(page);

    await expect(page.getByText(/Ponto marcado:/)).toContainText("bioma calculado: Cerrado");
    await expect(page.locator("#campo-biomaCodigo")).toBeDisabled();
    await expect(page.locator("#campo-biomaCodigo")).toHaveValue("cerrado");
    // O anunciador de rota do Next.js também tem role=alert, mas fica vazio.
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveCount(0);

    await page.getByRole("button", { name: "Registrar recebimento" }).click();
    await confirmarAlertas(page);
    await expect(page).toHaveURL(/\/resgates$/);

    const linha = page.getByRole("row").filter({ hasText: protocolo, visible: true });
    await expect(linha).toContainText("calculado");
    await expect(linha).not.toContainText("Sem coordenada");
    await expect(linha).toContainText(/-1\d,\d{3}; -5\d,\d{3}/);

    await page.goto("/distribuicao");
    await expect(page.getByText(/resgates no mapa e na tabela$/)).toHaveText(
      "31 de 31 resgates no mapa e na tabela",
    );
    const legendaCerrado = page
      .getByRole("complementary", { name: "Legenda e resumo do bioma" })
      .getByRole("button", { name: /^Cerrado/ });
    await expect(legendaCerrado).toContainText("13");
    await expect(page.getByText(/sem coordenada: contados pelo bioma informado/)).toHaveCount(0);
  });

  test("remover o ponto volta à escolha manual do bioma", async ({ page }) => {
    await abrirComUsuario(page, "/resgates/novo");
    await clicarNoCerrado(page);
    await expect(page.locator("#campo-biomaCodigo")).toBeDisabled();
    // O clique também preenche as coordenadas digitáveis.
    await expect(page.locator("#campo-latitude")).toHaveValue(/^-1\d,\d+$/);
    await expect(page.locator("#campo-longitude")).toHaveValue(/^-5\d,\d+$/);
    await page.getByRole("button", { name: "Remover ponto" }).click();
    await expect(page.getByText("Nenhum ponto marcado")).toBeVisible();
    await expect(page.locator("#campo-biomaCodigo")).toBeEnabled();
    await expect(page.locator("#campo-latitude")).toHaveValue("");
  });

  test("coordenadas digitadas marcam o ponto e calculam o bioma", async ({ page }) => {
    await abrirComUsuario(page, "/resgates/novo");
    await page.locator("#campo-latitude").fill("-14,125");
    await page.locator("#campo-longitude").fill("-54,722");
    await page.getByRole("button", { name: "Marcar ponto" }).click();
    await expect(page.getByText(/Ponto marcado:/)).toContainText("-14,125; -54,722");
    await expect(page.getByText(/Ponto marcado:/)).toContainText("bioma calculado: Cerrado");
    await expect(mapaDoCadastro(page)).toHaveAttribute("data-ponto", "-14.125,-54.722");
    await expect(page.locator("#campo-biomaCodigo")).toHaveValue("cerrado");

    // Enter no campo também marca (sem enviar o formulário).
    await page.locator("#campo-latitude").fill("-17,5");
    await page.locator("#campo-longitude").fill("-57");
    await page.locator("#campo-longitude").press("Enter");
    await expect(page.getByText(/Ponto marcado:/)).toContainText("bioma calculado: Pantanal");
    await expect(page.getByText("Nada foi gravado")).toHaveCount(0);
  });

  test("coordenada inválida ou fora de MT mostra aviso", async ({ page }) => {
    await abrirComUsuario(page, "/resgates/novo");
    await page.locator("#campo-latitude").fill("abc");
    await page.locator("#campo-longitude").fill("-54,7");
    await page.getByRole("button", { name: "Marcar ponto" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "graus decimais" })).toBeVisible();

    await page.locator("#campo-latitude").fill("-23,55");
    await page.locator("#campo-longitude").fill("-46,63");
    await page.getByRole("button", { name: "Marcar ponto" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "fora de Mato Grosso" })).toBeVisible();
    await expect(page.getByText("Nenhum ponto marcado")).toBeVisible();
  });
});
