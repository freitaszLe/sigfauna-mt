import type { ReactNode } from "react";

/** Ícones de linha (24×24) desenhados no projeto, sem biblioteca externa. */
function Icone({ children, tamanho = 20 }: { children: ReactNode; tamanho?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Visão geral: painel com gráfico de barras. */
export function IconePainel() {
  return (
    <Icone>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 16v-4M12 16V8M17 16v-6" />
    </Icone>
  );
}

/** Resgates e pacientes: pegada de animal. */
export function IconePegada() {
  return (
    <Icone>
      <circle cx="6.5" cy="10" r="1.8" />
      <circle cx="10" cy="6" r="1.8" />
      <circle cx="14" cy="6" r="1.8" />
      <circle cx="17.5" cy="10" r="1.8" />
      <path d="M12 12c-2.6 0-5 2.8-5 5.2 0 1.6 1.3 2.6 2.8 2.3 1-.2 1.5-.6 2.2-.6s1.2.4 2.2.6c1.5.3 2.8-.7 2.8-2.3 0-2.4-2.4-5.2-5-5.2z" />
    </Icone>
  );
}

/** Acompanhamento: prancheta com linha de sinais vitais. */
export function IconeAcompanhamento() {
  return (
    <Icone>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M8 13h2l1.5-3 2 6 1.5-3H16" />
    </Icone>
  );
}

/** Distribuição dos resgates: mapa dobrado. */
export function IconeMapa() {
  return (
    <Icone>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </Icone>
  );
}

/* ---------- Submenu do Acompanhamento (16 px) ---------- */

/** Todos os ativos: lista. */
export function IconeLista() {
  return (
    <Icone tamanho={16}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </Icone>
  );
}

/** Recebido: caixa de entrada. */
export function IconeRecebido() {
  return (
    <Icone tamanho={16}>
      <path d="M4 13l2.5-7h11L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M4 13h4.5l1.5 2.5h4l1.5-2.5H20" />
    </Icone>
  );
}

/** Em triagem: lupa. */
export function IconeTriagem() {
  return (
    <Icone tamanho={16}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </Icone>
  );
}

/** Em tratamento: cruz de cuidado. */
export function IconeTratamento() {
  return (
    <Icone tamanho={16}>
      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
    </Icone>
  );
}

/** Em reabilitação: coração com batimento. */
export function IconeReabilitacao() {
  return (
    <Icone tamanho={16}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      <path d="M7.5 12h2.5l1-2 2 4 1-2h2.5" />
    </Icone>
  );
}

/** Aguardando destinação: relógio. */
export function IconeEspera() {
  return (
    <Icone tamanho={16}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </Icone>
  );
}

/** Concluídos: círculo com visto. */
export function IconeConcluido() {
  return (
    <Icone tamanho={16}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </Icone>
  );
}

/** Seta do botão que abre e fecha o submenu. */
export function IconeSeta() {
  return (
    <Icone tamanho={16}>
      <path d="M6 9l6 6 6-6" />
    </Icone>
  );
}
