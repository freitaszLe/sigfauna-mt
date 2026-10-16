"use client";

import { useState, type FormEvent } from "react";
import {
  criarResgate,
  dataLocal,
  ENTRADA_VAZIA,
  normalizarProtocolo,
  proximoProtocolo,
  validarRecebimento,
  type EntradaRecebimento,
  type ErrosRecebimento,
} from "@/lib/cadastro";
import { atualizarResgates, useResgates } from "@/lib/armazenamento";
import { CATALOGO_BIOMAS } from "@/lib/dados";
import { rotuloOperador, useUsuario } from "@/lib/operador";
import { GRUPOS } from "@/lib/types";
import blockStyles from "./PageBlock.module.css";
import styles from "./Formulario.module.css";

const ROTULOS: Record<keyof EntradaRecebimento, string> = {
  protocolo: "Protocolo",
  identificacao: "Identificação do animal",
  especie: "Espécie",
  grupo: "Grupo",
  biomaCodigo: "Bioma do local do resgate",
  dataResgate: "Data do resgate",
  observacao: "Observação",
};

type FormularioRecebimentoProps = {
  onCancelar: () => void;
  onRegistrado: (protocolo: string) => void;
};

export default function FormularioRecebimento({
  onCancelar,
  onRegistrado,
}: FormularioRecebimentoProps) {
  const { resgates } = useResgates();
  const sessaoUsuario = useUsuario();
  const [entrada, setEntrada] = useState<EntradaRecebimento>(() => ({
    ...ENTRADA_VAZIA,
    protocolo: proximoProtocolo(resgates, new Date().getFullYear()),
  }));
  const [erros, setErros] = useState<ErrosRecebimento>({});
  const hoje = dataLocal(new Date());
  const especies = [...new Set(resgates.map((resgate) => resgate.especie))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

  function alterar(campo: keyof EntradaRecebimento, valor: string) {
    setEntrada((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados = validarRecebimento(entrada, resgates, dataLocal(new Date()));
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    // SweetAlert2 com o layout padrão da biblioteca; só os textos estão em português.
    const { default: Swal } = await import("sweetalert2");
    const protocolo = normalizarProtocolo(entrada.protocolo);
    const confirmacao = await Swal.fire({
      title: "Confirmar registro?",
      text: `O resgate ${protocolo} será registrado.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacao.isConfirmed) return;

    const rotulo =
      sessaoUsuario.situacao === "presente" ? rotuloOperador(sessaoUsuario.usuario) : undefined;
    atualizarResgates((atuais) => [...atuais, criarResgate(entrada, atuais, new Date(), rotulo)]);

    await Swal.fire({
      title: "Resgate registrado",
      text: `O resgate ${protocolo} foi registrado.`,
      icon: "success",
      confirmButtonText: "OK",
    });
    onRegistrado(protocolo);
  }

  function propsDoCampo(campo: keyof EntradaRecebimento) {
    return {
      id: `campo-${campo}`,
      name: campo,
      className: styles.input,
      value: entrada[campo],
      "aria-invalid": erros[campo] ? true : undefined,
      "aria-describedby": erros[campo] ? `erro-${campo}` : undefined,
      onChange: (evento: { target: { value: string } }) => alterar(campo, evento.target.value),
    };
  }

  function erroDoCampo(campo: keyof EntradaRecebimento) {
    return erros[campo] ? (
      <span id={`erro-${campo}`} className={styles.error}>
        {erros[campo]}
      </span>
    ) : null;
  }

  const listaDeErros = Object.entries(erros) as [keyof EntradaRecebimento, string][];

  return (
    <form className={styles.form} onSubmit={enviar} noValidate aria-label="Novo recebimento">
      {listaDeErros.length > 0 ? (
        <div className={styles.errorSummary} role="alert">
          <strong>Corrija os campos abaixo. Nada foi gravado.</strong>
          <ul>
            {listaDeErros.map(([campo, mensagem]) => (
              <li key={campo}>
                <a href={`#campo-${campo}`}>{ROTULOS[campo]}</a>: {mensagem}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="campo-protocolo" className={styles.label}>
            Protocolo <span className={styles.required}>*</span>
          </label>
          <input {...propsDoCampo("protocolo")} autoComplete="off" />
          {erroDoCampo("protocolo")}
        </div>

        <div className={styles.field}>
          <label htmlFor="campo-identificacao" className={styles.label}>
            Identificação do animal <span className={styles.required}>*</span>
          </label>
          <input {...propsDoCampo("identificacao")} placeholder="Ex.: Macho adulto · anilha MT-0031" />
          {erroDoCampo("identificacao")}
        </div>

        <div className={styles.field}>
          <label htmlFor="campo-especie" className={styles.label}>
            Espécie <span className={styles.required}>*</span>
          </label>
          <input {...propsDoCampo("especie")} list="lista-especies" />
          <datalist id="lista-especies">
            {especies.map((especie) => (
              <option key={especie} value={especie} />
            ))}
          </datalist>
          {erroDoCampo("especie")}
        </div>

        <div className={styles.field}>
          <label htmlFor="campo-grupo" className={styles.label}>
            Grupo <span className={styles.required}>*</span>
          </label>
          <select {...propsDoCampo("grupo")}>
            <option value="">Selecione</option>
            {GRUPOS.map((grupo) => (
              <option key={grupo} value={grupo}>
                {grupo}
              </option>
            ))}
          </select>
          {erroDoCampo("grupo")}
        </div>

        <div className={styles.field}>
          <label htmlFor="campo-biomaCodigo" className={styles.label}>
            Bioma do local do resgate <span className={styles.required}>*</span>
          </label>
          <select {...propsDoCampo("biomaCodigo")}>
            <option value="">Selecione</option>
            {CATALOGO_BIOMAS.map((bioma) => (
              <option key={bioma.codigo} value={bioma.codigo}>
                {bioma.nome}
              </option>
            ))}
          </select>
          <span className={styles.hint}>
            Gravado como escolha manual. Não comprova a origem natural do animal nem autoriza
            soltura.
          </span>
          {erroDoCampo("biomaCodigo")}
        </div>

        <div className={styles.field}>
          <label htmlFor="campo-dataResgate" className={styles.label}>
            Data do resgate <span className={styles.required}>*</span>
          </label>
          <input {...propsDoCampo("dataResgate")} type="date" max={hoje} />
          {erroDoCampo("dataResgate")}
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label htmlFor="campo-observacao" className={styles.label}>
            Observação
          </label>
          <textarea {...propsDoCampo("observacao")} rows={2} />
        </div>
      </div>

      <p className={styles.hint}>
        <span className={styles.required}>*</span> Campos obrigatórios. Não informe município nem
        endereço.
      </p>

      <div className={styles.actions}>
        <button type="submit" className={blockStyles.primaryButton}>
          Registrar recebimento
        </button>
        <button type="button" className={blockStyles.dangerButton} onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
