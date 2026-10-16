import styles from "./StatCard.module.css";

export type Tone = "info" | "danger" | "warning" | "success";

type StatCardProps = {
  label: string;
  value: number;
  tone: Tone;
};

export default function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[tone]}`}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
