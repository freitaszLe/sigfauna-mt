import path from "node:path";
import type { Page } from "@playwright/test";

/** Usuário gravado direto na sessão, para os testes que não tratam da tela de entrada. */
export const USUARIO_TESTE = { nome: "Equipe de testes", email: "equipe@exemplo.test" };

export const PASTA_EVIDENCIAS = path.resolve(process.cwd(), "..", "evidencias");

/** Nome do print; com URL externa ganha o sufixo "-publicado" e não substitui o print local. */
export function arquivoDePrint(nome: string) {
  const sufixo = process.env.PLAYWRIGHT_BASE_URL ? "-publicado" : "";
  return path.join(PASTA_EVIDENCIAS, `${nome}${sufixo}.png`);
}

export async function abrirComUsuario(page: Page, caminho: string) {
  await page.addInitScript((usuario) => {
    if (!window.sessionStorage.getItem("fauna-u06:usuario")) {
      window.sessionStorage.setItem("fauna-u06:usuario", JSON.stringify(usuario));
    }
  }, USUARIO_TESTE);
  await page.goto(caminho);
}

/** Confirma o SweetAlert de confirmação e fecha o de sucesso. */
export async function confirmarAlertas(page: Page) {
  await page.getByRole("button", { name: "Confirmar" }).click();
  await page.getByRole("button", { name: "OK" }).click();
}
