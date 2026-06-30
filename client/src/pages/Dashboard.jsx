import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { api } from "../lib/api";
import { FileText, CheckCircle, AlertCircle, MapPin, Flag, Brain, RotateCcw, TrendingUp } from "lucide-react";

const SEVERITY_COLORS = {
  low: "#34D399",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

const STATUS_COLORS = {
  reported: "#5E6AD2",
  in_progress: "#6872D9",
  resolved: "#34D399",
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--fg-muted)]">{label}</p>
          <p className="text-3xl font-bold text-[var(--fg)] mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    api.get("/api/issues").then((res) => {
      if (res.success) setIssues(res.data);
      setLoading(false);
    });
  }, []);

  const fetchInsights = (force = false) => {
    setInsightsLoading(true);
    api.get(`/api/insights${force ? "?force=true" : ""}`).then((res) => {
      if (res.success) setInsights(res.data);
      setInsightsLoading(false);
    }).catch(() => setInsightsLoading(false));
  };

  useEffect(() => { fetchInsights(); }, []);

  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => i.status === "reported").length;
  const inProgressIssues = issues.filter((i) => i.status === "in_progress").length;
  const resolvedIssues = issues.filter((i) => i.status === "resolved").length;

  const byCategory = issues.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});

  const byStatus = { reported: openIssues, in_progress: inProgressIssues, resolved: resolvedIssues };
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(byStatus).map(([name, value]) => ({
    name: name.replace("_", " "), value, color: STATUS_COLORS[name],
  }));

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--fg-muted)]">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--fg)] tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-[var(--fg-muted)] mt-2">Overview of all community issues.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <StatCard label="Total Issues" value={totalIssues} icon={<FileText size={24} />} color="#5E6AD2" />
          <StatCard label="Open" value={openIssues} icon={<AlertCircle size={24} />} color="#5E6AD2" />
          <StatCard label="In Progress" value={inProgressIssues} icon={<Flag size={24} />} color="#6872D9" />
          <StatCard label="Resolved" value={resolvedIssues} icon={<CheckCircle size={24} />} color="#34D399" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Issues by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="var(--fg-muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--fg-muted)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#EDEDEF' }}
                />
                <Bar dataKey="value" fill="#5E6AD2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Issues by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData.filter((d) => d.value > 0)}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  dataKey="value" nameKey="name"
                  label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 30;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="var(--fg-muted)" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12}>
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
                >
                  {statusData.filter((d) => d.value > 0).map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#EDEDEF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-[var(--fg)] px-6 py-4 border-b border-white/[0.06]">Recent Issues</h2>
          <div className="divide-y divide-white/[0.04]">
            {issues.slice(0, 10).map((issue) => (
              <div key={issue.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--fg)] truncate">{issue.title}</h3>
                  <p className="text-sm text-[var(--fg-muted)] truncate">{issue.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: SEVERITY_COLORS[issue.severity] || "#6B7280" }}>
                    {issue.severity}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[issue.status] || "#6B7280" }}>
                    {issue.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-[var(--fg-subtle)] flex items-center gap-1">
                    <MapPin size={12} />
                    {issue.location?.lat?.toFixed(4)}, {issue.location?.lng?.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-[var(--accent)]" />
              <h2 className="text-lg font-semibold text-[var(--fg)]">AI Insights</h2>
            </div>
            <button
              onClick={() => fetchInsights(true)}
              disabled={insightsLoading}
              className="flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
            >
              <RotateCcw size={14} className={insightsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {insightsLoading && !insights ? (
            <div className="p-12 text-center text-[var(--fg-muted)]">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Generating insights...
            </div>
          ) : insights ? (
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">Patterns</h3>
                <ul className="space-y-1.5">
                  {insights.patterns?.map((p, i) => (
                    <li key={i} className="text-sm text-[var(--fg)] flex items-start gap-2">
                      <span className="text-yellow-400 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-current" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">Predictions</h3>
                <ul className="space-y-1.5">
                  {insights.predictions?.map((p, i) => (
                    <li key={i} className="text-sm text-[var(--fg)] flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1.5 shrink-0 w-1 h-1 rounded-full bg-current" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-success)] uppercase tracking-wider mb-2">Recommendations</h3>
                <ul className="space-y-1.5">
                  {insights.recommendations?.map((r, i) => (
                    <li key={i} className="text-sm text-[var(--fg)] flex items-start gap-2">
                      <span className="text-[var(--color-success)] mt-1.5 shrink-0 w-1 h-1 rounded-full bg-current" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-[var(--fg-muted)]">Could not load insights.</div>
          )}
        </div>
      </div>
    </div>
  );
}
