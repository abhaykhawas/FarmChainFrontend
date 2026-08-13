import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BadgeIndianRupee,
  BarChart3,
  Boxes,
  CircleUserRound,
  FileCheck2,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Store,
  TriangleAlert,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { initials } from "../utils/format";

const roleLinks = {
  buyer: [
    ["/dashboard", "Overview", LayoutDashboard],
    ["/marketplace", "Marketplace", Store],
    ["/orders", "My orders", PackageCheck],
    ["/favorites", "Favorite farms", Heart],
    ["/invoices", "Invoices", FileText],
    ["/payments", "Payments", BadgeIndianRupee],
    ["/chat", "Messages", MessageSquareText],
    ["/disputes", "Disputes", TriangleAlert],
    ["/reports", "Impact reports", BarChart3],
  ],
  supplier: [
    ["/dashboard", "Overview", LayoutDashboard],
    ["/products", "My products", Boxes],
    ["/orders", "Orders", PackageCheck],
    ["/invoices", "Invoices", FileText],
    ["/payments", "Payments", BadgeIndianRupee],
    ["/chat", "Messages", MessageSquareText],
    ["/certification", "Certification", FileCheck2],
    ["/disputes", "Disputes", TriangleAlert],
    ["/reports", "Reports", BarChart3],
  ],
  admin: [
    ["/dashboard", "Overview", LayoutDashboard],
    ["/admin/suppliers", "Supplier reviews", UsersRound],
    ["/admin/products", "Product reviews", ShieldCheck],
    ["/disputes", "Disputes", TriangleAlert],
    ["/reports", "Reports", BarChart3],
  ],
};

export function PublicLayout() {
  const { user } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="site-shell">
      <header className="public-nav">
        <div className="container nav-inner">
          <Link className="brand" to="/"><span className="brand-mark"><Sprout size={23} /></span><span>Farm<span>Chain</span></span></Link>
          <button className="mobile-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
          <nav className={open ? "public-links is-open" : "public-links"}>
            <NavLink to="/marketplace">Marketplace</NavLink>
            <NavLink to="/suppliers">Our farmers</NavLink>
            <a href="/#how-it-works">How it works</a>
            {user?.role === "buyer" && <NavLink className="cart-link" to="/cart"><ShoppingBasket size={18} /> Cart {count > 0 && <b>{count}</b>}</NavLink>}
            {user ? <Link className="button button--small" to="/dashboard">Go to dashboard</Link> : <><Link to="/login">Sign in</Link><Link className="button button--small" to="/register">Join FarmChain</Link></>}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div><Link className="brand brand--light" to="/"><span className="brand-mark"><Sprout size={22} /></span><span>Farm<span>Chain</span></span></Link><p>Fresh, traceable food from trusted local farms to your table.</p></div>
          <div><h4>Marketplace</h4><Link to="/marketplace">Browse produce</Link><Link to="/suppliers">Meet farmers</Link></div>
          <div><h4>For partners</h4><Link to="/register?role=buyer">Become a buyer</Link><Link to="/register?role=supplier">Sell on FarmChain</Link></div>
          <div><h4>Built for trust</h4><p>Verified suppliers<br />Transparent orders<br />Direct communication</p></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} FarmChain</span><span>Local food. Stronger communities.</span></div>
      </footer>
    </div>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className={mobileOpen ? "sidebar is-open" : "sidebar"}>
        <div className="sidebar-top">
          <Link className="brand brand--light" to="/dashboard"><span className="brand-mark"><Sprout size={23} /></span><span>Farm<span>Chain</span></span></Link>
          <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <div className="role-pill">{user.role} workspace</div>
        <nav className="sidebar-nav">
          {roleLinks[user.role].map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end={path === "/dashboard"}><Icon size={19} /><span>{label}</span>{path === "/chat" && <i />}</NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <Link to="/profile" className="user-summary"><span className="avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.businessName || user.email}</small></span></Link>
          <button type="button" onClick={signOut} aria-label="Sign out"><LogOut size={19} /></button>
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-overlay" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <div className="app-main">
        <header className="app-topbar">
          <button className="mobile-toggle" type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="topbar-search"><Search size={18} /><span>FarmChain / {location.pathname.split("/").filter(Boolean).at(-1) || "dashboard"}</span></div>
          <div className="topbar-actions">
            {user.role === "buyer" && <Link className="topbar-cart" to="/cart"><ShoppingBasket size={20} />{count > 0 && <b>{count}</b>}</Link>}
            <Link className="topbar-profile" to="/profile"><span className="avatar avatar--small">{initials(user.name)}</span><span>{user.name.split(" ")[0]}</span><CircleUserRound size={18} /></Link>
          </div>
        </header>
        <main className="dashboard-content"><Outlet /></main>
      </div>
    </div>
  );
}
