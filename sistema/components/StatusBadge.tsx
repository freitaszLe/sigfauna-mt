import type { Tone } from "./StatCard";
import styles from "./StatusBadge.module.css";

type StatusBadgeProps = {
  label: string;
  tone: Tone;
};

export default function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}
