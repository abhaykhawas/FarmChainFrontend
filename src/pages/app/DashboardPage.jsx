import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeIndianRupee, Boxes, FileClock, Leaf, PackageCheck, ShieldAlert, ShoppingBasket, Sprout, TrendingUp, UsersRound } from "lucide-react";
import api, { apiError } from "../../api/client";
import { EmptyState, ErrorState, Loader, PageHeader, StatCard, StatusBadge } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { date, money, shortId } from "../../utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  if (user.role === "admin") return <AdminOverview />;
  return <PartnerOverview role={user.role} name={user.name} />;
}

function PartnerOverview({ role, name }) {
  const [data, setData] = useState({ orders: [], products: [], invoices: [], report: null });
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try {
      const requests = [api.get(`/orders/${role}`), api.get("/invoices"), api.get("/reports/sustainability")];
      if (role === "supplier") requests.push(api.get("/products/mine"));
      const [orders, invoices, report, products] = await Promise.all(requests);
      setData({ orders: orders.data, invoices: invoices.data, report: report.data, products: products?.data || [] });
    } catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [role]);
  if (loading) return <Loader label="Preparing your workspace…" />;
  if (error) return <ErrorState message={error} retry={load} />;
  const activeOrders = data.orders.filter((o) => !["delivered", "rejected", "cancelled"].includes(o.status)).length;
  const unpaidInvoices = data.invoices.filter((i) => i.status !== "paid").length;
  const spendOrRevenue = data.orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);

  return <div><PageHeader eyebrow={`${role} workspace`} title={`Good ${timeGreeting()}, ${name.split(" ")[0]}.`} description={role === "buyer" ? "Here’s what’s happening across your local purchasing network." : "Here’s the latest from your farm and buyer relationships."} actions={<Link className="button" to={role === "buyer" ? "/marketplace" : "/products/new"}>{role === "buyer" ? <ShoppingBasket size={18} /> : <Boxes size={18} />}{role === "buyer" ? "Shop produce" : "Add product"}</Link>} /><div className="stats-grid"><StatCard icon={PackageCheck} label="Active orders" value={activeOrders} note={`${data.orders.length} total orders`} /><StatCard icon={BadgeIndianRupee} label={role === "buyer" ? "Delivered value" : "Fulfilled revenue"} value={money(spendOrRevenue)} note="From delivered orders" tone="gold" /><StatCard icon={FileClock} label="Open invoices" value={unpaidInvoices} note={`${data.invoices.length} total invoices`} tone="clay" /><StatCard icon={Leaf} label="Organic share" value={`${data.report?.organicSpendPercentage || 0}%`} note={`${data.report?.organicUnitsPurchased || 0} organic units`} tone="sage" /></div><div className="dashboard-grid"><section className="panel panel--wide"><div className="panel-heading"><div><span className="eyebrow">Latest activity</span><h2>Recent orders</h2></div><Link className="text-link" to="/orders">View all <ArrowRight size={16} /></Link></div>{data.orders.length ? <div className="table-wrap"><table><thead><tr><th>Order</th><th>{role === "buyer" ? "Supplier" : "Buyer"}</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{data.orders.slice(0, 6).map((order) => <tr key={order._id}><td><Link to={`/orders/${order._id}`}><strong>{shortId(order._id)}</strong></Link></td><td>{role === "buyer" ? order.supplier?.businessName || order.supplier?.name : order.buyer?.businessName || order.buyer?.name}</td><td>{date(order.createdAt)}</td><td>{money(order.total)}</td><td><StatusBadge value={order.status} /></td></tr>)}</tbody></table></div> : <EmptyState icon={PackageCheck} title="No orders yet" description={role === "buyer" ? "Your first local order will appear here." : "New orders from buyers will appear here."} action={role === "buyer" && <Link className="button button--small" to="/marketplace">Browse marketplace</Link>} />}</section><aside className="panel quick-panel"><div className="panel-heading"><div><span className="eyebrow">At a glance</span><h2>{role === "buyer" ? "Your impact" : "Your catalogue"}</h2></div></div>{role === "buyer" ? <><div className="impact-ring" style={{ "--progress": `${Math.min(data.report?.organicSpendPercentage || 0, 100) * 3.6}deg` }}><div><strong>{data.report?.organicSpendPercentage || 0}%</strong><span>organic spend</span></div></div><div className="impact-lines"><span><b>{data.report?.deliveredOrders || 0}</b> delivered orders</span><span><b>{data.report?.produceUnitsPurchased || 0}</b> produce units</span></div><Link className="button button--ghost button--full" to="/reports">View impact report</Link></> : <><div className="catalogue-count"><Sprout size={30} /><strong>{data.products.length}</strong><span>products listed</span></div><div className="impact-lines"><span><b>{data.products.filter((p) => p.approvalStatus === "approved").length}</b> approved</span><span><b>{data.products.filter((p) => p.approvalStatus === "pending").length}</b> awaiting review</span></div><Link className="button button--ghost button--full" to="/products">Manage products</Link></>}</aside></div></div>;
}

function AdminOverview() {
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { setStats((await api.get("/admin/dashboard")).data); } catch (err) { setError(apiError(err)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  if (loading) return <Loader label="Loading marketplace overview…" />;
  if (error) return <ErrorState message={error} retry={load} />;
  return <div><PageHeader eyebrow="Admin workspace" title="Marketplace overview" description="Monitor FarmChain health, reviews, transactions, and trust signals." /><div className="stats-grid"><StatCard icon={UsersRound} label="Suppliers" value={stats.suppliers} note={`${stats.buyers} registered buyers`} /><StatCard icon={Boxes} label="Approved products" value={stats.approvedProducts} note={`${stats.pendingProducts} awaiting review`} tone="gold" /><StatCard icon={PackageCheck} label="Total orders" value={stats.orders} note="Across the marketplace" tone="sage" /><StatCard icon={TrendingUp} label="Gross marketplace value" value={money(stats.grossMarketplaceValue)} note="Completed payments" tone="clay" /></div><div className="admin-action-grid"><Link to="/admin/suppliers"><span><UsersRound /></span><div><small>Supplier trust</small><h2>Review certifications</h2><p>Verify farm documentation and help buyers source with confidence.</p></div><b><FileClock /> Review queue</b></Link><Link to="/admin/products"><span><Boxes /></span><div><small>Marketplace quality</small><h2>Review products</h2><p>Approve listings before they become visible to buyers.</p></div><b>{stats.pendingProducts} pending <ArrowRight /></b></Link><Link to="/disputes"><span><ShieldAlert /></span><div><small>Resolution centre</small><h2>Manage disputes</h2><p>Review buyer-supplier issues and record clear outcomes.</p></div><b>{stats.openDisputes} open <ArrowRight /></b></Link></div></div>;
}

function timeGreeting() { const hour = new Date().getHours(); return hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"; }
