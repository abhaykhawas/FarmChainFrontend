import { AlertTriangle, Inbox, LoaderCircle, Sprout } from "lucide-react";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ value }) {
  const key = String(value || "unknown").toLowerCase();
  return <span className={`status status--${key}`}>{key.replaceAll("_", " ")}</span>;
}

export function Loader({ label = "Loading" }) {
  return <div className="loader"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function FullPageLoader() {
  return <div className="full-loader"><div className="brand-mark"><Sprout size={25} /></div><LoaderCircle className="spin" size={25} /><span>Preparing FarmChain…</span></div>;
}

export function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={27} /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, retry }) {
  return (
    <div className="error-state" role="alert">
      <AlertTriangle size={20} />
      <span>{message}</span>
      {retry && <button className="text-button" type="button" onClick={retry}>Try again</button>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, note, tone = "green" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon stat-icon--${tone}`}><Icon size={21} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}

export function Field({ label, error, hint, children, required }) {
  return (
    <label className="field">
      <span>{label}{required && <em>*</em>}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><h2>{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
