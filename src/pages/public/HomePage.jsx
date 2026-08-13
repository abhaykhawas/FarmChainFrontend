import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Building2, Leaf, MapPin, Sprout, Truck, UsersRound } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-orb hero-orb--one" /><div className="hero-orb hero-orb--two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker"><Leaf size={16} /> India’s local food network</span>
            <h1>From local soil<br />to <em>your table.</em></h1>
            <p>FarmChain brings verified farmers and conscious buyers together—making fresh, traceable produce easier to find, order, and trust.</p>
            <div className="hero-actions"><Link className="button button--large" to="/marketplace">Explore the harvest <ArrowRight size={19} /></Link><Link className="button button--ghost button--large" to="/register?role=supplier">Join as a supplier</Link></div>
            <div className="trust-row"><span><BadgeCheck size={19} /> Verified farms</span><span><MapPin size={19} /> Locally sourced</span><span><Truck size={19} /> Direct delivery</span></div>
          </div>
          <div className="hero-visual" aria-label="FarmChain local supply network illustration">
            <div className="sun-shape" />
            <div className="field-lines"><i /><i /><i /><i /><i /></div>
            <div className="hero-card hero-card--farm"><span><Sprout /></span><div><small>GROWN BY</small><strong>Local farms</strong><p>Verified & transparent</p></div></div>
            <div className="hero-card hero-card--buyer"><span><Building2 /></span><div><small>DELIVERED TO</small><strong>Local buyers</strong><p>Fresh & dependable</p></div></div>
            <div className="supply-path"><i /><i /><i /><ArrowRight /></div>
            <div className="hero-seal"><Leaf size={25} /><strong>100%</strong><span>traceable</span></div>
          </div>
        </div>
      </section>

      <section className="proof-strip"><div className="container"><div><strong>Direct</strong><span>Farm-to-buyer relationships</span></div><div><strong>Fresh</strong><span>Seasonal local produce</span></div><div><strong>Fair</strong><span>Transparent marketplace</span></div><div><strong>Trusted</strong><span>Verified certifications</span></div></div></section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Simple by design</span><h2>A shorter chain makes<br />a stronger food system.</h2><p>Everything you need to discover, buy, sell, and manage local produce in one trusted marketplace.</p></div>
          <div className="steps-grid">
            <article><span className="step-number">01</span><div className="step-icon"><UsersRound /></div><h3>Meet trusted partners</h3><p>Browse verified farms, certification details, sustainable practices, and seasonal products.</p></article>
            <article><span className="step-number">02</span><div className="step-icon"><Leaf /></div><h3>Order with confidence</h3><p>Choose quantities, place supplier-split orders, and follow every status from placed to delivered.</p></article>
            <article><span className="step-number">03</span><div className="step-icon"><Truck /></div><h3>Grow together</h3><p>Manage invoices, payments, direct messages, disputes, and impact reporting in one clear workflow.</p></article>
          </div>
        </div>
      </section>

      <section className="story-section"><div className="container story-grid"><div className="story-art"><div className="story-sun" /><div className="story-hill story-hill--one" /><div className="story-hill story-hill--two" /><span className="story-tree">♣</span><div className="story-quote">“Good food begins with knowing where it comes from.”</div></div><div className="story-copy"><span className="eyebrow">Why FarmChain</span><h2>Food with a story.<br />Trade with a purpose.</h2><p>Local suppliers deserve a fair, direct way to reach reliable buyers. Buyers deserve confidence in where their ingredients come from. FarmChain creates that connection with transparency built into every step.</p><ul className="check-list"><li><BadgeCheck /> Supplier certification and product review</li><li><BadgeCheck /> Clear order, invoice, and payment records</li><li><BadgeCheck /> Sustainability and procurement insights</li></ul><Link className="text-link" to="/suppliers">Meet our farmers <ArrowRight size={18} /></Link></div></div></section>

      <section className="cta-section"><div className="container cta-card"><div><span className="eyebrow eyebrow--light">Ready to get started?</span><h2>Build a better local food chain.</h2><p>Whether you grow it or source it, your next trusted connection starts here.</p></div><div><Link className="button button--cream button--large" to="/register">Create your account <ArrowRight size={19} /></Link><Link className="button button--outline-light button--large" to="/marketplace">Browse produce</Link></div></div></section>
    </>
  );
}
