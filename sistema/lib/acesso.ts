/**
 * Tela de entrada do PROTÓTIPO: aceita qualquer e-mail e qualquer senha, desde que preenchidos.
 * Não há conferência de credencial, autenticação nem controle de acesso; o nome só aparece na barra.
 */
export type ResultadoAcesso =
  | { ok: true; nome: string; email: string }
  | { ok: false; erro: string };

/** Nome exibido: o trecho do e-mail antes do "@", com a primeira letra maiúscula. */
function nomeDoEmail(email: string): string {
  const base = email.split("@")[0].trim() || email.trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export async function conferirAcesso(email: string, senha: string): Promise<ResultadoAcesso> {
  if (!email.trim() || !senha) {
    return { ok: false, erro: "Informe o e-mail e a senha." };
  }
  return { ok: true, nome: nomeDoEmail(email), email: email.trim().toLowerCase() };
}
