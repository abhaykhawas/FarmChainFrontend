import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { LockKeyhole } from "lucide-react";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#245d3a",
    colorText: "#183b2a",
    colorDanger: "#963e3b",
    borderRadius: "8px",
    fontFamily: "Inter, system-ui, sans-serif"
  }
};

function StripePaymentForm({ checkoutId, amountLabel, onComplete }) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !ready) return;
    setSubmitting(true);
    setError("");
    const returnUrl = `${window.location.origin}/checkout/result?checkout=${encodeURIComponent(checkoutId)}`;
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required"
    });
    if (result.error) {
      setError(result.error.message || "Payment could not be completed.");
      setSubmitting(false);
      return;
    }
    onComplete();
  };

  return (
    <form className="stripe-payment-form" onSubmit={submit}>
      <PaymentElement onReady={() => setReady(true)} options={{ layout: "tabs" }} />
      {error && <div className="form-alert">{error}</div>}
      <button className="button button--full button--large" disabled={!stripe || !elements || !ready || submitting} type="submit">
        <LockKeyhole size={18} /> {submitting ? "Confirming payment…" : `Pay ${amountLabel}`}
      </button>
      <p className="stripe-security-note"><LockKeyhole size={14} /> Payment details are encrypted and handled directly by Stripe.</p>
    </form>
  );
}

export default function StripePayment({ checkout, amountLabel, onComplete }) {
  if (!publishableKey) {
    return <div className="form-alert">Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY and restart the frontend.</div>;
  }
  if (!checkout?.clientSecret) {
    return <div className="form-alert">This payment session is unavailable. Return to your orders and try again.</div>;
  }
  return (
    <Elements key={checkout.clientSecret} stripe={stripePromise} options={{ clientSecret: checkout.clientSecret, appearance }}>
      <StripePaymentForm checkoutId={checkout.checkoutId} amountLabel={amountLabel} onComplete={onComplete} />
    </Elements>
  );
}
