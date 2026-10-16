"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatarData, formatarDataHora } from "@/lib/agregacoes";
import { atualizarResgates, useResgates } from "@/lib/armazenamento";
import { nomeDoBioma } from "@/lib/dados";
import {
  aplicarTransicao,
  destinosPermitidos,
  validarTransicao,
  type ErrosTransicao,
} from "@/lib/fluxo";
import type { Etapa, Resgate } from "@/lib/types";
import PageBlock from "./PageBlock";
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
          Carregando dados da sessão…
        </p>
      </PageBlock>
    );
  }

  if (!resgate) {
    return (
      <PageBlock title="Ficha do resgate">
        <p className={blockStyles.notice}>Resgate não encontrado nesta sessão.</p>
        <div className={formStyles.actions}>
          <BotaoVoltar />
        </div>
      </PageBlock>
    );
  }

  return (
    <PageBlock title={`Ficha do resgate ${resgate.protocolo}`}>
      <p className={styles.aviso}>
        O sistema registra uma escolha humana. Não faz diagnóstico, decisão clínica nem autoriza
        soltura. Histórico temporário desta aba, não é auditoria institucional.
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
            {nomeDoBioma(resgate.biomaCodigo)} ({resgate.metodoIdentificacaoBioma})
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

      {/* key reinicia o formulário quando a etapa muda */}
      <MudancaDeEtapa key={resgate.etapa} resgate={resgate} />

      <h2 className={blockStyles.sectionTitle}>Histórico</h2>
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <caption className={tableStyles.caption}>
            {resgate.historico.length} {resgate.historico.length === 1 ? "evento" : "eventos"}, do
            mais antigo para o mais recente
          </caption>
          <thead>
            <tr>
              <th scope="col">Data e hora</th>
              <th scope="col">Mudança</th>
              <th scope="col">Observação</th>
              <th scope="col">Operador</th>
            </tr>
          </thead>
          <tbody>
            {resgate.historico.map((evento, indice) => (
              <tr key={`${evento.dataHora}-${indice}`}>
                <td>{formatarDataHora(evento.dataHora)}</td>
                <td>{evento.de ? `${evento.de} → ${evento.para}` : `Entrada: ${evento.para}`}</td>
                <td>{evento.observacao}</td>
                <td>{evento.operador}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function MudancaDeEtapa({ resgate }: { resgate: Resgate }) {
  const permitidos = destinosPermitidos(resgate.etapa);
  const [destino, setDestino] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erros, setErros] = useState<ErrosTransicao>({});

  if (permitidos.length === 0) {
    return (
      <>
        <p className={blockStyles.notice}>Caso concluído: não há próximas etapas.</p>
        <div className={formStyles.actions}>
          <BotaoVoltar />
        </div>
      </>
    );
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados = validarTransicao(resgate, destino, observacao);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    // SweetAlert2 com o layout padrão da biblioteca; só os textos estão em português.
    const { default: Swal } = await import("sweetalert2");
    const confirmacao = await Swal.fire({
      title: "Confirmar mudança de etapa?",
      text: `${resgate.protocolo}: ${resgate.etapa} → ${destino}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacao.isConfirmed) return;

    atualizarResgates((atuais) =>
      atuais.map((item) =>
        item.id === resgate.id &&
        Object.keys(validarTransicao(item, destino, observacao)).length === 0
          ? aplicarTransicao(item, destino as Etapa, observacao, new Date())
          : item,
      ),
    );

    await Swal.fire({
      title: "Etapa atualizada",
      text: `${resgate.protocolo} agora está em "${destino}".`,
      icon: "success",
      confirmButtonText: "OK",
    });
  }

  return (
    <form className={formStyles.form} onSubmit={enviar} noValidate aria-label="Mudar etapa">
      <h2 className={blockStyles.sectionTitle}>Mudar etapa</h2>
      <div className={formStyles.grid}>
        <div className={formStyles.field}>
          <label htmlFor="campo-destino" className={formStyles.label}>
            Próxima etapa <span className={formStyles.required}>*</span>
          </label>
          <select
            id="campo-destino"
            name="destino"
            className={formStyles.input}
            value={destino}
            aria-invalid={erros.destino ? true : undefined}
            aria-describedby={erros.destino ? "erro-destino" : undefined}
            onChange={(e) => setDestino(e.target.value)}
          >
            <option value="">Selecione</option>
            {permitidos.map((etapa) => (
              <option key={etapa} value={etapa}>
                {etapa}
              </option>
            ))}
          </select>
          <span className={formStyles.hint}>
            Caminhos permitidos a partir de &quot;{resgate.etapa}&quot;: {permitidos.join(", ")}.
          </span>
          {erros.destino ? (
            <span id="erro-destino" className={formStyles.error} role="alert">
              {erros.destino}
            </span>
          ) : null}
        </div>

        <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
          <label htmlFor="campo-observacao-etapa" className={formStyles.label}>
            Observação <span className={formStyles.required}>*</span>
          </label>
          <textarea
            id="campo-observacao-etapa"
            name="observacao"
            rows={2}
            className={formStyles.input}
            value={observacao}
            aria-invalid={erros.observacao ? true : undefined}
            aria-describedby={erros.observacao ? "erro-observacao-etapa" : undefined}
            onChange={(e) => setObservacao(e.target.value)}
          />
          {erros.observacao ? (
            <span id="erro-observacao-etapa" className={formStyles.error} role="alert">
              {erros.observacao}
            </span>
          ) : null}
        </div>
      </div>
      <div className={formStyles.actions}>
        <button type="submit" className={blockStyles.primaryButton}>
          Registrar mudança
        </button>
        <BotaoVoltar />
      </div>
    </form>
  );
}
