import { useEffect, useMemo, useState } from "react";
import { BadgeIndianRupee, BarChart3, Leaf, PackageCheck, Sprout, TrendingUp } from "lucide-react";
import api, { apiError } from "../../api/client";
import { ErrorState, Loader, PageHeader, StatCard } from "../../components/UI";
import { money } from "../../utils/format";

const monthName = (month) => new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(2024, month - 1, 1));

export default function ReportsPage() {
  const [report, setReport] = useState(null); const [monthly, setMonthly] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const [sustainability, monthData] = await Promise.all([api.get("/reports/sustainability"), api.get("/reports/monthly")]); setReport(sustainability.data); setMonthly(monthData.data); } catch (err) { setError(apiError(err)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const maxSpend = useMemo(() => Math.max(...monthly.map((item) => item.spend), 1), [monthly]);
  if (loading) return <Loader label="Building your reports…" />;
  if (error) return <ErrorState message={error} retry={load} />;
  return <div><PageHeader eyebrow="Procurement intelligence" title="Impact and purchasing reports" description="Understand order patterns and the share of organic produce in delivered purchases." /><div className="stats-grid"><StatCard icon={PackageCheck} label="Delivered orders" value={report.deliveredOrders} note="Included in impact totals" /><StatCard icon={BadgeIndianRupee} label="Local procurement value" value={money(report.totalLocalProcurementValue)} note="Delivered order value" tone="gold" /><StatCard icon={Leaf} label="Organic value" value={money(report.organicProcurementValue)} note={`${report.organicSpendPercentage}% of delivered value`} tone="sage" /><StatCard icon={Sprout} label="Produce units" value={report.produceUnitsPurchased} note={`${report.organicUnitsPurchased} organic units`} tone="clay" /></div><div className="reports-grid"><section className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">Purchasing activity</span><h2>Monthly order value</h2></div><BarChart3 /></div>{monthly.length ? <div className="bar-chart">{monthly.map((item) => <div className="bar-column" key={`${item._id.year}-${item._id.month}`}><div className="bar-value">{money(item.spend)}</div><div className="bar-track"><i style={{ height: `${Math.max((item.spend / maxSpend) * 100, 4)}%` }} /></div><strong>{monthName(item._id.month)}</strong><small>{item.orders} {item.orders === 1 ? "order" : "orders"}</small></div>)}</div> : <div className="chart-empty"><TrendingUp /><h3>No monthly activity yet</h3><p>Your order totals will form a chart here.</p></div>}</section><aside className="panel organic-panel"><span className="eyebrow">Organic procurement</span><div className="big-impact-ring" style={{ "--progress": `${Math.min(report.organicSpendPercentage || 0, 100) * 3.6}deg` }}><div><strong>{report.organicSpendPercentage}%</strong><span>of spend</span></div></div><p>{report.organicUnitsPurchased} of {report.produceUnitsPurchased} purchased units were from organic product listings.</p><div className="report-note"><Leaf /><span>{report.note}</span></div></aside></div></div>;
}
