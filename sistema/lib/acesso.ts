/**
 * Credencial de acesso definida no projeto. A conferência acontece no navegador:
 * não é autenticação real nem controle de acesso, apenas a tela de entrada do sistema.
 * A senha não fica em texto no código, só o hash SHA-256 dela.
 */
export const USUARIO_CADASTRADO = {
  email: "admin@admin.com",
  nome: "Administrador",
  senhaSha256: "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
} as const;

async function sha256Hex(texto: string): Promise<string> {
  const bytes = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(resumo)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type ResultadoAcesso =
  | { ok: true; nome: string; email: string }
  | { ok: false; erro: string };

export async function conferirAcesso(email: string, senha: string): Promise<ResultadoAcesso> {
  if (!email.trim() || !senha) {
    return { ok: false, erro: "Informe o e-mail e a senha." };
  }
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return { ok: false, erro: "Este navegador não permite conferir a senha neste endereço." };
  }
  const emailConfere = email.trim().toLowerCase() === USUARIO_CADASTRADO.email;
  const senhaConfere = (await sha256Hex(senha)) === USUARIO_CADASTRADO.senhaSha256;
  return emailConfere && senhaConfere
    ? { ok: true, nome: USUARIO_CADASTRADO.nome, email: USUARIO_CADASTRADO.email }
    : { ok: false, erro: "E-mail ou senha incorretos." };
}
