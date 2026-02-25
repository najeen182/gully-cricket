import { useState } from "react";
import { ballsToOvers, calcEconomy, calcStrikeRate } from "../../utils/cricketUtils";
import { Tabs, Card, Divider } from "../common";

const BALL_CLASS = {
  "0": "bc-0", "1": "bc-1", "2": "bc-2", "3": "bc-3",
  "4": "bc-4", "6": "bc-6", "W": "bc-W",
  "Wd": "bc-Wd", "Nb": "bc-Nb", "Lb": "bc-Lb",
};
const ballClass = (b) => {
  for (const k of Object.keys(BALL_CLASS)) if (b.startsWith(k)) return BALL_CLASS[k];
  return "bc-0";
};

// ── BattingCard ────────────────────────────────────────────────
function BattingCard({ innings, battingTeam }) {
  // Prefer live stats stored inside innings.batPlayers (from useInnings)
  const players = innings.batPlayers || battingTeam.players;
  const teamForDisplay = { ...battingTeam, players };
  const totalExtras =
    innings.extras.wide + innings.extras.noBall +
    innings.extras.legBye + innings.extras.bye;

  return (
    <Card>
      <table className="sc-table">
        <thead>
          <tr>
            <th>Batsman</th>
            <th className="rc">R</th>
            <th className="rc">B</th>
            <th className="rc">4s</th>
            <th className="rc">6s</th>
            <th className="rc">SR</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const isCurrentlyBatting =
              innings.batsmen.includes(i) && p.status === "batting";
            const hasPlayed = p.balls > 0 || p.status === "out" || isCurrentlyBatting;
            if (!hasPlayed) return null;
            const sr = calcStrikeRate(p.runs, p.balls);
            return (
              <tr
                key={p.id}
                className={p.status === "out" ? "dismissed" : isCurrentlyBatting ? "batting" : ""}
              >
                <td>
                  {p.name}
                  {isCurrentlyBatting && innings.batsmen[innings.strikerIdx] === i && (
                    <span className="strike-dot" style={{ marginLeft: 4 }} />
                  )}
                  {p.status === "out" && (
                    <span style={{ marginLeft: 6, fontSize: "0.65rem", color: "var(--red)" }}>out</span>
                  )}
                </td>
                <td className="rc">{p.runs}</td>
                <td className="rc">{p.balls}</td>
                <td className="rc">{p.fours}</td>
                <td className="rc">{p.sixes}</td>
                <td className="rc">{sr ?? "—"}</td>
              </tr>
            );
          })}
          {/* Yet to bat */}
          <tr>
            <td colSpan={6} style={{ color: "var(--text-dim)", fontSize: "0.72rem", paddingTop: 8 }}>
              Yet to bat:{" "}
              {battingTeam.players
                .filter((p) => p.status === "yet to bat" && !innings.batsmen.includes(players.indexOf(p)))
                .map((p) => p.name)
                .join(", ") || "—"}
            </td>
          </tr>
        </tbody>
      </table>

      <Divider />

      <div className="extras-row">
        <span className="extra-chip">Extras: {totalExtras}</span>
        <span className="extra-chip">Wd: {innings.extras.wide}</span>
        <span className="extra-chip">Nb: {innings.extras.noBall}</span>
        <span className="extra-chip">Lb: {innings.extras.legBye}</span>
      </div>

      <Divider />

      <div className="mono" style={{ fontSize: "0.9rem", color: "var(--gold)" }}>
        Total: {innings.runs}/{innings.wickets} ({ballsToOvers(innings.balls)} ov)
      </div>
    </Card>
  );
}

// ── BowlingCard ────────────────────────────────────────────────
function BowlingCard({ innings, bowlingTeam }) {
  const bowlPlayers = innings.bowlPlayers || bowlingTeam.players;
  const activeBowlers = bowlPlayers.filter(
    (p) => p.ballsBowled > 0 || p.oversBowled > 0
  );
  return (
    <Card>
      <div className="bowl-row bowl-head">
        <div>Bowler</div>
        <div>O</div>
        <div>R</div>
        <div>W</div>
        <div>Eco</div>
      </div>
      {activeBowlers.map((p) => {
        const totalBalls = p.oversBowled * 6 + (p.ballsBowled % 6);
        const eco = calcEconomy(p.runsConceded, totalBalls);
        return (
          <div key={p.id} className="bowl-row">
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div className="mono">{p.oversBowled}.{p.ballsBowled % 6}</div>
            <div className="mono">{p.runsConceded}</div>
            <div className="mono" style={{ color: p.wicketsTaken > 0 ? "var(--gold)" : "inherit" }}>
              {p.wicketsTaken}
            </div>
            <div className="mono">{eco ?? "—"}</div>
          </div>
        );
      })}
      {activeBowlers.length === 0 && (
        <div style={{ color: "var(--text-dim)", fontSize: "0.82rem", paddingTop: 6 }}>
          No bowling data yet.
        </div>
      )}
    </Card>
  );
}

// ── FallOfWicketsCard ──────────────────────────────────────────
function FallOfWicketsCard({ innings }) {
  return (
    <Card title="Fall of Wickets">
      {innings.fallOfWickets.length === 0 && (
        <div style={{ color: "var(--text-dim)", fontSize: "0.82rem" }}>No wickets yet.</div>
      )}
      {innings.fallOfWickets.map((f, i) => (
        <div
          key={i}
          className="flex justify-between"
          style={{ padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "0.82rem" }}
        >
          <span style={{ color: "var(--text-dim)" }}>
            {i + 1}. {f.batsmanName || "—"}
          </span>
          <span className="mono" style={{ fontSize: "0.72rem" }}>
            {f.runs}/{f.wickets} ({ballsToOvers(f.balls)})
          </span>
        </div>
      ))}
    </Card>
  );
}

// ── OverSummaryCard ────────────────────────────────────────────
function OverSummaryCard({ overs }) {
  if (overs.length === 0) return null;
  return (
    <Card title="Over by Over">
      {overs.map((over, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginBottom: 4 }}>
            Over {i + 1} — {over.reduce((s, b) => {
              const n = parseInt(b);
              return s + (isNaN(n) ? 0 : n);
            }, 0)} runs
          </div>
          <div className="over-balls">
            {over.map((b, j) => (
              <div key={j} className={`ball-chip ${ballClass(b)}`}>{b}</div>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}

// ── Scorecard (main export) ────────────────────────────────────
export function Scorecard({ innings, battingTeam, bowlingTeam }) {
  const [tab, setTab] = useState("bat");

  const TABS = [
    { key: "bat",  label: "Batting" },
    { key: "bowl", label: "Bowling" },
    { key: "fow",  label: "FoW" },
    { key: "overs",label: "Overs" },
  ];

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "bat"   && <BattingCard innings={innings} battingTeam={battingTeam} />}
      {tab === "bowl"  && <BowlingCard innings={innings} bowlingTeam={bowlingTeam} />}
      {tab === "fow"   && <FallOfWicketsCard innings={innings} />}
      {tab === "overs" && <OverSummaryCard overs={innings.overs} />}
    </div>
  );
}
