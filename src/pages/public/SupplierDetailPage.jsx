import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Heart, Leaf, MapPin, MessageSquareText, ShoppingBasket, Sprout, Truck } from "lucide-react";
import api, { apiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { EmptyState, ErrorState, Loader } from "../../components/UI";
import { money, title } from "../../utils/format";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorite, setFavorite] = useState(false);
  const { user } = useAuth(); const { addItem } = useCart(); const { showToast } = useToast(); const navigate = useNavigate();

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [supplierRes, productsRes] = await Promise.all([api.get(`/suppliers/${id}`), api.get("/products", { params: { supplier: id } })]);
      setSupplier(supplierRes.data); setProducts(productsRes.data);
      if (user?.role === "buyer") {
        const favorites = (await api.get("/suppliers/favorites/me")).data;
        setFavorite(favorites.some((item) => item._id === id));
      }
    } catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id, user?._id]);

  const toggleFavorite = async () => {
    if (!user) return navigate("/login");
    try { const list = (await api.post(`/suppliers/favorites/${id}`)).data; setFavorite(list.some((item) => item._id === id)); showToast(favorite ? "Removed from favorites." : "Farm added to favorites."); }
    catch (err) { showToast(apiError(err), "error"); }
  };
  const startChat = async () => {
    if (!user) return navigate("/login");
    try { const { data } = await api.post("/chat", { userId: id }); navigate(`/chat?conversation=${data._id}`); }
    catch (err) { showToast(apiError(err), "error"); }
  };
  if (loading) return <div className="container section"><Loader label="Opening farm profile…" /></div>;
  if (error) return <div className="container section"><ErrorState message={error} retry={load} /></div>;
  const profile = supplier.supplierProfile || {};

  return <div className="supplier-profile-page"><section className="profile-hero"><div className="container"><Link className="back-link" to="/suppliers"><ArrowLeft size={17} /> Back to all farms</Link><div className="profile-hero-grid"><div><div className="profile-kicker"><span className="farm-avatar"><Sprout size={34} /></span><span>{profile.certificationStatus === "verified" && <b><BadgeCheck size={16} /> Verified FarmChain supplier</b>}<small>Member since {new Date(supplier.createdAt).getFullYear()}</small></span></div><h1>{profile.farmName || supplier.businessName || supplier.name}</h1><p className="profile-owner">Grown and supplied by {supplier.name}</p><p className="profile-description">{profile.description || "A trusted local supplier offering fresh produce through the FarmChain network."}</p><div className="profile-facts"><span><MapPin /> {supplier.address?.city || "India"}{supplier.address?.state ? `, ${supplier.address.state}` : ""}</span><span><Truck /> Delivers within {profile.deliveryRadiusKm || 25} km</span></div></div>{user?.role === "buyer" && <div className="profile-actions"><button className="button button--cream" onClick={startChat}><MessageSquareText size={18} /> Message supplier</button><button className="button button--outline-light" onClick={toggleFavorite}><Heart size={18} fill={favorite ? "currentColor" : "none"} /> {favorite ? "Favorited" : "Save farm"}</button></div>}</div></div></section><section className="section"><div className="container profile-content-grid"><div><div className="section-heading section-heading--left"><span className="eyebrow">Current harvest</span><h2>Available from this farm</h2></div>{products.length === 0 ? <EmptyState icon={Leaf} title="No produce available today" /> : <div className="farm-product-list">{products.map((product) => <article key={product._id}><div className="farm-product-icon"><Leaf /></div><div><span>{title(product.category)} {product.organic && "• Organic"}</span><h3>{product.name}</h3><p>{product.description}</p></div><div className="farm-product-buy"><strong>{money(product.price)} <small>/ {product.unit}</small></strong>{user?.role === "buyer" && <button className="button button--small" onClick={() => { addItem(product); showToast(`${product.name} added to cart.`); }}><ShoppingBasket size={17} /> Add</button>}</div></article>)}</div>}</div><aside className="practices-card"><span className="eyebrow">Growing responsibly</span><h3>Sustainability practices</h3>{profile.sustainabilityPractices?.length ? <ul>{profile.sustainabilityPractices.map((practice) => <li key={practice}><Leaf size={17} /> {practice}</li>)}</ul> : <p>No practices have been listed yet.</p>}<div className="cert-note"><BadgeCheck size={22} /><span><strong>Certification status</strong><small>{title(profile.certificationStatus || "not submitted")}</small></span></div></aside></div></section></div>;
}
