export function KpiCards({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((x) => (
        <article key={x.label} className="card">
          <p className="text-xs text-slate-400">{x.label}</p>
          <p className="text-xl font-semibold">{x.value}</p>
        </article>
      ))}
    </div>
  );
}
