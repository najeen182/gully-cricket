import { calcRunRate, calcRequiredRunRate, ballsToOvers } from "../../utils/cricketUtils";
import { Modal } from "../common";

// ── Scoreboard ────────────────────────────────────────────────
export function Scoreboard({ innings, maxBalls, target, battingTeamName }) {
  const rr    = calcRunRate(innings.runs, innings.balls);
  const reqRR = target ? calcRequiredRunRate(target, innings.runs, innings.balls, maxBalls) : null;
  const remaining  = target ? target - innings.runs : null;
  const ballsLeft  = maxBalls > 0 ? maxBalls - innings.balls : null;
  const reqRRHigh  = reqRR && parseFloat(reqRR) > parseFloat(rr) * 1.5;

  return (
    <div className="scoreboard">
      <div className="score-main">
        <div className="score-runs">
          {innings.runs}
          <span className="score-sep">/</span>
          <span className="score-wkts">{innings.wickets}</span>
        </div>
        <div className="score-overs">
          {ballsToOvers(innings.balls)}
          {maxBalls > 0 ? ` / ${ballsToOvers(maxBalls)}` : ""} Overs
        </div>
        {target && (
          <div className="score-target">
            Target {target}&nbsp;·&nbsp;
            Need <strong>{remaining > 0 ? remaining : 0}</strong> from <strong>{ballsLeft}</strong> balls
          </div>
        )}
      </div>
      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-val">{rr}</span>
          <span className="stat-lbl">Run Rate</span>
        </div>
        {target ? (
          <div className="stat-box">
            <span className="stat-val" style={{ color: reqRRHigh ? "var(--red)" : "var(--gold)" }}>{reqRR}</span>
            <span className="stat-lbl">Req Rate</span>
          </div>
        ) : (
          <div className="stat-box">
            <span className="stat-val">{innings.wickets}</span>
            <span className="stat-lbl">Wickets</span>
          </div>
        )}
        <div className="stat-box">
          <span className="stat-val">
            {innings.extras.wide + innings.extras.noBall + innings.extras.legBye + innings.extras.bye}
          </span>
          <span className="stat-lbl">Extras</span>
        </div>
      </div>
    </div>
  );
}

// ── BatsmenPanel ──────────────────────────────────────────────
function BatsmanBox({ player, isStriker, label }) {
  return (
    <div className={`player-box ${isStriker ? "on-strike" : ""}`}>
      <div className="player-role">{label}{isStriker && <span className="strike-dot" />}</div>
      <div className="player-name">{player?.name || "—"}</div>
      <div className="player-score">
        {player ? `${player.runs}(${player.balls})  4s:${player.fours}  6s:${player.sixes}` : ""}
      </div>
    </div>
  );
}

export function BatsmenPanel({ batting, innings }) {
  const striker    = batting.players[innings.batsmen[innings.strikerIdx]];
  const nonStriker = batting.players[innings.batsmen[innings.nonStrikerIdx]];
  return (
    <div className="players-grid">
      <BatsmanBox player={striker}    isStriker label="Striker" />
      <BatsmanBox player={nonStriker} isStriker={false} label="Non-Striker" />
    </div>
  );
}

// ── BowlerPanel ───────────────────────────────────────────────
export function BowlerPanel({ bowler }) {
  return (
    <div className="card" style={{ padding:"9px 13px", marginBottom:7 }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="player-role">Bowling</div>
          <div className="player-name">{bowler?.name || "Select Bowler"}</div>
        </div>
        {bowler && (
          <div style={{ textAlign:"right" }}>
            <div className="mono" style={{ color:"var(--gold)" }}>
              {bowler.wicketsTaken}/{bowler.runsConceded}
            </div>
            <div style={{ fontSize:"0.62rem", color:"var(--text-dim)" }}>
              {bowler.oversBowled}.{bowler.ballsBowled % 6} ov
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── OverDisplay ───────────────────────────────────────────────
const BALL_CLASS = {
  "0":"bc-0","1":"bc-1","2":"bc-2","3":"bc-3",
  "4":"bc-4","6":"bc-6","W":"bc-W","Wd":"bc-Wd","Nb":"bc-Nb","Lb":"bc-Lb",
};
const ballClass = (b) => {
  for (const k of Object.keys(BALL_CLASS)) if (b.startsWith(k)) return BALL_CLASS[k];
  return "bc-0";
};

export function OverDisplay({ innings }) {
  return (
    <div className="card" style={{ padding:"9px 13px", marginBottom:7 }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize:"0.68rem", color:"var(--text-dim)", letterSpacing:2, textTransform:"uppercase" }}>
          This Over
        </span>
        <span className="mono" style={{ fontSize:"0.68rem", color:"var(--text-dim)" }}>
          Ov {innings.overs.length + 1}
        </span>
      </div>
      <div className="over-balls">
        {innings.currentOver.length === 0
          ? <span style={{ fontSize:"0.72rem", color:"var(--text-dim)" }}>—</span>
          : innings.currentOver.map((b, i) => (
              <div key={i} className={`ball-chip ${ballClass(b)}`}>{b}</div>
            ))
        }
      </div>
    </div>
  );
}

// ── RunButtons ────────────────────────────────────────────────
const RUN_BUTTONS = [
  { label:"·",  type:"run", runs:0, cls:"rb-0" },
  { label:"1",  type:"run", runs:1, cls:"rb-1" },
  { label:"2",  type:"run", runs:2, cls:"rb-2" },
  { label:"3",  type:"run", runs:3, cls:"rb-3" },
  { label:"4",  type:"run", runs:4, cls:"rb-4" },
  { label:"6",  type:"run", runs:6, cls:"rb-6" },
  { label:"W",  type:"W",  runs:0, cls:"rb-W"  },
  { label:"WD", type:"Wd", runs:0, cls:"rb-Wd" },
];
const EXTRA_BUTTONS = [
  { label:"No Ball", type:"Nb", runs:0, cls:"rb-Nb" },
  { label:"Leg Bye", type:"Lb", runs:1, cls:"rb-Lb" },
];

export function RunButtons({ onBall }) {
  return (
    <>
      <div className="run-grid">
        {RUN_BUTTONS.map(({ label, type, runs, cls }) => (
          <button key={label} className={`run-btn ${cls}`} onClick={() => onBall(type, runs)}>
            {label}
          </button>
        ))}
      </div>
      <div className="run-grid-2">
        {EXTRA_BUTTONS.map(({ label, type, runs, cls }) => (
          <button key={label} className={`run-btn run-btn-wide ${cls}`} onClick={() => onBall(type, runs)}>
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

// ── BowlerSelect Modal ────────────────────────────────────────
export function BowlerSelectModal({ bowlingTeam, currentBowlerId, onSelect }) {
  return (
    <Modal title="Select Bowler">
      <div style={{ maxHeight:"60vh", overflowY:"auto" }}>
        {bowlingTeam.players.map((p, idx) => {
          const disabled = p.id === currentBowlerId;
          return (
            <button
              key={p.id}
              className="btn btn-ghost mb-2"
              style={{ justifyContent:"space-between", opacity: disabled ? 0.4 : 1 }}
              disabled={disabled}
              onClick={() => onSelect(idx)}
            >
              <span>{p.name}</span>
              <span className="mono" style={{ fontSize:"0.68rem", color:"var(--text-dim)" }}>
                {p.oversBowled}.{p.ballsBowled % 6}ov · {p.wicketsTaken}wkt
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

// ── BatsmanSelect Modal — uses availableBatsmen from useInnings ────────────
export function BatsmanSelectModal({ availableBatsmen, onSelect }) {
  return (
    <Modal title="🏏 New Batsman">
      <div style={{ fontSize:"0.8rem", color:"var(--text-dim)", marginBottom:12 }}>
        Select the next batsman to come in:
      </div>
      {availableBatsmen.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--text-dim)", padding:"20px 0" }}>
          No batsmen remaining!
        </div>
      ) : (
        <div style={{ maxHeight:"55vh", overflowY:"auto" }}>
          {availableBatsmen.map(({ player, idx }) => (
            <button
              key={player.id}
              className="btn btn-ghost mb-2"
              style={{ justifyContent:"flex-start", width:"100%" }}
              onClick={() => onSelect(idx)}
            >
              <span style={{ fontSize:"1rem", marginRight:8 }}>🏏</span>
              {player.name}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
