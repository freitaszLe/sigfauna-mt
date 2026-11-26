"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { conferirAcesso } from "@/lib/acesso";
import { registrarEntrada, useUsuario } from "@/lib/operador";
import blockStyles from "./PageBlock.module.css";
import formStyles from "./Formulario.module.css";
import styles from "./TelaEntrada.module.css";

export default function TelaEntrada() {
  const router = useRouter();
  const sessao = useUsuario();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [conferindo, setConferindo] = useState(false);

  // Quem já entrou nesta aba segue direto para a Visão geral.
  useEffect(() => {
    if (sessao.situacao === "presente") router.replace("/");
  }, [sessao.situacao, router]);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setConferindo(true);
    const resultado = await conferirAcesso(email, senha);
    setConferindo(false);
    if (!resultado.ok) {
      setErro(resultado.erro);
      setSenha("");
      return;
    }
    setErro(null);
    registrarEntrada({ nome: resultado.nome, email: resultado.email });
    router.replace("/");
  }

  return (
    <main className={styles.pagina}>
      <section className={styles.cartao} aria-labelledby="titulo-entrada">
        <Image
          src="/marca/sigfauna-mt.webp"
          alt="SIGFAUNA MT — Gestão de Fauna Silvestre"
          width={2000}
          height={667}
          sizes="(max-width: 440px) 90vw, 360px"
          priority
          className={styles.logo}
        />

        <h1 id="titulo-entrada" className={styles.titulo}>
          Acesso ao sistema
        </h1>

        <form className={styles.formulario} onSubmit={enviar} noValidate>
          {erro ? (
            <p className={formStyles.error} role="alert">
              {erro}
            </p>
          ) : null}

          <div className={formStyles.field}>
            <label htmlFor="campo-email" className={formStyles.label}>
              E-mail
            </label>
            <input
              id="campo-email"
              name="email"
              type="email"
              autoComplete="username"
              className={formStyles.input}
              value={email}
              aria-invalid={erro ? true : undefined}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={formStyles.field}>
            <label htmlFor="campo-senha" className={formStyles.label}>
              Senha
            </label>
            <input
              id="campo-senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              className={formStyles.input}
              value={senha}
              aria-invalid={erro ? true : undefined}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit" className={blockStyles.primaryButton} disabled={conferindo}>
            {conferindo ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className={styles.aviso} role="note">
          <svg className={styles.icone} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
          </svg>
          <span>
            <strong>Protótipo.</strong> Qualquer e-mail e senha entram; os dados são fictícios.
          </span>
        </p>
      </section>
    </main>
  );
}
