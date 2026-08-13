import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import api, { apiError } from "../../api/client";
import StripePayment from "../../components/StripePayment";
import { Field, PageHeader } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { money } from "../../utils/format";

const CHECKOUT_REQUEST_KEY = "farmchain_checkout_request";

function requestId(checkoutPayload) {
  const fingerprint = JSON.stringify(checkoutPayload);
  try {
    const existing = JSON.parse(sessionStorage.getItem(CHECKOUT_REQUEST_KEY));
    if (existing?.fingerprint === fingerprint && existing?.id) return existing.id;
  } catch {
    // Older/plain values are replaced with the structured idempotency record.
  }
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(CHECKOUT_REQUEST_KEY, JSON.stringify({ id, fingerprint }));
  return id;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, deliveryFee, total, supplierCount, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stripeCheckout, setStripeCheckout] = useState(null);
  const [form, setForm] = useState({
    deliveryAddress: { line1: "", city: "", state: "", postalCode: "", country: "India" },
    paymentMethod: "stripe",
    notes: ""
  });

  useEffect(() => {
    setForm((value) => ({
      ...value,
      deliveryAddress: {
        line1: user.address?.line1 || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        postalCode: user.address?.postalCode || "",
        country: user.address?.country || "India"
      }
    }));
  }, [user]);

  const groups = useMemo(() => items.reduce((result, item) => {
    const supplier = item.product.supplier;
    const id = supplier?._id || supplier;
    result[id] ||= { name: supplier?.businessName || supplier?.name || "Local supplier", items: [] };
    result[id].items.push(item);
    return result;
  }, {}), [items]);

  const setAddress = (key, value) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, [key]: value } });
  const payload = () => ({
    items: items.map(({ product, quantity }) => ({ productId: product._id, quantity })),
    deliveryAddress: form.deliveryAddress,
    notes: form.notes
  });

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (form.paymentMethod === "cod") {
        const { data } = await api.post("/orders", { ...payload(), paymentMethod: "cod" });
        sessionStorage.removeItem(CHECKOUT_REQUEST_KEY);
        clearCart();
        showToast(`${data.length} ${data.length === 1 ? "order" : "orders"} placed successfully.`);
        navigate("/orders", { replace: true });
        return;
      }
      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe is not configured in the frontend environment.");
      }
      const checkoutPayload = payload();
      const { data } = await api.post("/payments/checkout", { ...checkoutPayload, checkoutRequestId: requestId(checkoutPayload) });
      setStripeCheckout(data);
    } catch (err) {
      setError(err.response ? apiError(err, "Could not start checkout.") : err.message || apiError(err, "Could not start checkout."));
    } finally {
      setSubmitting(false);
    }
  };

  const paymentComplete = () => navigate(`/checkout/result?checkout=${stripeCheckout.checkoutId}`, { replace: true });

  if (!items.length && !stripeCheckout) {
    return <div><PageHeader title="Checkout" /><div className="panel checkout-complete"><CheckCircle2 /><h2>Your cart is empty</h2><p>Add products before starting checkout.</p><Link className="button" to="/marketplace">Browse marketplace</Link></div></div>;
  }

  if (stripeCheckout) {
    return <div><PageHeader eyebrow="Secure payment" title="Complete your payment" description="Your orders remain pending and hidden from suppliers until Stripe confirms the payment." /><div className="payment-step-layout"><section className="settings-card stripe-card"><div className="settings-card-heading"><span><CreditCard /></span><div><h2>Payment details</h2><p>Available methods are determined securely by Stripe.</p></div></div><StripePayment checkout={stripeCheckout} amountLabel={money(stripeCheckout.amount)} onComplete={paymentComplete} /></section><aside className="panel checkout-summary"><span className="eyebrow">Payment summary</span><h2>{items.length} products</h2><div className="checkout-suppliers">{Object.entries(groups).map(([id, group]) => <div key={id}><strong><PackageCheck size={17} /> {group.name}</strong>{group.items.map(({ product, quantity }) => <span key={product._id}>{quantity} {product.unit} × {product.name}<b>{money(product.price * quantity)}</b></span>)}</div>)}</div><div className="summary-total"><span>Amount due</span><strong>{money(stripeCheckout.amount)}</strong></div><button className="back-link checkout-edit" type="button" onClick={() => setStripeCheckout(null)}><ArrowLeft size={17} /> Return to checkout details</button></aside></div></div>;
  }

  return <div><PageHeader eyebrow="Secure checkout" title="Delivery and payment" description={`This checkout will create ${supplierCount} ${supplierCount === 1 ? "order" : "orders"}, grouped by supplier.`} /><form className="checkout-layout" onSubmit={submit}><div className="checkout-main">{error && <div className="form-alert">{error}</div>}<section className="settings-card"><div className="settings-card-heading"><span><MapPin /></span><div><h2>Delivery address</h2><p>Where should suppliers deliver your order?</p></div></div><div className="form-grid"><Field label="Street address" required><input required value={form.deliveryAddress.line1} onChange={(e) => setAddress("line1", e.target.value)} /></Field><Field label="City" required><input required value={form.deliveryAddress.city} onChange={(e) => setAddress("city", e.target.value)} /></Field><Field label="State" required><input required value={form.deliveryAddress.state} onChange={(e) => setAddress("state", e.target.value)} /></Field><Field label="Postal code" required><input required value={form.deliveryAddress.postalCode} onChange={(e) => setAddress("postalCode", e.target.value)} /></Field><Field label="Country" required><input required value={form.deliveryAddress.country} onChange={(e) => setAddress("country", e.target.value)} /></Field></div></section><section className="settings-card"><div className="settings-card-heading"><span>₹</span><div><h2>Payment method</h2><p>Pay securely now or pay the supplier when the order is delivered.</p></div></div><div className="payment-choices">{[["stripe", "Pay online with Stripe"], ["cod", "Cash on delivery"]].map(([value, label]) => <label key={value} className={form.paymentMethod === value ? "active" : ""}><input type="radio" name="payment" value={value} checked={form.paymentMethod === value} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /><span>{label}</span></label>)}</div><Field label="Order notes" hint="Optional — suppliers for these orders will receive the same note"><textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Delivery instructions or produce preferences…" /></Field></section><Link className="back-link" to="/cart"><ArrowLeft size={17} /> Return to cart</Link></div><aside className="panel checkout-summary"><span className="eyebrow">Review order</span><h2>{items.length} products</h2><div className="checkout-suppliers">{Object.entries(groups).map(([id, group]) => <div key={id}><strong><PackageCheck size={17} /> {group.name}</strong>{group.items.map(({ product, quantity }) => <span key={product._id}>{quantity} {product.unit} × {product.name}<b>{money(product.price * quantity)}</b></span>)}</div>)}</div><div className="summary-lines"><span>Subtotal <b>{money(subtotal)}</b></span><span>Delivery <b>{deliveryFee ? money(deliveryFee) : "Free"}</b></span></div><div className="summary-total"><span>Order total</span><strong>{money(total)}</strong></div><button className="button button--full button--large" disabled={submitting} type="submit"><ShieldCheck size={18} /> {submitting ? "Preparing checkout…" : form.paymentMethod === "stripe" ? "Continue to secure payment" : "Place COD order"}</button><p className="summary-note"><Truck size={17} /> Stripe orders reach suppliers only after payment is confirmed.</p></aside></form></div>;
}
