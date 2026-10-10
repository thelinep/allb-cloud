import type { ReactNode } from "react";

export function Panel({ title, eyebrow, children, label }: { title: string; eyebrow?: string; children: ReactNode; label?: string }) {
  return (
    <section className="m-panel" aria-label={label ?? title}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Pending({ children }: { children: ReactNode }) {
  return <p className="m-pending"><span aria-hidden="true">◌</span> <strong>Pending.</strong> {children}</p>;
}

export function Facts({ rows, label }: { rows: [string, ReactNode][]; label: string }) {
  return (
    <dl className="m-facts" aria-label={label}>
      {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  );
}

export function ErrorNote({ error }: { error: string }) {
  return <p className="m-error" role="alert">Unavailable: {error}. Nothing is shown in its place.</p>;
}
