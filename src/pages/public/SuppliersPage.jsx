import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Leaf, MapPin, Search, Sprout } from "lucide-react";
import api, { apiError } from "../../api/client";
import { EmptyState, ErrorState, Loader } from "../../components/UI";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({ q: "", city: "", verified: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (params = filters) => {
    setLoading(true); setError("");
    try { setSuppliers((await api.get("/suppliers", { params: Object.fromEntries(Object.entries(params).filter(([, v]) => v)) })).data); }
    catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const search = (event) => { event.preventDefault(); load(); };

  return (
    <div><section className="directory-hero"><div className="container"><span className="eyebrow eyebrow--light">The people behind your produce</span><h1>Meet your local farmers</h1><p>Discover verified suppliers, understand their growing practices, and build lasting relationships.</p><form className="directory-search" onSubmit={search}><label><Search size={18} /><input aria-label="Supplier name" placeholder="Search by farm or farmer" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} /></label><label><MapPin size={18} /><input aria-label="City" placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} /></label><select aria-label="Verification status" value={filters.verified} onChange={(e) => setFilters({ ...filters, verified: e.target.value })}><option value="">All suppliers</option><option value="true">Verified only</option></select><button className="button button--cream" type="submit">Find farmers</button></form></div></section>
      <section className="section"><div className="container"><div className="results-line"><div><span className="eyebrow">Farm directory</span><h2>{suppliers.length} local {suppliers.length === 1 ? "supplier" : "suppliers"}</h2></div></div>{loading ? <Loader label="Finding farms near you…" /> : error ? <ErrorState message={error} retry={load} /> : suppliers.length === 0 ? <EmptyState icon={Sprout} title="No suppliers found" description="Try another name or city." /> : <div className="supplier-grid">{suppliers.map((supplier) => <SupplierCard key={supplier._id} supplier={supplier} />)}</div>}</div></section>
    </div>
  );
}

export function SupplierCard({ supplier }) {
  const profile = supplier.supplierProfile || {};
  return <article className="supplier-card"><div className="farm-cover"><div className="farm-sun" /><div className="farm-hill" /><Sprout size={48} />{profile.certificationStatus === "verified" && <span className="verified-tag"><BadgeCheck size={15} /> Verified</span>}</div><div className="supplier-card-body"><span className="eyebrow">{profile.farmName || supplier.businessName || "Local farm"}</span><h3>{supplier.name}</h3><p>{profile.description || "A local FarmChain supplier committed to fresh produce and dependable relationships."}</p><div className="supplier-facts"><span><MapPin size={15} /> {supplier.address?.city || "India"}{supplier.address?.state ? `, ${supplier.address.state}` : ""}</span><span><Leaf size={15} /> {profile.sustainabilityPractices?.length || 0} listed practices</span></div><Link className="text-link" to={`/suppliers/${supplier._id}`}>View farm profile <ArrowRight size={17} /></Link></div></article>;
}
