import { useEffect, useState } from "react";
import AnalyticsCharts from "../components/AnalyticsCharts";
import DamageDetails from "../components/DamageDetails";
import HistoryPanel from "../components/HistoryPanel";
import ReportPanel from "../components/ReportPanel";
import SummaryCards from "../components/SummaryCards";
import api from "../services/api";
import { clearSession, getStoredUser } from "../services/auth";
import { getApiErrorMessage } from "../services/errors";

const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

function DashboardPage() {
  const [user, setUser] = useState(getStoredUser());
  const [selectedFile, setSelectedFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [error, setError] = useState("");

  const fetchProfileAndHistory = async () => {
    setFetchingHistory(true);
    try {
      const [profileResponse, historyResponse] = await Promise.all([api.get("/auth/me"), api.get("/history")]);
      setUser(profileResponse.data);
      setHistory(historyResponse.data);
      if (!result && historyResponse.data.length > 0) {
        setResult(historyResponse.data[0]);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load dashboard data."));
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchProfileAndHistory();
  }, []);

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please choose an image before running analysis.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await api.post("/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data.analysis);
      await fetchProfileAndHistory();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Analysis failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await api.get(`/report/pdf/${reportId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `insurance-report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to download report."));
    }
  };

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen px-4 py-6 lg:px-8">
      <header className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">AI Car Damage Detection and Insurance Report System</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Claims dashboard</h1>
          <p className="mt-2 text-slate-400">{user ? `${user.full_name} | ${user.email}` : "Loading user..."}</p>
        </div>
        <button className="rounded-full border border-slate-700 px-5 py-3 text-sm font-medium text-slate-100" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="mx-auto mt-6 max-w-7xl rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-glow">
        <div className="hero-copy">
          <h2 className="text-2xl font-semibold text-white">Run a new inspection</h2>
          <p className="mt-2 max-w-3xl text-slate-400">Upload a vehicle image to detect visible damage, estimate severity and cost, generate charts, and create an insurer-ready PDF report.</p>
        </div>

        <form className="mt-6 grid gap-4 xl:grid-cols-[1fr_auto]" onSubmit={handleAnalyze}>
          <label className="flex min-h-32 cursor-pointer items-center justify-center rounded-[1.75rem] border border-dashed border-slate-700 bg-slate-950/70 px-5 py-6 text-center text-slate-300">
            <input className="hidden" type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
            <span>{selectedFile ? selectedFile.name : "Choose a JPG, PNG, WEBP, or AVIF image"}</span>
          </label>
          <button
            className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-6 py-4 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </form>

        {error ? <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      </section>

      <main className="mx-auto mt-6 max-w-7xl space-y-6">
        <SummaryCards
          summary={
            result?.summary || {
              total_damages: 0,
              total_cost: 0,
              severity: "N/A",
              average_confidence: 0,
            }
          }
        />

        {result ? (
          <>
            <ReportPanel result={result} apiBaseUrl={apiBaseUrl} onDownload={handleDownload} />
            <AnalyticsCharts charts={result.charts} />
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <DamageDetails detections={result.detections} />
              <HistoryPanel items={history} apiBaseUrl={apiBaseUrl} onDownload={handleDownload} />
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400 shadow-glow">
            Upload an image to generate AI damage detection, interactive charts, and an insurance report.
          </div>
        )}

        {result ? null : <HistoryPanel items={history} apiBaseUrl={apiBaseUrl} onDownload={handleDownload} />}
        {fetchingHistory ? <div className="text-center text-sm text-slate-400">Refreshing dashboard data...</div> : null}
      </main>
    </div>
  );
}

export default DashboardPage;
