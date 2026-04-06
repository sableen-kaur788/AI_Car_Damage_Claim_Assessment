function AuthForm({
  title,
  subtitle,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel,
  error,
  helper,
  footer,
  loading,
}) {
  const movingWords = [
    "damage detection",
    "claims intelligence",
    "repair estimates",
    "insurance reports",
    "visual analytics",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-emerald-400/12 blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-orange-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden xl:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            AI Car Damage Detection
          </div>

          <div className="mt-8 max-w-3xl">
            <h1 className="text-6xl font-semibold leading-[1.02] tracking-[-0.03em] text-white">
              Visual vehicle claims, redesigned for modern insurance workflows.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Upload a vehicle photo, review annotated damage detection, estimate repair exposure, and export a report that actually looks ready for a claims desk.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-full border border-white/10 bg-slate-950/50 py-3">
            <div className="auth-marquee">
              {[...movingWords, ...movingWords].map((word, index) => (
                <span key={`${word}-${index}`} className="auth-marquee-item">
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2.25rem] border border-white/10 bg-slate-950/55 p-6 shadow-glow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Inspection Canvas</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">From upload to report in one flow</h2>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                  live
                </div>
              </div>

              <div className="mt-6 rounded-[1.9rem] border border-slate-800 bg-[linear-gradient(145deg,#08111f_0%,#0d1b31_45%,#0b1220_100%)] p-5">
                <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="rounded-[1.6rem] border border-slate-700 bg-slate-950/40 p-4">
                    <div className="relative h-56 overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_15%_20%,rgba(74,222,128,0.12),transparent_24%),linear-gradient(160deg,#131c2a,#09111c)]">
                      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/5 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                        <span>Vehicle Scan</span>
                        <span>Frame 01</span>
                      </div>
                      <div className="absolute left-10 top-16 h-28 w-40 rounded-[1.4rem] border-2 border-rose-400/80" />
                      <div className="absolute left-24 top-28 h-14 w-28 rounded-xl border border-amber-300/80" />
                      <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-700 bg-slate-950/75 px-3 py-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Detected</p>
                          <p className="mt-2 text-sm font-medium text-white">Dent</p>
                        </div>
                        <div className="rounded-2xl border border-slate-700 bg-slate-950/75 px-3 py-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Confidence</p>
                          <p className="mt-2 text-sm font-medium text-white">91.4%</p>
                        </div>
                        <div className="rounded-2xl border border-slate-700 bg-slate-950/75 px-3 py-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Area</p>
                          <p className="mt-2 text-sm font-medium text-white">12.8%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-slate-700 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Severity</p>
                      <p className="mt-3 text-3xl font-semibold text-white">Moderate</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-700 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated Cost</p>
                      <p className="mt-3 text-3xl font-semibold text-emerald-300">$1,240</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-700 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report Output</p>
                      <p className="mt-3 text-xl font-semibold text-white">PDF + dashboard history</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[2.25rem] border border-white/10 bg-slate-950/55 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Why it feels real</p>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-sm text-slate-400">Structured Review</p>
                    <p className="mt-2 text-lg font-semibold text-white">Annotated outputs, metrics, and cost estimation in one place</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-sm text-slate-400">Decision Support</p>
                    <p className="mt-2 text-lg font-semibold text-white">Severity, confidence, and insurer-style narrative summaries</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-sm text-slate-400">Operational Continuity</p>
                    <p className="mt-2 text-lg font-semibold text-white">Protected access, saved history, and downloadable reports</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Detect</p>
                  <p className="mt-3 text-2xl font-semibold text-white">AI</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estimate</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Cost</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Export</p>
                  <p className="mt-3 text-2xl font-semibold text-white">PDF</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-[2.25rem] border border-white/10 bg-slate-900/85 p-8 shadow-glow backdrop-blur xl:p-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">AI Claims Workspace</p>
              <h1 className="text-3xl font-semibold text-white">{title}</h1>
            </div>
            <div className="hidden rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-right sm:block">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Platform State</p>
              <p className="mt-1 text-sm font-medium text-emerald-300">Detection Ready</p>
            </div>
          </div>

          <p className="mt-4 max-w-md text-slate-400">{subtitle}</p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            {fields.map((field) => (
              <label key={field.name} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">{field.label}</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={onChange}
                  required
                />
              </label>
            ))}

            {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

            {helper ? <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">{helper}</div> : null}

            <button
              className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:translate-y-[-1px] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? "Please wait..." : submitLabel}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-500">
            <span>Secure Access</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>Damage Analytics</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>Claim Reports</span>
          </div>

          <div className="mt-6 text-sm text-slate-400">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
