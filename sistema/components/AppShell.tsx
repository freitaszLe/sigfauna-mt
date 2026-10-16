"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { restaurarDemonstracao } from "@/lib/armazenamento";
import AvisoArmazenamento from "./AvisoArmazenamento";
import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Visão geral", icon: "▦" },
  { href: "/resgates", label: "Resgates e pacientes", icon: "☰" },
  { href: "/acompanhamento", label: "Acompanhamento", icon: "↻" },
  { href: "/distribuicao", label: "Distribuição dos resgates", icon: "◩" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="menu-principal"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Fechar" : "Menu"}
        </button>
        <span className={styles.brand}>Fauna Silvestre</span>
        <span className={styles.demoBadge}>Dados fictícios — demonstração</span>
      </header>

      <nav
        id="menu-principal"
        aria-label="Navegação principal"
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
      >
        <ul>
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.restoreButton}
            onClick={() => {
              if (
                window.confirm(
                  "Restaurar os registros iniciais da demonstração? As alterações desta aba serão perdidas.",
                )
              ) {
                restaurarDemonstracao();
                setMenuOpen(false);
              }
            }}
          >
            Restaurar demonstração
          </button>
        </div>
      </nav>

      <main className={styles.content}>
        <AvisoArmazenamento />
        {children}
      </main>
    </div>
  );
}
