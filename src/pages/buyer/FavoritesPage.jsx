import { useEffect, useState } from "react";
import { Heart, Sprout } from "lucide-react";
import api, { apiError } from "../../api/client";
import { EmptyState, ErrorState, Loader, PageHeader } from "../../components/UI";
import { SupplierCard } from "../public/SuppliersPage";

export default function FavoritesPage() {
  const [suppliers, setSuppliers] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { setSuppliers((await api.get("/suppliers/favorites/me")).data); } catch (err) { setError(apiError(err)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  return <div><PageHeader eyebrow="Saved network" title="Favorite farms" description="Keep your most trusted local suppliers close at hand." />{loading ? <Loader /> : error ? <ErrorState message={error} retry={load} /> : suppliers.length ? <div className="supplier-grid">{suppliers.map((supplier) => <SupplierCard key={supplier._id} supplier={supplier} />)}</div> : <EmptyState icon={Heart} title="No favorite farms yet" description="Open a supplier profile and save it to build your trusted network." action={<a className="button" href="/suppliers"><Sprout size={18} /> Discover suppliers</a>} />}</div>;
}
