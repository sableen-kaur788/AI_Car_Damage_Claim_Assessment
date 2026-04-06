function ReportPanel({ result, apiBaseUrl, onDownload }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Insurance Report</h3>
          <p className="mt-1 text-sm text-slate-400">Annotated output, narrative summary, and PDF export.</p>
        </div>
        <button
          className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-5 py-3 font-semibold text-slate-950"
          onClick={() => onDownload(result.report_id)}
        >
          Download PDF
        </button>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="mb-3 text-sm text-slate-400">Uploaded Image</p>
            <img className="w-full rounded-2xl object-cover" src={`${apiBaseUrl}${result.original_image_url}`} alt="Original upload" />
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="mb-3 text-sm text-slate-400">Annotated Image</p>
            <img className="w-full rounded-2xl object-cover" src={`${apiBaseUrl}${result.annotated_image_url}`} alt="Annotated output" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
          <p className="mb-3 text-sm text-slate-400">LLM Report Text</p>
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{result.llm_report}</pre>
        </div>
      </div>
    </div>
  );
}

export default ReportPanel;
