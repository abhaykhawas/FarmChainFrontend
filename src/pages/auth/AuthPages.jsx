import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Eye, EyeOff, Leaf, LockKeyhole, Mail, Sprout, Tractor } from "lucide-react";
import { apiError } from "../../api/client";
import { Field } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

function AuthShell({ children, quote }) {
  return <div className="auth-page"><div className="auth-panel"><Link className="brand" to="/"><span className="brand-mark"><Sprout size={23} /></span><span>Farm<span>Chain</span></span></Link><div className="auth-form-wrap">{children}</div><p className="auth-legal">By continuing, you agree to build a fairer, more transparent food system.</p></div><div className="auth-art"><Link to="/" className="back-home"><ArrowLeft size={17} /> Back home</Link><div className="auth-art-content"><span className="auth-art-icon"><Leaf size={38} /></span><blockquote>“{quote}”</blockquote><p>Fresh connections. Fair trade. Local impact.</p></div><div className="auth-land"><i /><i /><i /><i /></div></div></div>;
}

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation();

  const submit = async (event) => {
    event.preventDefault(); setError(""); setSubmitting(true);
    try { await login(form); navigate(location.state?.from?.pathname || "/dashboard", { replace: true }); }
    catch (err) { setError(apiError(err, "Unable to sign in.")); }
    finally { setSubmitting(false); }
  };

  return <AuthShell quote="The shortest distance between good food and a good meal is a trusted relationship."><div className="auth-heading"><span className="eyebrow">Welcome back</span><h1>Sign in to FarmChain</h1><p>Manage your local food network from one place.</p></div>{error && <div className="form-alert">{error}</div>}<form className="auth-form" onSubmit={submit}><Field label="Email address" required><div className="input-with-icon"><Mail size={18} /><input required type="email" autoComplete="email" placeholder="you@business.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></Field><Field label="Password" required><div className="input-with-icon"><LockKeyhole size={18} /><input required minLength="6" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field><button className="button button--full button--large" disabled={submitting} type="submit">{submitting ? "Signing in…" : "Sign in"}<ArrowRight size={19} /></button></form><p className="auth-switch">New to FarmChain? <Link to="/register">Create an account</Link></p></AuthShell>;
}

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ role: searchParams.get("role") === "supplier" ? "supplier" : "buyer", name: "", email: "", phone: "", businessName: "", businessType: "individual", password: "" });
  const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth(); const navigate = useNavigate();
  useEffect(() => { if (form.role === "supplier") setForm((v) => ({ ...v, businessType: "farm" })); }, [form.role]);

  const submit = async (event) => {
    event.preventDefault();
    if (step === 1) return setStep(2);
    setError(""); setSubmitting(true);
    try { await register(form); navigate("/dashboard", { replace: true }); }
    catch (err) { setError(apiError(err, "Unable to create your account.")); }
    finally { setSubmitting(false); }
  };

  return <AuthShell quote="When farms and communities grow together, everyone gets a better harvest."><div className="auth-heading"><span className="eyebrow">Join the network</span><h1>Create your account</h1><p>Step {step} of 2 · {step === 1 ? "Choose how you’ll use FarmChain" : "Tell us about yourself"}</p></div><div className="form-progress"><i className="active" /><i className={step === 2 ? "active" : ""} /></div>{error && <div className="form-alert">{error}</div>}<form className="auth-form" onSubmit={submit}>{step === 1 ? <><div className="role-choice"><button type="button" className={form.role === "buyer" ? "active" : ""} onClick={() => setForm({ ...form, role: "buyer", businessType: "individual" })}><span><Building2 /></span><strong>I’m a buyer</strong><small>Source local produce for a restaurant, store, hotel, or home.</small></button><button type="button" className={form.role === "supplier" ? "active" : ""} onClick={() => setForm({ ...form, role: "supplier", businessType: "farm" })}><span><Tractor /></span><strong>I’m a supplier</strong><small>List farm products and build direct buyer relationships.</small></button></div><button className="button button--full button--large" type="submit">Continue <ArrowRight size={19} /></button></> : <><div className="form-grid"><Field label="Full name" required><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></Field><Field label="Email address" required><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@business.com" /></Field><Field label={form.role === "supplier" ? "Farm / business name" : "Business name"}><input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder={form.role === "supplier" ? "Green Valley Farm" : "The Local Table"} /></Field><Field label="Phone number"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></Field><Field label="Business type"><select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}>{form.role === "supplier" && <option value="farm">Farm</option>}<option value="restaurant">Restaurant</option><option value="hotel">Hotel</option><option value="grocery_store">Grocery store</option><option value="individual">Individual</option><option value="other">Other</option></select></Field><Field label="Password" hint="Use at least 6 characters" required><input required minLength="6" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a password" /></Field></div><div className="split-buttons"><button className="button button--ghost" type="button" onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</button><button className="button" disabled={submitting} type="submit">{submitting ? "Creating account…" : "Create account"}<ArrowRight size={18} /></button></div></>}</form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></AuthShell>;
}
