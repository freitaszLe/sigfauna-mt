import type { ReactNode } from "react";
import styles from "./PageBlock.module.css";

type PageBlockProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function PageBlock({ title, actions, children }: PageBlockProps) {
  return (
    <section className={styles.block}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
