function SummaryCards({ summary }) {
  const cards = [
    { label: "Total Damages", value: summary.total_damages },
    { label: "Total Cost", value: `$${summary.total_cost.toFixed(2)}` },
    { label: "Severity", value: summary.severity },
    { label: "Average Confidence", value: `${summary.average_confidence.toFixed(2)}%` },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-glow">
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
