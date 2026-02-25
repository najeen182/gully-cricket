import { useState } from "react";
import { ballsToOvers, calcStrikeRate, calcEconomy } from "../../utils/cricketUtils";
import { Card, Divider, Tabs } from "../common";

const BALL_CLASS = {
  "0":"bc-0","1":"bc-1","2":"bc-2","3":"bc-3",
  "4":"bc-4","6":"bc-6","W":"bc-W","Wd":"bc-Wd","Nb":"bc-Nb","Lb":"bc-Lb",
};
const ballClass = (b) => {
  for (const k of Object.keys(BALL_CLASS)) if (b.startsWith(k)) return BALL_CLASS[k];
  return "bc-0";
};

function InningsDisplay({ innings, battingTeam, bowlingTeam, label }) {
  // Use stats stored inside innings when available (from useInnings / saved match)
  const batPlayers  = innings?.batPlayers  || battingTeam?.players  || [];
  const bowlPlayers = innings?.bowlPlayers || bowlingTeam?.players  || [];
  const [tab, setTab] = useState("bat");
  if (!innings) return null;

  const TABS = [
    { key:"bat",   label:"Batting"  },
    { key:"bowl",  label:"Bowling"  },
    { key:"fow",   label:"FoW"      },
    { key:"overs", label:"Overs"    },
  ];

  const totalExtras = (innings.extras?.wide ?? 0) + (innings.extras?.noBall ?? 0)
    + (innings.extras?.legBye ?? 0) + (innings.extras?.bye ?? 0);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily:"Orbitron,monospace", fontSize:"0.6rem", letterSpacing:2,
        color:"var(--gold)", textTransform:"uppercase", marginBottom:8,
      }}>
        {label} — {battingTeam?.name}
      </div>

      {/* Mini scoreboard */}
      <div style={{
        background:"linear-gradient(135deg,#0a2a10,#051508)",
        border:"1px solid var(--gold)", borderRadius:12, padding:"12px",
        textAlign:"center", marginBottom:10,
      }}>
        <div style={{ fontFamily:"Bebas Neue,sans-serif", fontSize:"2.8rem", lineHeight:1, color:"#fff" }}>
          {innings.runs}
          <span style={{ color:"var(--gold)" }}>/</span>
          <span style={{ color:"var(--red)" }}>{innings.wickets}</span>
        </div>
        <div style={{ fontFamily:"Orbitron,monospace", fontSize:"0.75rem", color:"var(--text-dim)", marginTop:4 }}>
          {ballsToOvers(innings.balls)} overs
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "bat" && (
        <Card>
          <table className="sc-table">
            <thead><tr>
              <th>Batsman</th>
              <th className="rc">R</th><th className="rc">B</th>
              <th className="rc">4s</th><th className="rc">6s</th><th className="rc">SR</th>
            </tr></thead>
            <tbody>
              {batPlayers.map((p) => {
                if (p.balls === 0 && p.status === "yet to bat") return null;
                return (
                  <tr key={p.id} className={p.status === "out" ? "dismissed" : ""}>
                    <td>{p.name}{p.status !== "out" && p.status !== "yet to bat" && <span style={{ color:"var(--gold)", marginLeft:4, fontSize:"0.65rem" }}>*</span>}</td>
                    <td className="rc">{p.runs}</td>
                    <td className="rc">{p.balls}</td>
                    <td className="rc">{p.fours}</td>
                    <td className="rc">{p.sixes}</td>
                    <td className="rc">{calcStrikeRate(p.runs, p.balls) ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Divider />
          <div className="extras-row">
            <span className="extra-chip">Extras: {totalExtras}</span>
            <span className="extra-chip">Wd: {innings.extras?.wide ?? 0}</span>
            <span className="extra-chip">Nb: {innings.extras?.noBall ?? 0}</span>
            <span className="extra-chip">Lb: {innings.extras?.legBye ?? 0}</span>
          </div>
          <Divider />
          <div className="mono" style={{ fontSize:"0.88rem", color:"var(--gold)" }}>
            Total: {innings.runs}/{innings.wickets} ({ballsToOvers(innings.balls)} ov)
          </div>
        </Card>
      )}

      {tab === "bowl" && (
        <Card>
          <div className="bowl-row bowl-head">
            <div>Bowler</div><div>O</div><div>R</div><div>W</div><div>Eco</div>
          </div>
          {bowlPlayers.filter((p) => p.ballsBowled > 0 || p.oversBowled > 0).map((p) => {
            const totalBalls = p.oversBowled * 6 + (p.ballsBowled % 6);
            return (
              <div key={p.id} className="bowl-row">
                <div style={{ fontWeight:600 }}>{p.name}</div>
                <div className="mono">{p.oversBowled}.{p.ballsBowled % 6}</div>
                <div className="mono">{p.runsConceded}</div>
                <div className="mono" style={{ color: p.wicketsTaken > 0 ? "var(--gold)" : "inherit" }}>{p.wicketsTaken}</div>
                <div className="mono">{calcEconomy(p.runsConceded, totalBalls) ?? "—"}</div>
              </div>
            );
          })}
        </Card>
      )}

      {tab === "fow" && (
        <Card title="Fall of Wickets">
          {innings.fallOfWickets?.length === 0 && (
            <div style={{ color:"var(--text-dim)", fontSize:"0.82rem" }}>No wickets fell.</div>
          )}
          {innings.fallOfWickets?.map((f, i) => (
            <div key={i} className="flex justify-between" style={{ padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"0.82rem" }}>
              <span style={{ color:"var(--text-dim)" }}>{i+1}. {f.batsmanName ?? "—"}</span>
              <span className="mono" style={{ fontSize:"0.72rem" }}>{f.runs}/{f.wickets} ({ballsToOvers(f.balls)})</span>
            </div>
          ))}
        </Card>
      )}

      {tab === "overs" && innings.overs?.length > 0 && (
        <Card title="Over by Over">
          {innings.overs.map((over, i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ fontSize:"0.65rem", color:"var(--text-dim)", marginBottom:4 }}>Over {i+1}</div>
              <div className="over-balls">
                {over.map((b, j) => <div key={j} className={`ball-chip ${ballClass(b)}`}>{b}</div>)}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── MatchViewer ───────────────────────────────────────────────
export function MatchViewer({ match, onResume, onBack }) {
  if (!match) return null;

  const t0 = match.teams?.[match.battingFirstIdx ?? 0];
  const t1 = match.teams?.[match.battingFirstIdx === 0 ? 1 : 0];
  const isLive = match.status === "in-progress";

  return (
    <div className="screen">
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <button className="btn btn-ghost btn-xs" onClick={onBack}>← Back</button>
        <div style={{ fontFamily:"Orbitron,monospace", fontSize:"0.6rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase" }}>
          Match Details
        </div>
      </div>

      {/* Match header */}
      <Card style={{ marginBottom:12, textAlign:"center" }}>
        <div style={{ fontWeight:700, fontSize:"1rem", marginBottom:4 }}>
          {match.teams?.[0]?.name} <span style={{ color:"var(--text-dim)", fontWeight:400 }}>vs</span> {match.teams?.[1]?.name}
        </div>
        <div style={{ fontSize:"0.72rem", color:"var(--text-dim)", marginBottom:8 }}>
          {match.matchType === "test" ? "Test Match" : `${match.limitedConfig?.overs ?? "?"}-over Match`}
          {match.seriesId && ` · Match ${match.matchNum}`}
        </div>

        {/* Result */}
        {match.result && (
          <div style={{
            padding:"10px", borderRadius:8, marginBottom:8,
            background:"rgba(245,200,66,0.08)", border:"1px solid var(--border)",
          }}>
            <div style={{ fontSize:"1.4rem", marginBottom:4 }}>
              {match.result.winType === "tie" ? "🤝" : "🏆"}
            </div>
            <div style={{ color:"var(--gold)", fontWeight:700 }}>
              {match.result.winType === "tie" ? "Match Tied" : match.result.resultText}
            </div>
          </div>
        )}

        {isLive && (
          <div style={{ marginBottom:8 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:6,
              background:"rgba(50,200,100,0.12)", border:"1px solid rgba(50,200,100,0.3)",
              borderRadius:20, padding:"4px 12px", fontSize:"0.72rem", color:"#50cc70",
            }}>
              <span style={{ animation:"blink 1.2s infinite" }}>●</span>
              Match in progress
            </div>
          </div>
        )}

        {isLive && onResume && (
          <button className="btn btn-green" onClick={() => onResume(match)}>
            ▶ Resume Match
          </button>
        )}
      </Card>

      {/* Innings */}
      <InningsDisplay
        innings={match.innings1}
        battingTeam={t0}
        bowlingTeam={t1}
        label="1st Innings"
      />
      {match.innings2 && (
        <InningsDisplay
          innings={match.innings2}
          battingTeam={t1}
          bowlingTeam={t0}
          label="2nd Innings"
        />
      )}

      {!match.innings1 && (
        <div style={{ textAlign:"center", color:"var(--text-dim)", padding:"30px 0", fontSize:"0.85rem" }}>
          Match hasn't started yet or no innings data.
        </div>
      )}
    </div>
  );
}
