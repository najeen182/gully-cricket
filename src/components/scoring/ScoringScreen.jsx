import { useEffect, useState } from "react";
import { useInnings } from "../../hooks/useInnings";
import { determineWinner, ballsToOvers } from "../../utils/cricketUtils";
import {
  Scoreboard, BatsmenPanel, BowlerPanel, OverDisplay, RunButtons,
  BowlerSelectModal, BatsmanSelectModal,
} from "./ScoringWidgets";
import { Scorecard } from "./Scorecard";
import { Snackbar, WinnerOverlay, useSnackbar, InningsBadge, Modal } from "../common";

// ── Innings Complete Banner ────────────────────────────────────
function InningsCompleteBanner({ battingTeam, innings, onContinue }) {
  return (
    <div className="card" style={{ textAlign:"center", borderColor:"var(--gold)" }}>
      <div style={{ fontSize:"1.4rem", marginBottom:7 }}>🏏</div>
      <div className="mono" style={{ color:"var(--gold)", fontSize:"0.78rem", letterSpacing:2, marginBottom:7 }}>
        Innings Complete
      </div>
      <div style={{ color:"var(--text-dim)", marginBottom:12, fontSize:"0.88rem" }}>
        {battingTeam.name}: {innings.runs}/{innings.wickets} ({ballsToOvers(innings.balls)} ov)
      </div>
      <button className="btn btn-gold" onClick={onContinue}>Continue →</button>
    </div>
  );
}

// ── Wicket Runs Modal ──────────────────────────────────────────
// Shown when W is pressed — asks "were any runs scored with this wicket?"
function WicketRunsModal({ onConfirm }) {
  const [runs, setRuns] = useState(0);

  const RunOption = ({ r }) => (
    <button
      className="btn"
      style={{
        padding:"14px 0",
        background: runs === r
          ? "linear-gradient(135deg,var(--gold),#c8960e)"
          : "rgba(255,255,255,0.05)",
        color: runs === r ? "#1a1000" : "var(--text)",
        border: `2px solid ${runs === r ? "var(--gold)" : "var(--border)"}`,
        fontFamily:"Bebas Neue,sans-serif", fontSize:"1.6rem",
        borderRadius:10, cursor:"pointer",
        transition:"all 0.12s",
      }}
      onClick={() => setRuns(r)}
    >
      {r}
    </button>
  );

  return (
    <Modal title="⚡ Wicket!">
      <div style={{ color:"var(--text-dim)", fontSize:"0.85rem", marginBottom:14, lineHeight:1.5 }}>
        Any runs scored alongside this wicket?
        <div style={{ fontSize:"0.75rem", marginTop:4, opacity:0.7 }}>
          (e.g. a run completed before the run-out)
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
        {[0,1,2,3].map((r) => <RunOption key={r} r={r} />)}
      </div>
      <div style={{
        textAlign:"center", fontSize:"0.78rem", color:"var(--text-dim)",
        padding:"8px 0", marginBottom:14,
        borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)",
      }}>
        {runs === 0 ? "No runs — clean dismissal" : `${runs} run${runs > 1 ? "s" : ""} scored before dismissal`}
      </div>
      <button className="btn btn-gold" style={{ width:"100%" }} onClick={() => onConfirm(runs)}>
        ✓ Confirm Wicket
      </button>
    </Modal>
  );
}

// ── End Match Confirm Modal ────────────────────────────────────
function EndMatchModal({ onConfirm, onCancel }) {
  return (
    <Modal title="End Match Early?">
      <div style={{ color:"var(--text-dim)", fontSize:"0.88rem", marginBottom:16, lineHeight:1.6 }}>
        This will mark the match as <strong style={{ color:"#f08080" }}>abandoned</strong>.
        The scorecard is saved and viewable in Match History.
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          className="btn"
          style={{ background:"linear-gradient(135deg,#7a1a1a,#500e0e)", color:"#f08080", border:"1px solid rgba(240,128,128,0.3)" }}
          onClick={onConfirm}
        >
          End Match
        </button>
      </div>
    </Modal>
  );
}

// ── ScoringScreen ──────────────────────────────────────────────
export function ScoringScreen({
  battingTeam,
  bowlingTeam,
  maxWickets,
  maxBalls,
  matchType,
  inningsNum,
  target,
  onInningsEnd,
  onEndMatch,
  onLiveSave,
  resumeInnings = null,
}) {
  const { snackMsg, snackKey, toast } = useSnackbar();
  const [view, setView]                     = useState("live");
  const [winnerInfo, setWinnerInfo]         = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [pendingWicket, setPendingWicket]   = useState(false);

  const handleInningsComplete = (snap) => {
    if (inningsNum === 2 && target) {
      const wi = determineWinner(target - 1, 0, snap.runs, snap.wickets, bat.players.length);
      setWinnerInfo({ ...wi, snap });
    }
  };

  const {
    innings, needBowler, needBatsman, isComplete,
    addBall, checkEnd, selectBowler, selectBatsman, availableBatsmen,
    battingTeamWithStats, bowlingTeamWithStats,
  } = useInnings({
    battingTeam, bowlingTeam, maxWickets, maxBalls,
    onComplete: handleInningsComplete,
    onBallCommitted: onLiveSave,
    resumeInnings,
  });

  // Use teams with live stats (from hook) for all rendering
  const bat  = battingTeamWithStats;
  const bowl = bowlingTeamWithStats;

  // Check innings end after every render
  useEffect(() => {
    if (!isComplete && !pendingWicket) checkEnd();
  });

  // Mid-innings chase win detection
  useEffect(() => {
    if (inningsNum === 2 && target && innings.runs >= target && !winnerInfo && !isComplete) {
      const wicketsLeft = bat.players.length - innings.wickets;
      setWinnerInfo({ winner:1, winType:"wickets", margin:wicketsLeft, snap:innings });
    }
  }, [innings.runs, target, inningsNum, winnerInfo, isComplete, innings, battingTeam]);

  const handleBall = (type, runs = 0) => {
    if (isComplete || needBowler || needBatsman || winnerInfo || pendingWicket) return;
    if (type === "W") {
      setPendingWicket(true);   // show "runs on wicket?" modal first
      return;
    }
    if (runs === 4) toast("🏏 FOUR!");
    else if (runs === 6) toast("💥 SIX!");
    addBall(type, runs);
  };

  const handleWicketConfirm = (runsOnWicket) => {
    setPendingWicket(false);
    toast("⚡ WICKET!");
    addBall("W", runsOnWicket);
  };

  const bowler = bowl.players.find((p) => p.id === innings.currentBowlerId);

  return (
    <div className="screen">
      {snackMsg && <Snackbar key={snackKey} msg={snackMsg} />}

      {/* Winner overlay */}
      {winnerInfo && (
        <WinnerOverlay
          winnerName={winnerInfo.winner === 1 ? bat.name : bowl.name}
          resultText={
            winnerInfo.winType === "wickets"
              ? `Won by ${winnerInfo.margin} wicket${winnerInfo.margin !== 1 ? "s" : ""}`
              : winnerInfo.winType === "runs"
              ? `Won by ${winnerInfo.margin} run${winnerInfo.margin !== 1 ? "s" : ""}`
              : "It's a tie!"
          }
          winType={winnerInfo.winType}
          onContinue={() => onInningsEnd(winnerInfo.snap || innings)}
        />
      )}

      {/* Step 1: Wicket runs? */}
      {pendingWicket && (
        <WicketRunsModal onConfirm={handleWicketConfirm} />
      )}

      {/* Step 2: New batsman (after wicket confirmed) — show BEFORE bowler */}
      {needBatsman && !isComplete && !winnerInfo && !pendingWicket && (
        <BatsmanSelectModal
          availableBatsmen={availableBatsmen}
          onSelect={selectBatsman}
        />
      )}

      {/* Step 3: Bowler picker (end of over, only after new batsman selected if both needed) */}
      {needBowler && !needBatsman && !isComplete && !winnerInfo && !pendingWicket && (
        <BowlerSelectModal
          bowlingTeam={bowl}
          currentBowlerId={innings.currentBowlerId}
          onSelect={selectBowler}
        />
      )}

      {/* End match confirm */}
      {showEndConfirm && (
        <EndMatchModal
          onConfirm={() => { setShowEndConfirm(false); onEndMatch?.(innings); }}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}

      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, gap:6, flexWrap:"wrap" }}>
        <InningsBadge>
          {matchType === "test" ? `Innings ${inningsNum}` : `${bat.name} Batting`}
        </InningsBadge>
        <div style={{ display:"flex", gap:6 }}>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setView((v) => v === "live" ? "card" : "live")}
          >
            {view === "live" ? "📋 Scorecard" : "🏏 Live"}
          </button>
          {!isComplete && !winnerInfo && (
            <button
              className="btn btn-xs"
              style={{ background:"rgba(230,57,70,0.15)", color:"#f08080", border:"1px solid rgba(230,57,70,0.3)" }}
              onClick={() => setShowEndConfirm(true)}
            >
              🏁 End
            </button>
          )}
        </div>
      </div>

      {view === "live" && (
        <>
          <Scoreboard innings={innings} maxBalls={maxBalls} target={target} battingTeamName={battingTeam.name} />
          <BatsmenPanel batting={bat} innings={innings} />
          <BowlerPanel bowler={bowler} />
          <OverDisplay innings={innings} />
          {!isComplete && !needBowler && !needBatsman && !winnerInfo && !pendingWicket && (
            <RunButtons onBall={handleBall} />
          )}
          {isComplete && !winnerInfo && (
            <InningsCompleteBanner
              battingTeam={bat}
              innings={innings}
              onContinue={() => onInningsEnd(innings)}
            />
          )}
        </>
      )}

      {view === "card" && (
        <Scorecard innings={innings} battingTeam={bat} bowlingTeam={bowl} />
      )}
    </div>
  );
}
