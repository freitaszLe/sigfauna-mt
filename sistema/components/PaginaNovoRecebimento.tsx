"use client";

import { useRouter } from "next/navigation";
import { useResgates } from "@/lib/armazenamento";
import FormularioRecebimento from "./FormularioRecebimento";
import PageBlock from "./PageBlock";
import blockStyles from "./PageBlock.module.css";

export default function PaginaNovoRecebimento() {
  const router = useRouter();
  const { origem } = useResgates();
  const voltarParaLista = () => router.push("/resgates");

  return (
    <PageBlock title="Novo recebimento">
      {/* O formulário usa a data de hoje e os dados da sessão; só monta no navegador. */}
      {origem === "inicial" ? (
        <p className={blockStyles.notice} role="status">
          Carregando…
        </p>
      ) : (
        <FormularioRecebimento onCancelar={voltarParaLista} onRegistrado={voltarParaLista} />
      )}
    </PageBlock>
  );
}
