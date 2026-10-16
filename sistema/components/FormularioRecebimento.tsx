"use client";

import { useCallback, useState, type FormEvent } from "react";
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
import { biomaPorCoordenada } from "@/lib/geo";
import { CATALOGO_BIOMAS, nomeDoBioma } from "@/lib/dados";
import { rotuloOperador, useUsuario } from "@/lib/operador";
import { GRUPOS, type BiomaCodigo, type CoordenadaFicticia } from "@/lib/types";
import MapaSelecaoPonto from "./MapaSelecaoPonto";
import { formatarCoordenada } from "./TabelaResgates";
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

/** Número digitado com vírgula ou ponto decimal; null se não for um número. */
function lerNumero(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(limpo)) return null;
  return Number(limpo);
}

/** Até 4 casas decimais: a coordenada é fictícia, não precisa de mais precisão. */
function arredondar(valor: number): number {
  return Math.round(valor * 10000) / 10000;
}

function numeroBR(valor: number): string {
  return String(valor).replace(".", ",");
}

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
  const [ponto, setPonto] = useState<CoordenadaFicticia | null>(null);
  const [avisoPonto, setAvisoPonto] = useState<string | null>(null);
  // Coordenadas digitadas (aceitam vírgula ou ponto decimal); o clique no mapa também as preenche.
  const [latTexto, setLatTexto] = useState("");
  const [lngTexto, setLngTexto] = useState("");
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
    atualizarResgates((atuais) => [
      ...atuais,
      criarResgate(entrada, atuais, new Date(), rotulo, ponto),
    ]);

    await Swal.fire({
      title: "Resgate registrado",
      text: `O resgate ${protocolo} foi registrado.`,
      icon: "success",
      confirmButtonText: "OK",
    });
    onRegistrado(protocolo);
  }

  const escolherPonto = useCallback((novo: CoordenadaFicticia, bioma: BiomaCodigo) => {
    setPonto(novo);
    setAvisoPonto(null);
    setLatTexto(numeroBR(novo.lat));
    setLngTexto(numeroBR(novo.lng));
    setEntrada((atual) => ({ ...atual, biomaCodigo: bioma }));
    // Remove o erro do bioma, se havia; uma chave com valor vazio ainda apareceria no resumo.
    setErros((atuais) => {
      const demais = { ...atuais };
      delete demais.biomaCodigo;
      return demais;
    });
  }, []);

  const pontoForaDeMT = useCallback(() => {
    setAvisoPonto("O ponto precisa ficar dentro de Mato Grosso. Clique em um dos biomas.");
  }, []);

  /** Marca o ponto a partir das coordenadas digitadas. */
  function marcarDigitado() {
    const lat = lerNumero(latTexto);
    const lng = lerNumero(lngTexto);
    if (lat === null || lng === null) {
      setAvisoPonto("Informe latitude e longitude em graus decimais (ex.: -14,125 e -54,722).");
      return;
    }
    const novo = { lat: arredondar(lat), lng: arredondar(lng) };
    const bioma = biomaPorCoordenada(novo.lat, novo.lng);
    if (!bioma) {
      setAvisoPonto(
        "Essa coordenada fica fora de Mato Grosso. Em MT, a latitude vai de cerca de -7 a -18 e a longitude de -50 a -62.",
      );
      return;
    }
    escolherPonto(novo, bioma);
  }

  function removerPonto() {
    setPonto(null);
    setAvisoPonto(null);
    setLatTexto("");
    setLngTexto("");
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

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.label} id="rotulo-ponto">
            Ponto fictício do resgate (opcional)
          </span>
          <span className={styles.hint}>
            Clique no mapa ou digite a latitude e a longitude para marcar onde o animal foi
            resgatado. O bioma é calculado pelo ponto,
            com a malha oficial do IBGE. A coordenada é fictícia; não informe município nem
            endereço.
          </span>
          <MapaSelecaoPonto ponto={ponto} onEscolher={escolherPonto} onForaDeMT={pontoForaDeMT} />
          <div className={styles.coordenadas}>
            <div className={styles.field}>
              <label htmlFor="campo-latitude" className={styles.label}>
                Latitude
              </label>
              <input
                id="campo-latitude"
                className={styles.input}
                inputMode="decimal"
                placeholder="Ex.: -14,125"
                autoComplete="off"
                value={latTexto}
                onChange={(e) => setLatTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    marcarDigitado();
                  }
                }}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="campo-longitude" className={styles.label}>
                Longitude
              </label>
              <input
                id="campo-longitude"
                className={styles.input}
                inputMode="decimal"
                placeholder="Ex.: -54,722"
                autoComplete="off"
                value={lngTexto}
                onChange={(e) => setLngTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    marcarDigitado();
                  }
                }}
              />
            </div>
            <button type="button" className={styles.secondaryButton} onClick={marcarDigitado}>
              Marcar ponto
            </button>
          </div>
          <div className={styles.resumoPonto} aria-live="polite">
            {ponto ? (
              <>
                <span>
                  Ponto marcado: <strong>{formatarCoordenada(ponto)}</strong> · bioma calculado:{" "}
                  <strong>{nomeDoBioma(entrada.biomaCodigo as BiomaCodigo)}</strong>
                </span>
                <button type="button" className={styles.secondaryButton} onClick={removerPonto}>
                  Remover ponto
                </button>
              </>
            ) : (
              <span>Nenhum ponto marcado: escolha o bioma na lista abaixo.</span>
            )}
          </div>
          {avisoPonto ? (
            <span className={styles.error} role="alert">
              {avisoPonto}
            </span>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="campo-biomaCodigo" className={styles.label}>
            Bioma do local do resgate <span className={styles.required}>*</span>
          </label>
          <select {...propsDoCampo("biomaCodigo")} disabled={ponto !== null}>
            <option value="">Selecione</option>
            {CATALOGO_BIOMAS.map((bioma) => (
              <option key={bioma.codigo} value={bioma.codigo}>
                {bioma.nome}
              </option>
            ))}
          </select>
          <span className={styles.hint}>
            {ponto
              ? "Calculado pelo ponto marcado. Para escolher à mão, remova o ponto."
              : "Sem ponto, é gravado como escolha manual."}{" "}
            Não comprova a origem natural do animal nem autoriza soltura.
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
