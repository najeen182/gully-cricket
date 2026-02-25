import { useState } from "react";
import { SERIES_FORMATS } from "../../constants";
import { Card, Input } from "../common";

/**
 * Screen 1 of series creation: name the series and pick a format.
 * onNext({ seriesName, format }) → proceeds to match-type setup
 */
export function SeriesSetup({ onNext, onBack }) {
  const [name, setName]     = useState("Gully Cup 2025");
  const [selected, setSelected] = useState(SERIES_FORMATS[0]);

  return (
    <div className="screen">
      <button className="btn btn-ghost btn-sm mb-2" onClick={onBack}>← Back</button>

      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: "2.2rem" }}>🏆</div>
        <div style={{
          fontFamily: "Orbitron, monospace", fontSize: "0.65rem",
          letterSpacing: 4, color: "var(--text-dim)", textTransform: "uppercase", marginTop: 4,
        }}>
          New Series
        </div>
      </div>

      <Card title="Series Name">
        <Input
          label="Give your series a name"
          value={name}
          onChange={setName}
          placeholder="e.g. Gully Premier League, Street Cup…"
        />
      </Card>

      <Card title="Series Format">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {SERIES_FORMATS.map((fmt) => (
            <div
              key={fmt.key}
              onClick={() => setSelected(fmt)}
              style={{
                background: selected.key === fmt.key
                  ? "rgba(245,200,66,0.1)"
                  : "var(--sky-mid)",
                border: `2px solid ${selected.key === fmt.key ? "var(--gold)" : "var(--border)"}`,
                borderRadius: 10,
                padding: "12px 10px",
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: 4 }}>{fmt.icon}</div>
              <div style={{
                fontFamily: "Orbitron, monospace", fontSize: "0.6rem",
                letterSpacing: 1, color: selected.key === fmt.key ? "var(--gold)" : "var(--text)",
                fontWeight: 700, marginBottom: 3,
              }}>
                {fmt.label}
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
                {fmt.description}
              </div>
              {fmt.totalMatches > 1 && (
                <div style={{
                  marginTop: 5, fontSize: "0.6rem",
                  color: selected.key === fmt.key ? "var(--gold)" : "var(--text-dim)",
                  fontFamily: "Orbitron, monospace",
                }}>
                  {fmt.totalMatches} matches
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <button
        className="btn btn-gold"
        onClick={() => onNext({ seriesName: name.trim() || "Gully Cup", format: selected })}
      >
        Set Up Teams →
      </button>
    </div>
  );
}
