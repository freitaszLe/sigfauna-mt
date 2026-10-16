"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatarData, formatarDataHora } from "@/lib/agregacoes";
import { atualizarResgates, useResgates } from "@/lib/armazenamento";
import {
  avaliacoesDaEtapa,
  FORMULARIOS,
  formularioDaEtapa,
  textoResposta,
  validarRespostas,
  type Formulario,
} from "@/lib/avaliacoes";
import {
  aplicarEncaminhamento,
  encaminhamentosPossiveis,
  validarEncaminhamento,
  type ErrosEncaminhamento,
} from "@/lib/fluxo";
import { rotuloOperador, useUsuario } from "@/lib/operador";
import type { Etapa, EventoHistorico, Resgate } from "@/lib/types";
import BiomaInfo from "./BiomaInfo";
import PageBlock from "./PageBlock";
import Paginacao, { usePaginacao } from "./Paginacao";
import blockStyles from "./PageBlock.module.css";
import StatusBadge from "./StatusBadge";
import { TOM_DA_ETAPA } from "./etapas";
import styles from "./Ficha.module.css";
import formStyles from "./Formulario.module.css";
import tableStyles from "./RecebimentosTable.module.css";

export default function FichaResgate() {
  const { id } = useParams<{ id: string }>();
  const { resgates, origem } = useResgates();
  const resgate = resgates.find((item) => item.id === id);

  if (origem === "inicial") {
    return (
      <PageBlock title="Ficha do resgate">
        <p className={blockStyles.notice} role="status">
          Carregando…
        </p>
      </PageBlock>
    );
  }

  if (!resgate) {
    return (
      <PageBlock title="Ficha do resgate">
        <p className={blockStyles.notice}>Resgate não encontrado.</p>
        <div className={formStyles.actions}>
          <BotaoVoltar />
        </div>
      </PageBlock>
    );
  }

  return (
    <PageBlock title={`Ficha do resgate ${resgate.protocolo}`}>
      <p className={styles.aviso}>
        O sistema registra a avaliação e o encaminhamento escolhidos pela equipe. A sugestão vem
        das respostas e precisa ser confirmada; não é diagnóstico nem autoriza soltura.
      </p>

      <dl className={styles.dados}>
        <div>
          <dt>Etapa atual</dt>
          <dd>
            <StatusBadge label={resgate.etapa} tone={TOM_DA_ETAPA[resgate.etapa]} />
          </dd>
        </div>
        <div>
          <dt>Espécie</dt>
          <dd>
            {resgate.especie} ({resgate.grupo})
          </dd>
        </div>
        <div>
          <dt>Identificação</dt>
          <dd>{resgate.identificacao}</dd>
        </div>
        <div>
          <dt>Bioma do local do resgate</dt>
          <dd>
            <BiomaInfo resgate={resgate} />
          </dd>
        </div>
        <div>
          <dt>Data do resgate</dt>
          <dd>{formatarData(resgate.dataResgate)}</dd>
        </div>
        <div>
          <dt>Observação do recebimento</dt>
          <dd>{resgate.observacao || "—"}</dd>
        </div>
      </dl>

      {/* key reinicia as abas e o formulário quando a etapa muda */}
      <AbasDeAvaliacao key={resgate.etapa} resgate={resgate} />

      <h2 className={blockStyles.sectionTitle}>Histórico</h2>
      <TabelaHistorico resgate={resgate} />
    </PageBlock>
  );
}

function BotaoVoltar() {
  return (
    <Link href="/acompanhamento" className={blockStyles.dangerButton}>
      Voltar
    </Link>
  );
}

type SituacaoAba = "atual" | "registrada" | "indisponivel";

function situacaoDaAba(resgate: Resgate, formulario: Formulario): SituacaoAba {
  if (resgate.etapa === formulario.etapa) return "atual";
  return avaliacoesDaEtapa(resgate, formulario.etapa).length > 0 ? "registrada" : "indisponivel";
}

/** Uma aba por etapa: a atual abre o formulário; as anteriores mostram as respostas. */
function AbasDeAvaliacao({ resgate }: { resgate: Resgate }) {
  const inicial =
    formularioDaEtapa(resgate.etapa)?.etapa ??
    [...FORMULARIOS].reverse().find((f) => situacaoDaAba(resgate, f) === "registrada")?.etapa ??
    FORMULARIOS[0].etapa;
  const [selecionada, setSelecionada] = useState<Etapa>(inicial);
  const formulario = formularioDaEtapa(selecionada) ?? FORMULARIOS[0];
  const situacao = situacaoDaAba(resgate, formulario);
  const registradas = avaliacoesDaEtapa(resgate, formulario.etapa);

  return (
    <section className={styles.avaliacao} aria-label="Avaliação por etapa">
      <div className={styles.abas} role="tablist" aria-label="Etapas">
        {FORMULARIOS.map((f) => {
          const s = situacaoDaAba(resgate, f);
          const ativa = f.etapa === selecionada;
          return (
            <button
              key={f.etapa}
              type="button"
              role="tab"
              id={`aba-${f.aba}`}
              aria-selected={ativa}
              aria-controls="painel-aba"
              disabled={s === "indisponivel"}
              className={`${styles.aba} ${ativa ? styles.abaAtiva : ""}`}
              title={s === "indisponivel" ? "Etapa ainda não alcançada ou não percorrida" : undefined}
              aria-label={
                s === "atual"
                  ? `${f.aba} (etapa atual)`
                  : s === "registrada"
                    ? `${f.aba} (avaliação registrada)`
                    : `${f.aba} (indisponível)`
              }
              onClick={() => setSelecionada(f.etapa)}
            >
              {f.aba}
              {s === "atual" ? <span className={styles.marcaAtual}>atual</span> : null}
              {s === "registrada" ? <span className={styles.marcaFeita} aria-hidden="true">✓</span> : null}
            </button>
          );
        })}
      </div>

      <div className={styles.painelAba} role="tabpanel" id="painel-aba" aria-labelledby={`aba-${formulario.aba}`}>
        <h2 className={blockStyles.sectionTitle}>{formulario.titulo}</h2>

        {registradas.map((evento) => (
          <RespostasRegistradas key={evento.dataHora} formulario={formulario} evento={evento} />
        ))}

        {situacao === "atual" ? (
          <FormularioAvaliacao resgate={resgate} formulario={formulario} />
        ) : null}

        {resgate.etapa === "Concluído" ? (
          <>
            <p className={blockStyles.notice}>Caso concluído: não há próximas etapas.</p>
            <div className={formStyles.actions}>
              <BotaoVoltar />
            </div>
          </>
        ) : situacao !== "atual" ? (
          <div className={formStyles.actions}>
            <BotaoVoltar />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function descreverEncaminhamento(evento: EventoHistorico): string {
  if (evento.tipo === "avaliacao") return `Permaneceu em "${evento.para}"`;
  return `Encaminhado para "${evento.para}"`;
}

function RespostasRegistradas({
  formulario,
  evento,
}: {
  formulario: Formulario;
  evento: EventoHistorico;
}) {
  return (
    <article className={styles.registro}>
      <p className={styles.registroCabecalho}>
        <strong>{formatarDataHora(evento.dataHora)}</strong> · {evento.operador} ·{" "}
        {descreverEncaminhamento(evento)}
      </p>
      {evento.respostas ? (
        <dl className={styles.respostas}>
          {formulario.campos.map((campo) => (
            <div key={campo.id}>
              <dt>{campo.rotulo}</dt>
              <dd>{textoResposta(campo, evento.respostas?.[campo.id])}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={formStyles.hint}>Sem respostas de formulário neste registro.</p>
      )}
      <p className={styles.registroObservacao}>Observação: {evento.observacao}</p>
    </article>
  );
}

function FormularioAvaliacao({
  resgate,
  formulario,
}: {
  resgate: Resgate;
  formulario: Formulario;
}) {
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [destinoEscolhido, setDestinoEscolhido] = useState<Etapa | null>(null);
  const [observacao, setObservacao] = useState("");
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});
  const [errosEnc, setErrosEnc] = useState<ErrosEncaminhamento>({});
  const sessaoUsuario = useUsuario();

  const completas = formulario.campos.every((campo) => (respostas[campo.id] ?? "").trim());
  const sugestao = completas ? formulario.sugerir(respostas) : null;
  const destino = destinoEscolhido ?? sugestao;
  const possiveis = encaminhamentosPossiveis(resgate.etapa);

  function rotuloDestino(etapa: Etapa): string {
    return etapa === resgate.etapa ? `Permanecer em "${etapa}"` : etapa;
  }

  function alterar(id: string, valor: string) {
    setRespostas((atuais) => ({ ...atuais, [id]: valor }));
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados = validarRespostas(formulario, respostas);
    const encontradosEnc = validarEncaminhamento(resgate, destino ?? "", observacao);
    setErrosCampos(encontrados);
    setErrosEnc(encontradosEnc);
    if (Object.keys(encontrados).length > 0 || Object.keys(encontradosEnc).length > 0 || !destino) {
      return;
    }

    const normalizadas = Object.fromEntries(
      formulario.campos.map((campo) => {
        const valor = respostas[campo.id].trim();
        return [campo.id, campo.tipo === "numero" ? valor.replace(",", ".") : valor];
      }),
    );
    const permanece = destino === resgate.etapa;
    const diferente = sugestao && destino !== sugestao ? ` (sugestão era ${rotuloDestino(sugestao)})` : "";

    // SweetAlert2 com o layout padrão da biblioteca; só os textos estão em português.
    const { default: Swal } = await import("sweetalert2");
    const confirmacao = await Swal.fire({
      title: "Confirmar avaliação?",
      text: permanece
        ? `${resgate.protocolo}: a avaliação será registrada e o caso permanece em "${resgate.etapa}"${diferente}.`
        : `${resgate.protocolo}: ${resgate.etapa} → ${destino}${diferente}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacao.isConfirmed) return;

    const rotulo =
      sessaoUsuario.situacao === "presente" ? rotuloOperador(sessaoUsuario.usuario) : undefined;
    atualizarResgates((atuais) =>
      atuais.map((item) =>
        item.id === resgate.id &&
        Object.keys(validarEncaminhamento(item, destino, observacao)).length === 0
          ? aplicarEncaminhamento(item, destino, observacao, normalizadas, new Date(), rotulo)
          : item,
      ),
    );

    await Swal.fire({
      title: permanece ? "Avaliação registrada" : "Etapa atualizada",
      text: permanece
        ? `${resgate.protocolo} continua em "${resgate.etapa}".`
        : `${resgate.protocolo} agora está em "${destino}".`,
      icon: "success",
      confirmButtonText: "OK",
    });

    // Permanecendo na etapa, o formulário volta vazio para a próxima avaliação.
    setRespostas({});
    setDestinoEscolhido(null);
    setObservacao("");
  }

  return (
    <form className={formStyles.form} onSubmit={enviar} noValidate aria-label={formulario.titulo}>
      <div className={formStyles.grid}>
        {formulario.campos.map((campo) => {
          const idCampo = `avaliacao-${campo.id}`;
          const erro = errosCampos[campo.id];
          return (
            <div key={campo.id} className={formStyles.field}>
              <label htmlFor={idCampo} className={formStyles.label}>
                {campo.rotulo}
                {campo.tipo === "numero" ? ` (${campo.unidade})` : ""}{" "}
                <span className={formStyles.required}>*</span>
              </label>
              {campo.tipo === "escolha" ? (
                <select
                  id={idCampo}
                  className={formStyles.input}
                  value={respostas[campo.id] ?? ""}
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? `erro-${idCampo}` : undefined}
                  onChange={(e) => alterar(campo.id, e.target.value)}
                >
                  <option value="">Selecione</option>
                  {campo.opcoes.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={idCampo}
                  className={formStyles.input}
                  inputMode={campo.tipo === "numero" ? "decimal" : undefined}
                  placeholder={campo.tipo === "texto" ? campo.dica : undefined}
                  value={respostas[campo.id] ?? ""}
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? `erro-${idCampo}` : undefined}
                  onChange={(e) => alterar(campo.id, e.target.value)}
                />
              )}
              {erro ? (
                <span id={`erro-${idCampo}`} className={formStyles.error} role="alert">
                  {erro}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className={styles.sugestao} aria-live="polite">
        {sugestao ? (
          <>
            Encaminhamento sugerido pelas respostas: <strong>{rotuloDestino(sugestao)}</strong>
          </>
        ) : (
          "Responda o formulário para ver o encaminhamento sugerido."
        )}
      </div>

      <div className={formStyles.grid}>
        <div className={formStyles.field}>
          <label htmlFor="campo-encaminhamento" className={formStyles.label}>
            Encaminhamento <span className={formStyles.required}>*</span>
          </label>
          <select
            id="campo-encaminhamento"
            className={formStyles.input}
            value={destino ?? ""}
            disabled={!sugestao}
            aria-invalid={errosEnc.destino ? true : undefined}
            aria-describedby={errosEnc.destino ? "erro-encaminhamento" : undefined}
            onChange={(e) => setDestinoEscolhido((e.target.value || null) as Etapa | null)}
          >
            {!sugestao ? <option value="">Aguardando respostas</option> : null}
            {possiveis.map((etapa) => (
              <option key={etapa} value={etapa}>
                {rotuloDestino(etapa)}
                {etapa === sugestao ? " (sugerido)" : ""}
              </option>
            ))}
          </select>
          <span className={formStyles.hint}>
            A equipe confirma ou escolhe outro caminho permitido a partir de &quot;{resgate.etapa}
            &quot;.
          </span>
          {errosEnc.destino ? (
            <span id="erro-encaminhamento" className={formStyles.error} role="alert">
              {errosEnc.destino}
            </span>
          ) : null}
        </div>

        <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
          <label htmlFor="campo-observacao-avaliacao" className={formStyles.label}>
            Observação <span className={formStyles.required}>*</span>
          </label>
          <textarea
            id="campo-observacao-avaliacao"
            rows={2}
            className={formStyles.input}
            value={observacao}
            aria-invalid={errosEnc.observacao ? true : undefined}
            aria-describedby={errosEnc.observacao ? "erro-observacao-avaliacao" : undefined}
            onChange={(e) => setObservacao(e.target.value)}
          />
          {errosEnc.observacao ? (
            <span id="erro-observacao-avaliacao" className={formStyles.error} role="alert">
              {errosEnc.observacao}
            </span>
          ) : null}
        </div>
      </div>

      <div className={formStyles.actions}>
        <button type="submit" className={blockStyles.primaryButton}>
          Registrar avaliação
        </button>
        <BotaoVoltar />
      </div>
    </form>
  );
}

function descreverEvento(evento: EventoHistorico): string {
  if (evento.tipo === "entrada") return `Entrada: ${evento.para}`;
  if (evento.tipo === "avaliacao") return `Avaliação em ${evento.para} (permanece)`;
  return `${evento.de} → ${evento.para}`;
}

/** Histórico em ordem cronológica, com até 5 eventos por página. */
function TabelaHistorico({ resgate }: { resgate: Resgate }) {
  const paginacao = usePaginacao(resgate.historico);
  const total = resgate.historico.length;
  return (
    <div>
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <caption className={tableStyles.caption}>
            {total} {total === 1 ? "evento" : "eventos"}, do mais antigo para o mais recente
          </caption>
          <thead>
            <tr>
              <th scope="col">Data e hora</th>
              <th scope="col">Registro</th>
              <th scope="col">Observação</th>
              <th scope="col">Operador</th>
            </tr>
          </thead>
          <tbody>
            {paginacao.itensDaPagina.map((evento) => (
              <tr key={`${evento.dataHora}-${evento.tipo}-${evento.para}`}>
                <td>{formatarDataHora(evento.dataHora)}</td>
                <td>{descreverEvento(evento)}</td>
                <td>{evento.observacao}</td>
                <td>{evento.operador}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacao
        pagina={paginacao.pagina}
        totalPaginas={paginacao.totalPaginas}
        primeiro={paginacao.primeiro}
        ultimo={paginacao.ultimo}
        total={paginacao.total}
        onMudar={paginacao.setPagina}
        rotulo="Paginação do histórico"
      />
    </div>
  );
}
