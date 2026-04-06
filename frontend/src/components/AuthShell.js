function AuthShell({
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
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-emerald-400/16 blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-cyan-400/16 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            ClaimVision AI
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-8rem)] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden rounded-[2.4rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/70 p-8 shadow-glow lg:block">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-300">
              AI Car Damage Detection And Insurance Report System
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-white">
              Sign in to your claims workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Access your inspection dashboard, previous reports, damage analytics, and PDF exports from one secure place.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/45 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Inside the workspace</p>
                <p className="mt-3 text-lg font-semibold text-white">Detection history, annotated outputs, repair estimates, and insurer-ready narratives.</p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/45 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Security</p>
                <p className="mt-3 text-lg font-semibold text-white">JWT-protected access with account recovery and persistent report tracking.</p>
              </div>
            </div>
          </section>

          <div className="rounded-[2.4rem] border border-white/10 bg-slate-900/85 p-8 shadow-glow backdrop-blur xl:p-10">
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
    </div>
  );
}

export default AuthShell;
