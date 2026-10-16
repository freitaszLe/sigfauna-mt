import StatusBadge from "./StatusBadge";
import type { Tone } from "./StatCard";
import styles from "./ExampleTable.module.css";

// Linhas fixas apenas para mostrar o layout. Não são registros do sistema:
// os dados fictícios e as regiões verificadas entram nas etapas 05 e 08.
const EXAMPLE_ROWS: {
  id: string;
  species: string;
  group: string;
  region: string;
  status: { label: string; tone: Tone };
  receivedAt: string;
}[] = [
  {
    id: "EX-1",
    species: "Espécie de exemplo A",
    group: "Ave",
    region: "Região de exemplo 1",
    status: { label: "Recebido", tone: "info" },
    receivedAt: "01/01/2026",
  },
  {
    id: "EX-2",
    species: "Espécie de exemplo B",
    group: "Mamífero",
    region: "Região de exemplo 2",
    status: { label: "Em tratamento", tone: "warning" },
    receivedAt: "02/01/2026",
  },
  {
    id: "EX-3",
    species: "Espécie de exemplo C",
    group: "Réptil",
    region: "Região de exemplo 1",
    status: { label: "Óbito", tone: "danger" },
    receivedAt: "03/01/2026",
  },
  {
    id: "EX-4",
    species: "Espécie de exemplo D",
    group: "Ave",
    region: "Região de exemplo 3",
    status: { label: "Soltura", tone: "success" },
    receivedAt: "04/01/2026",
  },
];

export default function ExampleTable() {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          Exemplo de layout — dados ilustrativos, não são registros
        </caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Espécie</th>
            <th scope="col">Região</th>
            <th scope="col">Situação</th>
            <th scope="col">Recebido em</th>
          </tr>
        </thead>
        <tbody>
          {EXAMPLE_ROWS.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>
                {row.species}
                <span className={styles.secondary}>{row.group}</span>
              </td>
              <td>{row.region}</td>
              <td>
                <StatusBadge label={row.status.label} tone={row.status.tone} />
              </td>
              <td>{row.receivedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
