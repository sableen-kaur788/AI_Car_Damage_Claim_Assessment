function HistoryPanel({ items, apiBaseUrl, onDownload }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Detection History</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Previous inspections</h2>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-slate-400">
            No inspections yet. Upload an image to create the first report.
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 xl:grid-cols-[120px_1fr]">
              <img src={`${apiBaseUrl}${item.annotated_image_url}`} alt="Annotated result" className="h-full min-h-28 w-full rounded-2xl object-cover" />
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-white">{item.severity}</strong>
                  <span className="font-semibold text-emerald-300">${item.total_estimated_cost.toFixed(2)}</span>
                </div>
                <p className="text-sm text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                <p className="text-sm text-slate-300">{item.detections.map((detection) => detection.label).join(", ") || "No damage detected"}</p>
                {item.report_id ? (
                  <button
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100"
                    onClick={() => onDownload(item.report_id)}
                  >
                    Download PDF
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default HistoryPanel;
