import { useSyncExternalStore } from "react";

/**
 * Usuário que entrou nesta aba. Guarda só nome e e-mail na sessão do navegador
 * (nunca a senha). Não é autenticação real; ver lib/acesso.ts.
 */
export const CHAVE_USUARIO = "fauna-u06:usuario";

export type Usuario = { nome: string; email: string };

/** "carregando": servidor e hidratação; depois, o usuário ou ausente. */
export type EstadoUsuario =
  | { situacao: "carregando" }
  | { situacao: "ausente" }
  | { situacao: "presente"; usuario: Usuario };

const CARREGANDO: EstadoUsuario = { situacao: "carregando" };
const AUSENTE: EstadoUsuario = { situacao: "ausente" };

let atual: EstadoUsuario | null = null;
let usuarioEmMemoria: Usuario | null = null;
const ouvintes = new Set<() => void>();

function criarEstado(usuario: Usuario | null): EstadoUsuario {
  return usuario ? { situacao: "presente", usuario } : AUSENTE;
}

function lerUsuario(): Usuario | null {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_USUARIO);
    if (!bruto) return null;
    const valor = JSON.parse(bruto) as Partial<Usuario>;
    return typeof valor.nome === "string" && typeof valor.email === "string"
      ? { nome: valor.nome, email: valor.email }
      : null;
  } catch {
    return usuarioEmMemoria;
  }
}

function obter(): EstadoUsuario {
  if (atual === null) atual = criarEstado(lerUsuario());
  return atual;
}

function definir(usuario: Usuario | null) {
  usuarioEmMemoria = usuario;
  try {
    if (usuario) window.sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    else window.sessionStorage.removeItem(CHAVE_USUARIO);
  } catch {
    // Armazenamento bloqueado: o usuário fica só em memória.
  }
  atual = criarEstado(usuario);
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function registrarEntrada(usuario: Usuario) {
  definir(usuario);
}

/** Remove só o usuário; os dados dos resgates continuam na sessão. */
export function sair() {
  definir(null);
}

/** Texto gravado no histórico para o usuário atual. */
export function rotuloOperador(usuario: Usuario): string {
  return usuario.nome;
}

export function useUsuario(): EstadoUsuario {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    obter,
    () => CARREGANDO,
  );
}
