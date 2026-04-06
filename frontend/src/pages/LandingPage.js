import { Link } from "react-router-dom";

function FeatureCard({ title, text, number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-glow">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{number}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function LandingPage() {
  const marquee = [
    "object detection",
    "damage segmentation",
    "repair estimates",
    "claims reports",
    "history tracking",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-emerald-400/14 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-96 w-96 rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-slate-950/45 px-5 py-3 backdrop-blur">
          <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            ClaimVision AI
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <span>Platform</span>
            <span>Features</span>
            <span>Reports</span>
            <span>Security</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200" to="/login">
              Login
            </Link>
          </div>
        </header>

        <section className="grid min-h-[calc(100vh-7rem)] items-center gap-10 py-10 xl:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-300">
              AI Car Damage Detection And Insurance Report System
            </p>
            <h1 className="mt-6 max-w-4xl text-6xl font-semibold leading-[1.02] tracking-[-0.04em] text-white">
              A real claims workflow for visual damage assessment.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Detect visible vehicle damage, quantify severity, estimate repair cost, and generate insurer-ready reports through one production-style dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 px-6 py-3 font-semibold text-slate-950" to="/login">
                Login To Workspace
              </Link>
            </div>

            <div className="mt-10 overflow-hidden rounded-full border border-white/10 bg-slate-950/45 py-3">
              <div className="auth-marquee">
                {[...marquee, ...marquee].map((item, index) => (
                  <span key={`${item}-${index}`} className="auth-marquee-item">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2.6rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/70 p-6 shadow-glow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Platform Preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Inspection, analytics, and reporting</h2>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                live
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-slate-800 bg-[linear-gradient(145deg,#08111f_0%,#11213c_45%,#0b1220_100%)] p-5">
              <div className="grid gap-4 lg:grid-cols-[1.24fr_0.76fr]">
                <div className="rounded-[1.7rem] border border-slate-700 bg-slate-950/35 p-4">
                  <div className="relative h-64 overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_15%_20%,rgba(74,222,128,0.12),transparent_24%),linear-gradient(160deg,#131c2a,#09111c)]">
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/5 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                      <span>Vehicle Scan</span>
                      <span>YOLOv8</span>
                    </div>
                    <div className="absolute left-8 top-16 h-28 w-44 rounded-[1.4rem] border-2 border-rose-400/80" />
                    <div className="absolute left-24 top-32 h-12 w-28 rounded-xl border border-amber-300/80" />
                    <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-700 bg-slate-950/75 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Damage</p>
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
                  <div className="rounded-[1.55rem] border border-slate-700 bg-slate-950/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Severity</p>
                    <p className="mt-3 text-3xl font-semibold text-white">Moderate</p>
                  </div>
                  <div className="rounded-[1.55rem] border border-slate-700 bg-slate-950/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated Cost</p>
                    <p className="mt-3 text-3xl font-semibold text-emerald-300">$1,240</p>
                  </div>
                  <div className="rounded-[1.55rem] border border-slate-700 bg-slate-950/55 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Output</p>
                    <p className="mt-3 text-xl font-semibold text-white">PDF + history</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-12 md:grid-cols-3">
          <FeatureCard
            number="01"
            title="Review Faster"
            text="Bounding boxes, masks, cost logic, and severity scoring are presented in a workflow designed for fast assessment."
          />
          <FeatureCard
            number="02"
            title="Explain Better"
            text="Generate a professional narrative summary with repair recommendations and claim-style reasoning."
          />
          <FeatureCard
            number="03"
            title="Export Cleanly"
            text="Produce downloadable PDF reports with damage tables, metrics, annotated images, and structured findings."
          />
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
