"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { FILAS } from "@/lib/filas";
import { sair, useUsuario, type Usuario } from "@/lib/operador";
import AvisoArmazenamento from "./AvisoArmazenamento";
import {
  IconeAcompanhamento,
  IconeConcluido,
  IconeEspera,
  IconeLista,
  IconeMapa,
  IconePainel,
  IconePegada,
  IconeReabilitacao,
  IconeRecebido,
  IconeSeta,
  IconeTratamento,
  IconeTriagem,
} from "./IconesMenu";
import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Visão geral", icon: <IconePainel /> },
  { href: "/resgates", label: "Resgates e pacientes", icon: <IconePegada /> },
  { href: "/acompanhamento", label: "Acompanhamento", icon: <IconeAcompanhamento /> },
  { href: "/distribuicao", label: "Distribuição dos resgates", icon: <IconeMapa /> },
];

/* Preferência de menu recolhido (só do navegador de quem usa; não é dado do sistema). */
const CHAVE_MENU = "fauna-u06:menu-recolhido";
const ouvintesMenu = new Set<() => void>();

function lerMenuRecolhido(): boolean {
  try {
    return window.localStorage.getItem(CHAVE_MENU) === "1";
  } catch {
    return false;
  }
}

function gravarMenuRecolhido(recolhido: boolean) {
  try {
    window.localStorage.setItem(CHAVE_MENU, recolhido ? "1" : "0");
  } catch {
    // Sem armazenamento: a preferência vale só até recarregar.
  }
  ouvintesMenu.forEach((ouvinte) => ouvinte());
}

function useMenuRecolhido(): boolean {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintesMenu.add(ouvinte);
      return () => ouvintesMenu.delete(ouvinte);
    },
    lerMenuRecolhido,
    () => false,
  );
}

function isActive(pathname: string | null, href: string) {
  if (pathname === null) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type NavLinksProps = {
  pathname: string | null;
  onNavegar: () => void;
};

function NavLinks({ pathname, onNavegar }: NavLinksProps) {
  return (
    <ul>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const link = (
          <Link
            href={item.href}
            className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
            aria-current={pathname === item.href ? "page" : undefined}
            title={item.label}
            onClick={onNavegar}
          >
            <span className={styles.navIcon} aria-hidden="true">
              {item.icon}
            </span>
            <span className={styles.navTexto}>{item.label}</span>
          </Link>
        );
        return (
          <li key={item.href}>
            {item.href === "/acompanhamento" ? (
              <ItemComSubmenu link={link} ativo={active} pathname={pathname} onNavegar={onNavegar} />
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}

const ICONE_DA_FILA: Record<string, ReactNode> = {
  recebido: <IconeRecebido />,
  triagem: <IconeTriagem />,
  tratamento: <IconeTratamento />,
  reabilitacao: <IconeReabilitacao />,
  destinacao: <IconeEspera />,
  concluidos: <IconeConcluido />,
};

const ITENS_SUBMENU = [
  { href: "/acompanhamento", nome: "Todos os ativos", icone: <IconeLista /> },
  ...FILAS.map((fila) => ({
    href: `/acompanhamento/etapa/${fila.slug}`,
    nome: fila.nome,
    icone: ICONE_DA_FILA[fila.slug],
  })),
];

type ItemComSubmenuProps = NavLinksProps & { link: ReactNode; ativo: boolean };

/**
 * Acompanhamento com submenu recolhível (uma fila por etapa). Abre sozinho nas páginas do
 * Acompanhamento; a seta abre ou fecha em qualquer página.
 */
function ItemComSubmenu({ link, ativo, pathname, onNavegar }: ItemComSubmenuProps) {
  const [escolha, setEscolha] = useState<boolean | null>(null);
  const aberto = escolha ?? ativo;

  return (
    <>
      <div className={styles.linhaComSubmenu}>
        {link}
        <button
          type="button"
          className={`${styles.botaoSubmenu} ${aberto ? styles.botaoSubmenuAberto : ""}`}
          aria-expanded={aberto}
          aria-controls="submenu-acompanhamento"
          aria-label={aberto ? "Recolher etapas do acompanhamento" : "Mostrar etapas do acompanhamento"}
          title={aberto ? "Recolher etapas" : "Mostrar etapas"}
          onClick={() => setEscolha(!aberto)}
        >
          <IconeSeta />
        </button>
      </div>
      {aberto ? (
        <ul id="submenu-acompanhamento" className={styles.submenu} aria-label="Etapas do acompanhamento">
          {ITENS_SUBMENU.map((item) => {
            const atual = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.subLink} ${atual ? styles.subLinkAtivo : ""}`}
                  aria-current={atual ? "page" : undefined}
                  onClick={onNavegar}
                >
                  <span className={styles.subIcone} aria-hidden="true">
                    {item.icone}
                  </span>
                  <span>{item.nome}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </>
  );
}

/** Lê o endereço atual; fica em Suspense porque rotas com parâmetro só o conhecem no acesso. */
function NavLinksComEndereco({ onNavegar }: { onNavegar: () => void }) {
  return <NavLinks pathname={usePathname()} onNavegar={onNavegar} />;
}

function UsuarioAtual({ usuario, className }: { usuario: Usuario; className: string }) {
  const router = useRouter();
  return (
    <div className={className}>
      <span className={styles.operadorNome} title={usuario.email}>
        {usuario.nome}
      </span>
      <button
        type="button"
        className={styles.sairButton}
        onClick={() => {
          sair();
          router.replace("/entrar");
        }}
      >
        Sair
      </button>
    </div>
  );
}

function Logo({ className, sizes }: { className: string; sizes: string }) {
  return (
    <Image
      src="/marca/sigfauna-mt.webp"
      alt="SIGFAUNA MT — Gestão de Fauna Silvestre"
      width={2000}
      height={667}
      sizes={sizes}
      priority
      className={className}
    />
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fecharMenu = () => setMenuOpen(false);
  const recolhido = useMenuRecolhido();
  const sessao = useUsuario();
  const router = useRouter();

  // Sem usuário na sessão, vai para a tela de acesso.
  useEffect(() => {
    if (sessao.situacao === "ausente") router.replace("/entrar");
  }, [sessao.situacao, router]);

  return (
    <div className={`${styles.shell} ${recolhido ? styles.shellRecolhido : ""}`}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.recolherButton}
          aria-controls="menu-principal"
          aria-expanded={!recolhido}
          aria-label={recolhido ? "Expandir menu" : "Recolher menu"}
          title={recolhido ? "Expandir menu" : "Recolher menu"}
          onClick={() => gravarMenuRecolhido(!recolhido)}
        >
          <span aria-hidden="true">{recolhido ? "»" : "«"}</span>
        </button>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="menu-principal"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Fechar" : "Menu"}
        </button>
        <Link href="/" className={styles.marcaTopo} aria-label="SIGFAUNA MT — Visão geral">
          <Logo className={styles.logoTopo} sizes="160px" />
        </Link>
        {sessao.situacao === "presente" ? (
          <UsuarioAtual usuario={sessao.usuario} className={styles.operadorTopo} />
        ) : null}
      </header>

      <nav
        id="menu-principal"
        aria-label="Navegação principal"
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
      >
        <Link href="/" className={styles.marcaMenu} aria-label="SIGFAUNA MT — Visão geral">
          <span className={styles.recorteLogo}>
            <Logo className={styles.logoMenu} sizes="220px" />
          </span>
        </Link>
        <Suspense fallback={<NavLinks pathname={null} onNavegar={fecharMenu} />}>
          <NavLinksComEndereco onNavegar={fecharMenu} />
        </Suspense>
        {sessao.situacao === "presente" ? (
          <div className={styles.sidebarFooter}>
            <UsuarioAtual usuario={sessao.usuario} className={styles.operadorMenu} />
          </div>
        ) : null}
      </nav>

      <main className={styles.content}>
        <AvisoArmazenamento />
        {children}
      </main>
    </div>
  );
}
