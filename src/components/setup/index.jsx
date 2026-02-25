import { useState } from "react";
import { OVER_OPTIONS, WICKET_OPTIONS, PLAYER_COUNT_OPTIONS } from "../../constants";
import { createDefaultPlayers } from "../../utils/cricketUtils";
import { Card, Input, Select, InningsBadge, SectionHead } from "../common";

// ── HomeScreen ─────────────────────────────────────────────────
export function HomeScreen({ onSingleMatch, onSeries, onHistory }) {
  return (
    <div className="screen">
      <div style={{ textAlign: "center", padding: "16px 0 20px" }}>
        <div style={{ fontSize: "2.8rem", marginBottom: 8 }}>🏏</div>
        <div style={{ color: "var(--text-dim)", fontSize: "0.85rem", lineHeight: 1.65 }}>
          The ultimate gully cricket scorer.<br />
          Fast, accurate &amp; built for the streets.
        </div>
      </div>

      {/* Series / Single Match CTA */}
      <div style={{ marginBottom: 12 }}>
        <div
          onClick={onSeries}
          style={{
            background: "linear-gradient(135deg, rgba(245,200,66,0.12), rgba(245,200,66,0.04))",
            border: "2px solid var(--gold)",
            borderRadius: 14, padding: "18px 16px",
            cursor: "pointer", transition: "all 0.2s", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 14,
          }}
        >
          <div style={{ fontSize: "2.4rem" }}>🏆</div>
          <div>
            <div style={{
              fontFamily: "Orbitron, monospace", fontSize: "0.75rem",
              letterSpacing: 2, color: "var(--gold)", marginBottom: 3,
            }}>
              Series / Tournament
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.4 }}>
              Tri-series, Best of 5 &amp; more.<br />Reuse teams across multiple matches.
            </div>
          </div>
          <div style={{ marginLeft: "auto", color: "var(--gold)", fontSize: "1.2rem" }}>›</div>
        </div>

        <div
          onClick={() => onSingleMatch("limited")}
          style={{
            background: "var(--panel)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "14px 16px",
            cursor: "pointer", transition: "all 0.2s", marginBottom: 8,
            display: "flex", alignItems: "center", gap: 14,
          }}
        >
          <div style={{ fontSize: "2rem" }}>⚡</div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Quick Match — Limited Overs</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>T20, ODI, custom overs</div>
          </div>
          <div style={{ marginLeft: "auto", color: "var(--text-dim)", fontSize: "1.2rem" }}>›</div>
        </div>

        <div
          onClick={() => onSingleMatch("test")}
          style={{
            background: "var(--panel)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "14px 16px",
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 14,
          }}
        >
          <div style={{ fontSize: "2rem" }}>🏟️</div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Quick Match — Test</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>2 innings each, no over limit</div>
          </div>
          <div style={{ marginLeft: "auto", color: "var(--text-dim)", fontSize: "1.2rem" }}>›</div>
        </div>
      </div>

      {/* Match History */}
      <div
        onClick={onHistory}
        style={{
          background: "var(--panel)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "14px 16px",
          cursor: "pointer", transition: "all 0.2s", marginTop: 8,
          display: "flex", alignItems: "center", gap: 14,
        }}
      >
        <div style={{ fontSize: "2rem" }}>📋</div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>Match History</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>View, resume or continue past matches</div>
        </div>
        <div style={{ marginLeft: "auto", color: "var(--text-dim)", fontSize: "1.2rem" }}>›</div>
      </div>

      <Card style={{ textAlign: "center", marginTop: 8 }}>
        <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
          🏏 Auto strike rotation&nbsp;&nbsp;·&nbsp;&nbsp;📊 Live run rate&nbsp;&nbsp;·&nbsp;&nbsp;🎯 Full scorecard
        </div>
      </Card>
    </div>
  );
}

// ── LimitedSetup ───────────────────────────────────────────────
export function LimitedSetup({ onNext, onBack }) {
  const [overs, setOvers] = useState(10);
  const [wickets, setWickets] = useState(10);

  return (
    <div className="screen">
      <button className="btn btn-ghost btn-sm mb-2" onClick={onBack}>← Back</button>
      <Card title="Match Settings">
        <Select
          label="Number of Overs"
          value={overs}
          onChange={(v) => setOvers(+v)}
          options={OVER_OPTIONS.map((o) => ({ value: o, label: `${o} Overs` }))}
        />
        <Select
          label="Max Wickets"
          value={wickets}
          onChange={(v) => setWickets(+v)}
          options={WICKET_OPTIONS.map((w) => ({ value: w, label: `${w} Wicket${w > 1 ? "s" : ""}` }))}
        />
        <button className="btn btn-gold" onClick={() => onNext({ overs, wickets })}>
          Continue →
        </button>
      </Card>
    </div>
  );
}

// ── TeamSetup ──────────────────────────────────────────────────
export function TeamSetup({ teamNum, totalTeams, existing, onNext, onBack }) {
  const [teamName, setTeamName] = useState(existing?.name || `Team ${teamNum}`);
  const [playerCount, setPlayerCount] = useState(existing?.players?.length || 11);
  const [players, setPlayers] = useState(existing?.players || createDefaultPlayers(11));

  const handleCountChange = (n) => {
    const num = +n;
    setPlayerCount(num);
    setPlayers((prev) => {
      if (num > prev.length) {
        const extra = createDefaultPlayers(num - prev.length).map((p, i) => ({
          ...p,
          id: prev.length + i,
          name: `Player ${prev.length + i + 1}`,
        }));
        return [...prev, ...extra];
      }
      return prev.slice(0, num);
    });
  };

  const updatePlayerName = (idx, val) =>
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, name: val } : p)));

  const handleNext = () => onNext({ name: teamName, players });

  return (
    <div className="screen">
      <button className="btn btn-ghost btn-sm mb-2" onClick={onBack}>← Back</button>
      <InningsBadge>Team {teamNum} of {totalTeams}</InningsBadge>

      <Card title="Team Info">
        <Input
          label="Team Name"
          value={teamName}
          onChange={setTeamName}
          placeholder="Enter team name"
        />
        <Select
          label="Number of Players"
          value={playerCount}
          onChange={handleCountChange}
          options={PLAYER_COUNT_OPTIONS.map((n) => ({ value: n, label: `${n} Players` }))}
        />
      </Card>

      <Card title="Player Names">
        {players.map((p, i) => (
          <div key={p.id} className="player-chip">
            <span className="chip-num">{i + 1}</span>
            <input
              className="input-field"
              style={{ border: "none", background: "transparent", padding: "0 8px" }}
              value={p.name}
              onChange={(e) => updatePlayerName(i, e.target.value)}
              placeholder={`Player ${i + 1}`}
            />
          </div>
        ))}
      </Card>

      <button className="btn btn-gold" onClick={handleNext}>
        {teamNum < totalTeams ? `Setup Team ${teamNum + 1} →` : "Go to Toss →"}
      </button>
    </div>
  );
}

// ── TossScreen ─────────────────────────────────────────────────
export function TossScreen({ teams, onDecide, matchNum }) {
  const [callingTeam, setCallingTeam] = useState(null);   // 0 or 1 — who calls
  const [call, setCall] = useState(null);   // "heads" | "tails"
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);   // "heads" | "tails"
  const [winner, setWinner] = useState(null);   // 0 or 1
  const [choice, setChoice] = useState(null);   // "bat" | "bowl"

  const flipCoin = () => {
    if (callingTeam === null || !call) return;
    setFlipping(true);
    setResult(null);
    setWinner(null);
    setChoice(null);
    setTimeout(() => {
      const landed = Math.random() < 0.5 ? "heads" : "tails";
      const won = call === landed ? callingTeam : (callingTeam === 0 ? 1 : 0);
      setResult(landed);
      setWinner(won);
      setFlipping(false);
    }, 1400);
  };

  const handleDecide = () => {
    if (winner === null || !choice) return;
    const batting = choice === "bat" ? winner : (winner === 0 ? 1 : 0);
    onDecide(winner, batting);
  };

  return (
    <div className="screen">
      <Card style={{ textAlign: "center" }}>
        {matchNum && (
          <div style={{
            fontFamily: "Orbitron,monospace", fontSize: "0.58rem",
            letterSpacing: 3, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 10,
          }}>
            Match {matchNum}
          </div>
        )}
        <div className="card-title" style={{ textAlign: "center" }}>Toss</div>

        {/* Step 1: who calls? */}
        {winner === null && !flipping && (
          <>
            <SectionHead>Who calls the toss?</SectionHead>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {teams.map((t, i) => (
                <button
                  key={i}
                  className={`btn ${callingTeam === i ? "btn-gold" : "btn-ghost"}`}
                  onClick={() => setCallingTeam(i)}
                >
                  {t?.name ?? `Team ${i + 1}`}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: heads or tails? */}
        {winner === null && !flipping && callingTeam !== null && (
          <>
            <SectionHead>
              <span style={{ color: "var(--gold)" }}>{teams[callingTeam]?.name}</span> calls…
            </SectionHead>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <button
                className={`btn ${call === "heads" ? "btn-gold" : "btn-ghost"}`}
                onClick={() => setCall("heads")}
                style={{ fontSize: "1.1rem" }}
              >
                🪙 Heads
              </button>
              <button
                className={`btn ${call === "tails" ? "btn-gold" : "btn-ghost"}`}
                onClick={() => setCall("tails")}
                style={{ fontSize: "1.1rem" }}
              >
                🌀 Tails
              </button>
            </div>
          </>
        )}

        {/* Coin */}
        <div style={{
          fontSize: "3.6rem", marginBottom: 12,
          display: "inline-block",
          transition: "transform 1.4s cubic-bezier(0.22,0.61,0.36,1)",
          transform: flipping ? "rotateY(1440deg) scale(1.2)" : "none",
        }}>🪙</div>

        {/* Flip button */}
        {winner === null && !flipping && call && callingTeam !== null && (
          <button className="btn btn-gold" style={{ width: "100%" }} onClick={flipCoin}>
            Flip Coin →
          </button>
        )}

        {flipping && (
          <div style={{ color: "var(--text-dim)", fontFamily: "Orbitron,monospace", fontSize: "0.75rem", letterSpacing: 2 }}>
            Flipping…
          </div>
        )}

        {/* Result */}
        {winner !== null && !flipping && (
          <>
            <div style={{
              background: "rgba(245,200,66,0.08)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "center",
            }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: 4 }}>
                Coin landed on <strong style={{ color: "var(--gold)", textTransform: "uppercase" }}>{result}</strong>
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                🎉 <strong style={{ color: "var(--gold)" }}>{teams[winner]?.name}</strong> won the toss!
              </div>
            </div>

            <SectionHead>Choose to…</SectionHead>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <button
                className={`btn ${choice === "bat" ? "btn-gold" : "btn-ghost"}`}
                onClick={() => setChoice("bat")}
              >🏏 Bat First</button>
              <button
                className={`btn ${choice === "bowl" ? "btn-gold" : "btn-ghost"}`}
                onClick={() => setChoice("bowl")}
              >⚾ Bowl First</button>
            </div>
            {choice && (
              <button className="btn btn-green" style={{ width: "100%" }} onClick={handleDecide}>
                Start Match →
              </button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

