export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {title ? <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2> : null}
      {children}
    </section>
  );
}

