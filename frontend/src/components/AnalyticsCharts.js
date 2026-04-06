import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function ChartCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-glow">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <div className="h-72">{children}</div>
    </div>
  );
}

function buildPieData(items) {
  return {
    labels: items.map((item) => item.name),
    datasets: [
      {
        data: items.map((item) => item.value),
        backgroundColor: items.map((item) => item.color),
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  };
}

function buildBarData(items, dataKey) {
  return {
    labels: items.map((item) => item.name),
    datasets: [
      {
        label: dataKey,
        data: items.map((item) => item[dataKey]),
        backgroundColor: items.map((item) => item.color),
        borderRadius: 10,
      },
    ],
  };
}

function buildLineData(items, dataKey, label, fillColor, strokeColor) {
  return {
    labels: items.map((item) => item.name),
    datasets: [
      {
        label,
        data: items.map((item) => item[dataKey]),
        borderColor: strokeColor,
        backgroundColor: fillColor,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: strokeColor,
      },
    ],
  };
}

const darkOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#cbd5e1",
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8" },
      grid: { color: "#223150" },
    },
    y: {
      ticks: { color: "#94a3b8" },
      grid: { color: "#223150" },
    },
  },
};

function AnalyticsCharts({ charts }) {
  const distribution = charts?.damage_distribution || [];
  const costPerDamage = charts?.cost_per_damage || [];
  const confidenceScores = charts?.confidence_scores || [];
  const areaPercentages = charts?.area_percentages || [];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Damage Type Distribution">
        <Pie data={buildPieData(distribution)} options={{ ...darkOptions, scales: undefined }} />
      </ChartCard>

      <ChartCard title="Cost Per Damage Type">
        <Bar data={buildBarData(costPerDamage, "cost")} options={darkOptions} />
      </ChartCard>

      <ChartCard title="Confidence Scores">
        <Bar
          data={buildBarData(confidenceScores, "confidence")}
          options={{ ...darkOptions, scales: { ...darkOptions.scales, y: { ...darkOptions.scales.y, min: 0, max: 100 } } }}
        />
      </ChartCard>

      <ChartCard title="Area Percentage Per Damage">
        <Line
          data={buildLineData(areaPercentages, "area", "Area %", "rgba(34, 197, 94, 0.25)", "#4ade80")}
          options={darkOptions}
        />
      </ChartCard>
    </div>
  );
}

export default AnalyticsCharts;
