import { ballsToOvers, determineWinner } from "../../utils/cricketUtils";
import { Card, Divider } from "../common";

// ── InningsBetween ─────────────────────────────────────────────
export function InningsBetween({ teams, battingFirstIdx, innings1, maxBalls, onStartSecond }) {
  const battingFirst = teams[battingFirstIdx];
  const fieldingFirst = teams[battingFirstIdx === 0 ? 1 : 0];
  const target = innings1.runs + 1;

  return (
    <div className="screen">
      <Card style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 7 }}>⏸️</div>
        <div className="card-title" style={{ textAlign: "center" }}>Innings Break</div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.88rem", color: "var(--text-dim)" }}>
            {battingFirst?.name} scored
          </div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--gold)", lineHeight: 1 }}>
            {innings1.runs}/{innings1.wickets}
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.82rem" }}>
            ({ballsToOvers(innings1.balls)} overs)
          </div>
        </div>

        <div className="card" style={{ background: "rgba(245,200,66,0.08)", borderColor: "var(--gold)", marginBottom: 12 }}>
          <div style={{ color: "var(--text-dim)", fontSize: "0.78rem" }}>{fieldingFirst?.name} needs</div>
          <div className="mono" style={{ fontSize: "1.5rem", color: "var(--gold)" }}>{target} runs</div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.72rem" }}>
            to win{maxBalls > 0 ? ` in ${ballsToOvers(maxBalls)} overs` : ""}
          </div>
        </div>

        <button className="btn btn-gold" onClick={onStartSecond}>Start 2nd Innings →</button>
      </Card>
    </div>
  );
}

// ── MatchResult ────────────────────────────────────────────────
export function MatchResult({
  teams, battingFirstIdx, innings1, innings2,
  // Series context (optional)
  isSeries, seriesName, matchNum, totalMatches, seriesWins,
  onContinue,
}) {
  const team1 = teams[battingFirstIdx];
  const team2 = teams[battingFirstIdx === 0 ? 1 : 0];

  const wi = determineWinner(
    innings1?.runs ?? 0, innings1?.wickets ?? 0,
    innings2?.runs ?? 0, innings2?.wickets ?? 0,
    team2?.players?.length ?? 10
  );

  // Map winner from innings perspective to teams[] index
  const winnerTeamIdx = wi.winner === null
    ? null
    : wi.winner === 0 ? battingFirstIdx : (battingFirstIdx === 0 ? 1 : 0);

  const winnerName = winnerTeamIdx !== null ? teams[winnerTeamIdx]?.name : null;
  const emoji = winnerTeamIdx === null ? "🤝" : "🏆";
  const resultText =
    wi.winType === "wickets"
      ? `Won by ${wi.margin} wicket${wi.margin !== 1 ? "s" : ""}`
      : wi.winType === "runs"
      ? `Won by ${wi.margin} run${wi.margin !== 1 ? "s" : ""}`
      : "Match Tied";

  const matchesLeft = totalMatches - matchNum;

  return (
    <div className="screen">
      <div className="result-screen">
        <span className="result-trophy">{emoji}</span>

        {/* Match number pill in series */}
        {isSeries && matchNum && (
          <div style={{
            fontFamily: "Orbitron, monospace", fontSize: "0.58rem",
            letterSpacing: 3, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6,
          }}>
            {seriesName} · Match {matchNum}
          </div>
        )}

        {winnerName ? (
          <>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>
              Match Winner
            </div>
            <div className="result-title">{winnerName}</div>
            <div className="result-sub">{resultText}</div>
          </>
        ) : (
          <>
            <div className="result-title">Match Tied!</div>
            <div className="result-sub">Both teams scored equally</div>
          </>
        )}

        {/* Series score strip */}
        {isSeries && seriesWins && (
          <div style={{
            margin: "14px 0",
            background: "rgba(245,200,66,0.08)",
            border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 16px",
            display: "grid", gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center", gap: 8,
          }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: 2 }}>{teams[0]?.name}</div>
              <div style={{
                fontFamily: "Orbitron, monospace",
                fontSize: "1.8rem", fontWeight: 900,
                color: seriesWins[0] > seriesWins[1] ? "var(--gold)" : "var(--text-dim)",
              }}>
                {seriesWins[0]}
              </div>
            </div>
            <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.7rem", color: "var(--text-dim)" }}>
              SERIES
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: 2 }}>{teams[1]?.name}</div>
              <div style={{
                fontFamily: "Orbitron, monospace",
                fontSize: "1.8rem", fontWeight: 900,
                color: seriesWins[1] > seriesWins[0] ? "var(--gold)" : "var(--text-dim)",
              }}>
                {seriesWins[1]}
              </div>
            </div>
          </div>
        )}

        {/* Match scorecard */}
        <Card style={{ textAlign: "left" }}>
          <div className="card-title">Match Summary</div>
          <div className="flex justify-between" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{team1?.name}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>1st Innings</div>
            </div>
            <div className="mono" style={{ color: "var(--gold)", textAlign: "right" }}>
              {innings1?.runs ?? 0}/{innings1?.wickets ?? 0}
              <div style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
                ({ballsToOvers(innings1?.balls ?? 0)})
              </div>
            </div>
          </div>
          <div className="flex justify-between" style={{ padding: "7px 0" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{team2?.name}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>2nd Innings</div>
            </div>
            <div className="mono" style={{ color: "var(--gold)", textAlign: "right" }}>
              {innings2?.runs ?? 0}/{innings2?.wickets ?? 0}
              <div style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
                ({ballsToOvers(innings2?.balls ?? 0)})
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        {isSeries ? (
          <>
            {matchesLeft > 0 && (
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginBottom: 10 }}>
                {matchesLeft} match{matchesLeft !== 1 ? "es" : ""} remaining in series
              </div>
            )}
            <button className="btn btn-gold mt-2" onClick={onContinue}>
              {matchesLeft > 0 ? "📊 Series Dashboard →" : "🏆 View Final Standings →"}
            </button>
          </>
        ) : (
          <button className="btn btn-gold mt-2" onClick={onContinue}>
            🏏 New Match
          </button>
        )}
      </div>
    </div>
  );
}
