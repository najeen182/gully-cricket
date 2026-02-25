import { ballsToOvers } from "../../utils/cricketUtils";
import { Card, Divider } from "../common";

// ── StandingsTable ─────────────────────────────────────────────
function StandingsTable({ teams, wins, ties, matchesPlayed, winsNeeded, isBestOf }) {
  const rows = teams.map((t, i) => ({
    name: t.name,
    played: matchesPlayed,
    won: wins[i],
    lost: matchesPlayed - wins[i] - (ties > 0 ? Math.min(ties, matchesPlayed - wins[i]) : 0),
    tied: ties,
    points: wins[i] * 2 + ties,
  }));

  const leader = rows[0].won > rows[1].won ? 0 : rows[1].won > rows[0].won ? 1 : -1;

  return (
    <Card title="Standings">
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "2fr repeat(4,1fr)",
        gap: 4, marginBottom: 6,
      }}>
        {["Team","P","W","L","Pts"].map((h) => (
          <div key={h} style={{
            fontFamily: "Orbitron, monospace", fontSize: "0.52rem",
            letterSpacing: 2, color: "var(--text-dim)", textTransform: "uppercase",
          }}>{h}</div>
        ))}
      </div>

      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "grid", gridTemplateColumns: "2fr repeat(4,1fr)",
            gap: 4, padding: "8px 0",
            borderBottom: i === 0 ? "1px solid var(--border)" : "none",
            background: leader === i ? "rgba(245,200,66,0.04)" : "transparent",
            borderRadius: 6,
          }}
        >
          <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            {leader === i && <span style={{ color: "var(--gold)", fontSize: "0.7rem" }}>▶</span>}
            <span style={{ color: leader === i ? "var(--text)" : "var(--text-dim)" }}>
              {r.name}
            </span>
          </div>
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.78rem" }}>{r.played}</div>
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.78rem", color: "var(--gold)" }}>{r.won}</div>
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.78rem", color: "var(--red)" }}>{r.lost}</div>
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.78rem", fontWeight: 700 }}>{r.points}</div>
        </div>
      ))}

      {isBestOf && winsNeeded && (
        <div style={{ marginTop: 8, fontSize: "0.68rem", color: "var(--text-dim)" }}>
          First to <span style={{ color: "var(--gold)", fontWeight: 700 }}>{winsNeeded} wins</span> takes the series
        </div>
      )}
    </Card>
  );
}

// ── MatchHistoryList ───────────────────────────────────────────
function MatchHistoryList({ history, teams }) {
  if (history.length === 0) return null;
  return (
    <Card title="Match Results">
      {history.map((m) => {
        const battingFirst = teams[m.battingFirstIdx];
        const fieldingFirst = teams[m.battingFirstIdx === 0 ? 1 : 0];
        return (
          <div key={m.matchNum} style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingBottom: 10, marginBottom: 10,
          }}>
            {/* Match header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{
                fontFamily: "Orbitron, monospace", fontSize: "0.58rem",
                color: "var(--text-dim)", letterSpacing: 2,
              }}>
                Match {m.matchNum}
              </span>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700,
                color: m.winType === "tie" ? "var(--text-dim)" : "var(--gold)",
              }}>
                {m.resultText}
              </span>
            </div>

            {/* Scores */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 4 }}>
              {/* Team A */}
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700 }}>{battingFirst?.name}</div>
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.72rem", color: "var(--gold)" }}>
                  {m.innings1?.runs}/{m.innings1?.wickets}
                  <span style={{ color: "var(--text-dim)", fontSize: "0.6rem", marginLeft: 4 }}>
                    ({ballsToOvers(m.innings1?.balls ?? 0)})
                  </span>
                </div>
              </div>

              <div style={{ color: "var(--text-dim)", fontSize: "0.72rem", textAlign: "center" }}>vs</div>

              {/* Team B */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700 }}>{fieldingFirst?.name}</div>
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.72rem", color: "var(--gold)" }}>
                  {m.innings2?.runs}/{m.innings2?.wickets}
                  <span style={{ color: "var(--text-dim)", fontSize: "0.6rem", marginLeft: 4 }}>
                    ({ballsToOvers(m.innings2?.balls ?? 0)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ── SeriesWinnerBanner ─────────────────────────────────────────
function SeriesWinnerBanner({ winnerName, format, wins, teams }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0a2a10, #1a4a08)",
      border: "2px solid var(--gold)",
      borderRadius: 16, padding: "20px 16px", textAlign: "center", marginBottom: 12,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
      }} />
      <div style={{ fontSize: "2.8rem", marginBottom: 6 }}>🏆</div>
      <div style={{
        fontFamily: "Orbitron, monospace", fontSize: "0.6rem",
        letterSpacing: 4, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6,
      }}>
        {format.label} Champions
      </div>
      <div style={{
        fontFamily: "Bebas Neue, sans-serif",
        fontSize: "clamp(1.8rem, 7vw, 2.6rem)",
        letterSpacing: 2,
        background: "linear-gradient(135deg, #f5c842, #fff8d0)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text", lineHeight: 1.1, marginBottom: 8,
      }}>
        {winnerName}
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
        Won {wins[0]} – {wins[1]} {teams[1].name !== winnerName ? `(${teams[0].name})` : `(${teams[1].name})`}
      </div>
    </div>
  );
}

// ── SeriesDashboard (main export) ──────────────────────────────
export function SeriesDashboard({
  seriesName,
  format,
  teams,
  wins,
  ties,
  matchesPlayed,
  matchesLeft,
  winsNeeded,
  isBestOf,
  matchHistory,
  seriesDecided,
  getSeriesWinner,
  onPlayNextMatch,
  onEditTeams,      // allow editing teams between matches
  onNewSeries,
}) {
  const seriesWinnerIdx = getSeriesWinner();
  const seriesWinnerName = seriesWinnerIdx !== null ? teams[seriesWinnerIdx]?.name : null;

  return (
    <div className="screen">
      {/* Series Header */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{
          fontFamily: "Orbitron, monospace", fontSize: "0.6rem",
          letterSpacing: 4, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 4,
        }}>
          {format.icon} {format.label}
        </div>
        <div style={{
          fontFamily: "Bebas Neue, sans-serif",
          fontSize: "clamp(1.6rem, 6vw, 2.2rem)",
          letterSpacing: 2,
          background: "linear-gradient(135deg, #f5c842, #fff8d0)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", lineHeight: 1,
        }}>
          {seriesName}
        </div>
        {matchesPlayed > 0 && (
          <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 4 }}>
            Match {matchesPlayed} of {format.totalMatches} played
            {!seriesDecided && ` · ${matchesLeft} remaining`}
          </div>
        )}
      </div>

      {/* Series decided banner */}
      {seriesDecided && seriesWinnerName && (
        <SeriesWinnerBanner
          winnerName={seriesWinnerName}
          format={format}
          wins={wins}
          teams={teams}
        />
      )}

      {/* Tie banner */}
      {seriesDecided && seriesWinnerIdx === null && (
        <div style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "16px", textAlign: "center", marginBottom: 12,
        }}>
          <div style={{ fontSize: "2rem", marginBottom: 6 }}>🤝</div>
          <div style={{ fontFamily: "Orbitron, monospace", color: "var(--gold)", fontSize: "0.75rem", letterSpacing: 2 }}>
            Series Drawn
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: 4 }}>
            Both teams finished level — {wins[0]}–{wins[1]}
          </div>
        </div>
      )}

      {/* Standings */}
      <StandingsTable
        teams={teams}
        wins={wins}
        ties={ties}
        matchesPlayed={matchesPlayed}
        winsNeeded={winsNeeded}
        isBestOf={isBestOf}
      />

      {/* Match History */}
      <MatchHistoryList history={matchHistory} teams={teams} />

      {/* Action buttons */}
      {!seriesDecided && (
        <>
          <button className="btn btn-gold mb-2" onClick={onPlayNextMatch}>
            ▶ Play Match {matchesPlayed + 1}
          </button>
          <button className="btn btn-ghost btn-sm mb-2" onClick={onEditTeams}>
            ✏️ Edit Team Squads
          </button>
        </>
      )}

      {seriesDecided && (
        <button className="btn btn-gold mb-2" onClick={onNewSeries}>
          🏏 Start New Series
        </button>
      )}

      <button className="btn btn-ghost btn-sm" onClick={onNewSeries}>
        ← Back to Home
      </button>
    </div>
  );
}
