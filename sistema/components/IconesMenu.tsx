import type { ReactNode } from "react";

/** Ícones de linha (24×24) desenhados no projeto, sem biblioteca externa. */
function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
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
