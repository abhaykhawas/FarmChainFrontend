import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import api, { apiError } from "../../api/client";
import StripePayment from "../../components/StripePayment";
import { ErrorState, Loader, PageHeader, StatusBadge } from "../../components/UI";
import { useCart } from "../../context/CartContext";
import { money } from "../../utils/format";

const CHECKOUT_REQUEST_KEY = "farmchain_checkout_request";

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const checkoutId = params.get("checkout");
  const { clearCart } = useCart();
  const cartCleared = useRef(false);
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!checkoutId) return setError("Payment reference is missing.");
    try {
      const { data } = await api.get(`/payments/checkout/${checkoutId}/status`);
      setCheckout(data);
      setError("");
      if (["succeeded", "partially_refunded", "refunded"].includes(data.status) && !cartCleared.current) {
        cartCleared.current = true;
        clearCart();
        sessionStorage.removeItem(CHECKOUT_REQUEST_KEY);
      }
    } catch (err) {
      setError(apiError(err, "Could not verify payment status."));
    }
  }, [checkoutId, clearCart]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!checkout || !["pending", "processing"].includes(checkout.status)) return undefined;
    const timer = window.setInterval(load, 2000);
    return () => window.clearInterval(timer);
  }, [checkout, load]);

  if (error) return <ErrorState message={error} retry={load} />;
  if (!checkout) return <Loader label="Verifying your payment…" />;
  if (["pending", "processing"].includes(checkout.status)) {
    return <div><PageHeader eyebrow="Payment submitted" title="We’re confirming your payment" description="This usually takes only a moment. You can safely leave this page and return from My Orders." /><div className="panel checkout-complete payment-result"><Clock3 /><StatusBadge value={checkout.status} /><h2>Confirmation in progress</h2><p>FarmChain will activate your orders as soon as Stripe confirms the payment.</p></div></div>;
  }
  if (["succeeded", "partially_refunded", "refunded"].includes(checkout.status)) {
    return <div><PageHeader eyebrow="Payment complete" title="Your payment is confirmed" description={`${checkout.orderIds.length} ${checkout.orderIds.length === 1 ? "order is" : "orders are"} now ready for supplier action.`} /><div className="panel checkout-complete payment-result"><CheckCircle2 /><StatusBadge value={checkout.status} /><h2>Thank you</h2><p>Paid {money(checkout.amount)} securely through Stripe.</p><div className="payment-result-actions"><Link className="button" to="/orders">View my orders</Link><Link className="button button--ghost" to="/payments">View payment</Link></div></div></div>;
  }
  return <div><PageHeader eyebrow="Payment incomplete" title="Your payment was not completed" description="No order has been sent to a supplier. You can retry the same secure payment without creating duplicate orders." /><div className="panel checkout-complete payment-result payment-result--failed"><AlertTriangle /><StatusBadge value={checkout.status} /><h2>Payment needs attention</h2><p>Try again or return to your orders and resume later.</p><div className="payment-result-actions"><Link className="button" to={`/checkout/payment/${checkout.checkoutId}`}>Try payment again</Link><Link className="button button--ghost" to="/orders">My orders</Link></div></div></div>;
}

export function ResumePaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(`/payments/checkout/${id}/resume`);
      if (!data.clientSecret) return navigate(`/checkout/result?checkout=${id}`, { replace: true });
      setCheckout(data);
    } catch (err) {
      setError(apiError(err, "Could not resume this payment."));
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader label="Opening secure payment…" />;
  if (error) return <ErrorState message={error} retry={load} />;
  return <div><PageHeader eyebrow="Secure payment" title="Complete your FarmChain payment" description="This payment covers every supplier order from the original checkout." /><div className="payment-step-layout payment-step-layout--single"><section className="settings-card stripe-card"><div className="settings-card-heading"><span><ReceiptText /></span><div><h2>Payment details</h2><p>Retrying will not create duplicate orders or charges.</p></div></div><StripePayment checkout={checkout} amountLabel={money(checkout.amount)} onComplete={() => navigate(`/checkout/result?checkout=${id}`, { replace: true })} /></section></div></div>;
}
