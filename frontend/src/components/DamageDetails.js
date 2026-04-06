function DamageDetails({ detections }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-glow">
      <h3 className="mb-4 text-lg font-semibold text-white">Per Damage Details</h3>
      <div className="space-y-3">
        {detections.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-slate-400">No visible damage detected.</div>
        ) : (
          detections.map((item, index) => (
            <div key={`${item.label}-${index}`} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-[18px_1fr_auto_auto_auto] md:items-center">
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color_hex }} />
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-400">
                  Box: ({item.bounding_box.x1}, {item.bounding_box.y1}) to ({item.bounding_box.x2}, {item.bounding_box.y2})
                </p>
              </div>
              <p className="text-sm text-slate-300">{item.confidence_percent.toFixed(2)}%</p>
              <p className="text-sm text-slate-300">{item.area_percent.toFixed(2)}%</p>
              <p className="text-sm font-semibold text-emerald-300">${item.estimated_cost.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DamageDetails;
