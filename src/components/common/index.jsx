import { useState } from "react";

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ title, children, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="modal">
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

// ── Snackbar ───────────────────────────────────────────────────
export function Snackbar({ msg }) {
  if (!msg) return null;
  return <div className="snackbar">{msg}</div>;
}

// ── Tabs ───────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`tab ${active === t.key ? "active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────
export function Card({ title, children, style, className = "" }) {
  return (
    <div className={`card ${className}`} style={style}>
      {title && <div className="card-title">{title}</div>}
      {children}
    </div>
  );
}

// ── InningsBadge ───────────────────────────────────────────────
export function InningsBadge({ children }) {
  return <div className="innings-badge">{children}</div>;
}

// ── SectionHead ────────────────────────────────────────────────
export function SectionHead({ children }) {
  return <div className="section-head">{children}</div>;
}

// ── Divider ────────────────────────────────────────────────────
export function Divider() {
  return <div className="divider" />;
}

// ── Input ─────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────
export function Select({ label, value, onChange, options }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <select
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── WinnerOverlay ──────────────────────────────────────────────
export function WinnerOverlay({ winnerName, resultText, winType, onContinue }) {
  const emoji = winType === "tie" ? "🤝" : "🏆";
  return (
    <div className="winner-overlay">
      <div className="winner-box">
        <span className="winner-trophy">{emoji}</span>
        {winnerName ? (
          <>
            <div className="winner-label">Winner</div>
            <div className="winner-team">{winnerName}</div>
            <div className="winner-margin">{resultText}</div>
          </>
        ) : (
          <>
            <div className="winner-team">It's a Tie!</div>
            <div className="winner-margin" style={{ marginBottom: 18 }}>Both teams scored equally</div>
          </>
        )}
        <button className="btn btn-gold" onClick={onContinue}>
          View Scorecard →
        </button>
      </div>
    </div>
  );
}

// ── useSnackbar ────────────────────────────────────────────────
export function useSnackbar() {
  const [state, setState] = useState({ msg: "", key: 0 });
  const toast = (msg) => setState((s) => ({ msg, key: s.key + 1 }));
  return { snackMsg: state.msg, snackKey: state.key, toast };
}
