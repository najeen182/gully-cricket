import { useState, useEffect, useCallback } from "react";
import { ballsToOvers } from "../../utils/cricketUtils";
import { Card } from "../common";

// ── helpers ───────────────────────────────────────────────────
const fmtDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1)  return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs  < 24) return `${diffHrs}h ago`;
  if (diffDays < 7)  return `${diffDays}d ago`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
};

const statusBadge = (status) => {
  const map = {
    "in-progress": { label: "Live",      bg: "rgba(50,200,100,0.15)", color: "#50cc70", border: "rgba(50,200,100,0.3)" },
    "completed":   { label: "Completed", bg: "rgba(245,200,66,0.12)", color: "var(--gold)", border: "var(--border)" },
    "abandoned":   { label: "Ended",     bg: "rgba(255,255,255,0.05)", color: "var(--text-dim)", border: "rgba(255,255,255,0.1)" },
  };
  const s = map[status] ?? map["abandoned"];
  return (
    <span style={{
      fontSize: "0.58rem", fontFamily: "Orbitron, monospace", letterSpacing: 1,
      textTransform: "uppercase", padding: "2px 7px", borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status === "in-progress" && <span style={{ marginRight: 4, animation: "blink 1.2s infinite", display: "inline-block" }}>●</span>}
      {s.label}
    </span>
  );
};

// ── MatchCard ─────────────────────────────────────────────────
function MatchCard({ match, onResume, onView, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const t0 = match.teams?.[0]?.name ?? "Team A";
  const t1 = match.teams?.[1]?.name ?? "Team B";
  const inn1 = match.innings1;
  const inn2 = match.innings2;
  const battingFirst = match.teams?.[match.battingFirstIdx ?? 0]?.name ?? t0;
  const fieldingFirst = match.teams?.[match.battingFirstIdx === 0 ? 1 : 0]?.name ?? t1;

  const isLive = match.status === "in-progress";
  const isDone = match.status === "completed";

  return (
    <div style={{
      background: isLive ? "rgba(50,200,100,0.04)" : "var(--panel)",
      border: `1px solid ${isLive ? "rgba(50,200,100,0.25)" : "var(--border)"}`,
      borderRadius: 12, padding: "12px 14px", marginBottom: 10,
      transition: "all 0.15s",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            {statusBadge(match.status)}
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>{fmtDate(match.updatedAt)}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginTop: 5, lineHeight: 1.2 }}>
            {t0} <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>vs</span> {t1}
          </div>
          {match.seriesId && (
            <div style={{ fontSize: "0.65rem", color: "var(--gold)", marginTop: 2 }}>
              {match.seriesName ?? "Series"} · Match {match.matchNum}
            </div>
          )}
        </div>

        {/* Delete button */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "1rem", padding: "2px 4px", flexShrink: 0 }}
          >🗑️</button>
        ) : (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button className="btn btn-red btn-xs" onClick={() => onDelete(match.id)} style={{ padding: "4px 8px", fontSize: "0.7rem" }}>Yes</button>
            <button className="btn btn-ghost btn-xs" onClick={() => setConfirmDelete(false)} style={{ padding: "4px 8px", fontSize: "0.7rem" }}>No</button>
          </div>
        )}
      </div>

      {/* Scores */}
      {(inn1 || inn2) && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr",
          gap: 6, alignItems: "center", marginBottom: 8,
          background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "7px 10px",
        }}>
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginBottom: 2 }}>{battingFirst}</div>
            {inn1 ? (
              <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.88rem", color: "var(--gold)" }}>
                {inn1.runs}/{inn1.wickets}
                <span style={{ color: "var(--text-dim)", fontSize: "0.6rem", marginLeft: 4 }}>
                  ({ballsToOvers(inn1.balls)})
                </span>
              </div>
            ) : <div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>—</div>}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", textAlign: "center" }}>vs</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginBottom: 2 }}>{fieldingFirst}</div>
            {inn2 ? (
              <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.88rem", color: "var(--gold)" }}>
                {inn2.runs}/{inn2.wickets}
                <span style={{ color: "var(--text-dim)", fontSize: "0.6rem", marginLeft: 4 }}>
                  ({ballsToOvers(inn2.balls)})
                </span>
              </div>
            ) : <div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>—</div>}
          </div>
        </div>
      )}

      {/* Result */}
      {match.result && (
        <div style={{ fontSize: "0.78rem", color: match.result.winType === "tie" ? "var(--text-dim)" : "var(--gold)", marginBottom: 8 }}>
          {match.result.winType === "tie" ? "🤝 Match Tied" : `🏆 ${match.result.resultText}`}
        </div>
      )}

      {/* Abandoned message */}
      {match.status === "abandoned" && !match.result && (
        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: 8 }}>Match ended early</div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        {isLive && (
          <button className="btn btn-green btn-sm" style={{ flex: 1 }} onClick={() => onResume(match)}>
            ▶ Resume
          </button>
        )}
        {(isDone || match.status === "abandoned") && (
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onView(match)}>
            📋 View
          </button>
        )}
        {isLive && (
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onView(match)}>
            📋 Scorecard
          </button>
        )}
      </div>
    </div>
  );
}

// ── SeriesCard ────────────────────────────────────────────────
function SeriesCard({ series, onResume, onView, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const t0 = series.teams?.[0]?.name ?? "Team A";
  const t1 = series.teams?.[1]?.name ?? "Team B";
  const isLive = series.status === "in-progress";
  const played = series.matchIds?.length ?? 0;
  const total  = series.format?.totalMatches ?? "?";

  return (
    <div style={{
      background: isLive ? "rgba(245,200,66,0.04)" : "var(--panel)",
      border: `2px solid ${isLive ? "rgba(245,200,66,0.3)" : "var(--border)"}`,
      borderRadius: 12, padding: "12px 14px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
            {statusBadge(series.status)}
            <span style={{ fontSize: "0.6rem", color: "var(--text-dim)" }}>{fmtDate(series.updatedAt)}</span>
          </div>
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: 1, marginBottom: 4 }}>
            {series.format?.icon} {series.seriesName}
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
            {t0} <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>vs</span> {t1}
          </div>
        </div>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "1rem", padding: "2px 4px", flexShrink: 0 }}>
            🗑️
          </button>
        ) : (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button className="btn btn-red btn-xs" onClick={() => onDelete(series.id)} style={{ padding: "4px 8px", fontSize: "0.7rem" }}>Yes</button>
            <button className="btn btn-ghost btn-xs" onClick={() => setConfirmDelete(false)} style={{ padding: "4px 8px", fontSize: "0.7rem" }}>No</button>
          </div>
        )}
      </div>

      {/* Series score */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        gap: 6, alignItems: "center", marginBottom: 8,
        background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px",
      }}>
        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginBottom: 2 }}>{t0}</div>
          <div style={{
            fontFamily: "Orbitron, monospace", fontSize: "1.5rem", fontWeight: 900,
            color: series.wins[0] > series.wins[1] ? "var(--gold)" : "var(--text-dim)",
          }}>{series.wins[0]}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.58rem", color: "var(--text-dim)", letterSpacing: 1, fontFamily: "Orbitron, monospace" }}>
            {played}/{total}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>played</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginBottom: 2 }}>{t1}</div>
          <div style={{
            fontFamily: "Orbitron, monospace", fontSize: "1.5rem", fontWeight: 900,
            color: series.wins[1] > series.wins[0] ? "var(--gold)" : "var(--text-dim)",
          }}>{series.wins[1]}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {isLive && (
          <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => onResume(series)}>
            ▶ Continue Series
          </button>
        )}
        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onView(series)}>
          📊 View
        </button>
      </div>
    </div>
  );
}

// ── MatchHistory (main screen) ────────────────────────────────
export function MatchHistory({ listMatches, listSeries, onResumeMatch, onViewMatch, onResumeSeries, onViewSeries, onDeleteMatch, onDeleteSeries, onBack }) {
  const [tab, setTab]       = useState("all");
  const [matches, setMatches] = useState([]);
  const [series,  setSeries]  = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [m, s] = await Promise.all([listMatches(), listSeries()]);
    setMatches(m);
    setSeries(s);
    setLoading(false);
  }, [listMatches, listSeries]);

  useEffect(() => { reload(); }, [reload]);

  const handleDeleteMatch = async (id) => {
    await onDeleteMatch(id);
    reload();
  };

  const handleDeleteSeries = async (id) => {
    await onDeleteSeries(id);
    reload();
  };

  // Standalone matches (not part of a series)
  const standaloneMatches = matches.filter((m) => !m.seriesId);
  const liveItems = [
    ...series.filter((s) => s.status === "in-progress"),
    ...standaloneMatches.filter((m) => m.status === "in-progress"),
  ].sort((a, b) => b.updatedAt - a.updatedAt);

  const displayItems = tab === "all"
    ? standaloneMatches
    : tab === "live"
    ? standaloneMatches.filter((m) => m.status === "in-progress")
    : standaloneMatches.filter((m) => m.status === "completed" || m.status === "abandoned");

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-ghost btn-xs" onClick={onBack}>← Back</button>
        <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase" }}>
          Match History
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)" }}>Loading…</div>
      ) : (
        <>
          {/* Live / In-progress banner */}
          {liveItems.length > 0 && (
            <Card style={{ borderColor: "rgba(50,200,100,0.4)", background: "rgba(50,200,100,0.04)", marginBottom: 12 }}>
              <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.58rem", letterSpacing: 2, color: "#50cc70", textTransform: "uppercase", marginBottom: 8 }}>
                ● In Progress
              </div>
              {liveItems.map((item) =>
                item.format ? (
                  <SeriesCard
                    key={item.id}
                    series={item}
                    onResume={onResumeSeries}
                    onView={onViewSeries}
                    onDelete={handleDeleteSeries}
                  />
                ) : (
                  <MatchCard
                    key={item.id}
                    match={item}
                    onResume={onResumeMatch}
                    onView={onViewMatch}
                    onDelete={handleDeleteMatch}
                  />
                )
              )}
            </Card>
          )}

          {/* Series section */}
          {series.length > 0 && (
            <>
              <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.58rem", letterSpacing: 2, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>
                All Series
              </div>
              {series.map((s) => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  onResume={onResumeSeries}
                  onView={onViewSeries}
                  onDelete={handleDeleteSeries}
                />
              ))}
            </>
          )}

          {/* Standalone matches tabs */}
          {standaloneMatches.length > 0 && (
            <>
              <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.58rem", letterSpacing: 2, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8, marginTop: series.length > 0 ? 12 : 0 }}>
                Standalone Matches
              </div>
              <div className="tabs">
                {[
                  { key: "all",       label: "All" },
                  { key: "live",      label: "Live" },
                  { key: "completed", label: "Done" },
                ].map((t) => (
                  <button key={t.key} className={`tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
              {displayItems.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-dim)", padding: "20px 0", fontSize: "0.85rem" }}>
                  No matches in this category.
                </div>
              ) : (
                displayItems.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onResume={onResumeMatch}
                    onView={onViewMatch}
                    onDelete={handleDeleteMatch}
                  />
                ))
              )}
            </>
          )}

          {standaloneMatches.length === 0 && series.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0 30px" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>📋</div>
              <div style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                No matches saved yet.<br />
                Start a match and it will appear here!
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
