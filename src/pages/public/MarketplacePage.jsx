import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, MapPin, Search, ShoppingBasket, SlidersHorizontal, Sprout } from "lucide-react";
import api, { apiError, assetUrl } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { EmptyState, ErrorState, Loader, PageHeader } from "../../components/UI";
import { money, title } from "../../utils/format";

const categories = ["", "vegetables", "fruits", "grains", "dairy", "herbs", "eggs", "other"];

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", category: "", organic: "", minPrice: "", maxPrice: "" });
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const load = async (nextFilters = filters) => {
    setLoading(true); setError("");
    try {
      const params = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value !== ""));
      setProducts((await api.get("/products", { params })).data);
    } catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const resultLabel = useMemo(() => `${products.length} ${products.length === 1 ? "product" : "products"} available`, [products.length]);

  const submitSearch = (event) => {
    event.preventDefault();
    const next = { ...filters, q: query };
    setFilters(next); load(next);
  };

  const changeFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next); load(next);
  };

  const add = (product) => {
    if (!user) return navigate("/login", { state: { from: { pathname: "/marketplace" } } });
    if (user.role !== "buyer") return showToast("Only buyer accounts can add products to a cart.", "error");
    addItem(product); showToast(`${product.name} added to your cart.`);
  };

  return (
    <div className="market-page">
      <section className="market-hero"><div className="container"><span className="hero-kicker"><Sprout size={16} /> Fresh from nearby farms</span><h1>Explore the local harvest</h1><p>Source quality produce directly from trusted suppliers across your region.</p><form className="market-search" onSubmit={submitSearch}><Search size={21} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tomatoes, herbs, dairy…" aria-label="Search products" /><button className="button" type="submit">Search</button></form></div></section>
      <section className="section section--compact"><div className="container">
        <div className="filter-bar">
          <div className="category-pills">{categories.map((category) => <button type="button" className={filters.category === category ? "active" : ""} key={category || "all"} onClick={() => changeFilter("category", category)}>{category ? title(category) : "All produce"}</button>)}</div>
          <div className="filter-select"><SlidersHorizontal size={17} /><select aria-label="Organic filter" value={filters.organic} onChange={(e) => changeFilter("organic", e.target.value)}><option value="">All farming types</option><option value="true">Organic only</option><option value="false">Conventional</option></select></div>
        </div>
        <div className="results-line"><span>{resultLabel}</span><div className="price-filters"><input type="number" min="0" placeholder="Min ₹" aria-label="Minimum price" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} onBlur={() => load()} /><span>—</span><input type="number" min="0" placeholder="Max ₹" aria-label="Maximum price" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} onBlur={() => load()} /></div></div>
        {loading ? <Loader label="Gathering today’s harvest…" /> : error ? <ErrorState message={error} retry={load} /> : products.length === 0 ? <EmptyState icon={Leaf} title="No produce found" description="Try broadening your search or removing a filter." /> : <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} onAdd={() => add(product)} />)}</div>}
      </div></section>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const supplier = product.supplier || {};
  return (
    <article className="product-card">
      <div className="product-image">{product.images?.[0] ? <img src={assetUrl(product.images[0])} alt={product.name} /> : <div className={`produce-art produce-art--${product.category}`}><Leaf size={45} /><span>{title(product.category)}</span></div>}{product.organic && <span className="organic-tag"><Leaf size={13} /> Organic</span>}</div>
      <div className="product-body"><div className="product-meta"><span>{title(product.category)}</span><span>In stock: {product.stock} {product.unit}</span></div><h3>{product.name}</h3><p className="product-description">{product.description || "Fresh local produce, supplied directly by the farm."}</p><Link className="supplier-byline" to={`/suppliers/${supplier._id}`}><span className="mini-farm-icon"><Sprout size={15} /></span><span><small>Supplied by</small><strong>{supplier.businessName || supplier.name || "Local supplier"}</strong></span></Link>{supplier.address?.city && <span className="location-line"><MapPin size={14} /> {supplier.address.city}</span>}<div className="product-footer"><div><strong>{money(product.price)}</strong><span>/ {product.unit}</span><small>Min. {product.minOrderQty || 1} {product.unit}</small></div><button className="add-button" type="button" onClick={onAdd} aria-label={`Add ${product.name} to cart`}><ShoppingBasket size={20} /><span>Add</span></button></div></div>
    </article>
  );
}
