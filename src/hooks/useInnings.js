import { useState, useCallback, useRef } from "react";
import {
  createInnings,
  shouldRotateStrike,
  isLegalDelivery,
  isInningsOver,
} from "../utils/cricketUtils";

/**
 * useInnings — self-contained innings engine.
 *
 * All player stats live inside innings.batPlayers / innings.bowlPlayers.
 * The innings object is fully serialisable — save it anywhere to resume exactly.
 *
 * onBallCommitted(snap) fires after every ball so the caller can persist mid-over.
 */
export function useInnings({
  battingTeam,
  bowlingTeam,
  maxWickets,
  maxBalls,
  onComplete,
  onBallCommitted,
  resumeInnings = null,
}) {
  const refs = useRef({ onComplete, onBallCommitted });
  refs.current.onComplete     = onComplete;
  refs.current.onBallCommitted = onBallCommitted;

  // ── init ──────────────────────────────────────────────────
  const [innings, setInnings] = useState(() => {
    if (resumeInnings) {
      const snap = JSON.parse(JSON.stringify(resumeInnings));
      if (!snap.batPlayers)  snap.batPlayers  = battingTeam.players.map(p => ({ ...p }));
      if (!snap.bowlPlayers) snap.bowlPlayers = bowlingTeam.players.map(p => ({ ...p }));
      return snap;
    }
    const base = createInnings();
    base.batPlayers  = battingTeam.players.map(p => ({ ...p }));
    base.bowlPlayers = bowlingTeam.players.map(p => ({ ...p }));
    return base;
  });

  // Use refs for these so addBall closure is never stale
  const needBowlerRef  = useRef(resumeInnings ? !resumeInnings.currentBowlerId : true);
  const needBatsmanRef = useRef(false);
  const isCompleteRef  = useRef(resumeInnings?.isComplete ?? false);

  // Mirror refs into state for re-render
  const [needBowler,  setNeedBowlerState]  = useState(needBowlerRef.current);
  const [needBatsman, setNeedBatsmanState] = useState(needBatsmanRef.current);
  const [isComplete,  setIsCompleteState]  = useState(isCompleteRef.current);

  const setNeedBowler = (v) => { needBowlerRef.current = v;  setNeedBowlerState(v); };
  const setNeedBatsman= (v) => { needBatsmanRef.current = v; setNeedBatsmanState(v); };
  const setIsComplete = (v) => { isCompleteRef.current = v;  setIsCompleteState(v); };

  // ── finishInnings ─────────────────────────────────────────
  const finishInnings = useCallback((inn) => {
    const snap = JSON.parse(JSON.stringify(inn));
    snap.isComplete = true;
    setIsComplete(true);
    setInnings(snap);
    refs.current.onComplete?.(snap);
  }, []);

  // ── available batsmen ─────────────────────────────────────
  const getAvailableBatsmen = (inn) => {
    const players = inn.batPlayers || [];
    // dismissed = in fallOfWickets
    const dismissedIds = new Set(inn.fallOfWickets.map(f => f.batsmanId));
    // currently at crease = batsmen[] slots whose player is NOT dismissed
    const atCreaseIndices = new Set(
      inn.batsmen.filter(idx => {
        const p = players[idx];
        return p && !dismissedIds.has(p.id);
      })
    );
    return players
      .map((p, idx) => ({ player: p, idx }))
      .filter(({ player, idx }) =>
        !dismissedIds.has(player.id) && !atCreaseIndices.has(idx)
      );
  };

  // ── addBall ───────────────────────────────────────────────
  const addBall = useCallback((type, runs = 0) => {
    // Read from refs — always fresh, no stale closure
    if (isCompleteRef.current || needBowlerRef.current || needBatsmanRef.current) return;

    let committedSnap = null;
    let batsmanNeeded = false;
    let bowlerNeeded  = false;
    let endAfterThis  = false;

    setInnings((prev) => {
      const inn    = JSON.parse(JSON.stringify(prev));
      const striker = inn.batPlayers[inn.batsmen[inn.strikerIdx]];
      const bowler  = inn.bowlPlayers.find(p => p.id === inn.currentBowlerId);
      const legal   = isLegalDelivery(type);

      if (type === "W") {
        if (runs > 0) inn.runs += runs;
        inn.wickets++;
        inn.balls++;
        inn.currentOver.push(runs > 0 ? `W+${runs}` : "W");
        if (striker) { striker.status = "out"; striker.balls++; }
        if (bowler)  { bowler.wicketsTaken++; bowler.ballsBowled++; }
        inn.fallOfWickets.push({
          runs: inn.runs, wickets: inn.wickets, balls: inn.balls,
          batsmanId: striker?.id, batsmanName: striker?.name,
        });
        if (runs % 2 === 1) {
          [inn.strikerIdx, inn.nonStrikerIdx] = [inn.nonStrikerIdx, inn.strikerIdx];
        }
        if (legal && inn.balls > 0 && inn.balls % 6 === 0) {
          if (bowler) bowler.oversBowled++;
          inn.overs.push([...inn.currentOver]);
          inn.currentOver = [];
          inn.currentBowlerId = null;
          bowlerNeeded = true;
        }
        const allOut = inn.wickets >= maxWickets;
        const avail  = getAvailableBatsmen(inn);
        if (allOut || avail.length === 0) endAfterThis = true;
        else batsmanNeeded = true;

      } else if (type === "Wd") {
        inn.runs++; inn.extras.wide++;
        inn.currentOver.push("Wd");
        if (bowler) { bowler.runsConceded++; bowler.wides++; }

      } else if (type === "Nb") {
        inn.runs += 1 + runs; inn.extras.noBall++;
        if (striker) {
          striker.runs += runs; striker.balls++;
          if (runs === 4) striker.fours++;
          if (runs === 6) striker.sixes++;
        }
        if (bowler) { bowler.runsConceded += 1 + runs; bowler.noBalls++; }
        inn.currentOver.push(runs > 0 ? `Nb+${runs}` : "Nb");

      } else if (type === "Lb") {
        inn.runs += runs; inn.extras.legBye += runs; inn.balls++;
        inn.currentOver.push(`Lb${runs}`);
        if (bowler) { bowler.ballsBowled++; bowler.runsConceded += runs; }

      } else {
        inn.runs += runs; inn.balls++;
        inn.currentOver.push(String(runs));
        if (striker) {
          striker.runs += runs; striker.balls++;
          if (runs === 4) striker.fours++;
          if (runs === 6) striker.sixes++;
          striker.status = "batting";
        }
        if (bowler) { bowler.runsConceded += runs; bowler.ballsBowled++; }
      }

      if (type !== "W") {
        const effRuns = (type === "Nb" || type === "Wd") ? 0 : runs;
        if (shouldRotateStrike(type, effRuns)) {
          [inn.strikerIdx, inn.nonStrikerIdx] = [inn.nonStrikerIdx, inn.strikerIdx];
        }
        if (legal && inn.balls > 0 && inn.balls % 6 === 0) {
          [inn.strikerIdx, inn.nonStrikerIdx] = [inn.nonStrikerIdx, inn.strikerIdx];
          if (bowler) bowler.oversBowled++;
          inn.overs.push([...inn.currentOver]);
          inn.currentOver = [];
          inn.currentBowlerId = null;
          bowlerNeeded = true;
        }
        if (isInningsOver(inn.wickets, inn.balls, maxWickets, maxBalls)) {
          endAfterThis = true;
        }
      }

      committedSnap = JSON.parse(JSON.stringify(inn));
      return inn;
    });

    // Apply side-effects after state settles
    setTimeout(() => {
      if (committedSnap) refs.current.onBallCommitted?.(committedSnap);

      if (batsmanNeeded) {
        setNeedBatsman(true);
        // bowlerNeeded will be detected in selectBatsman via currentBowlerId check
      } else if (bowlerNeeded) {
        setNeedBowler(true);
      } else if (endAfterThis) {
        setInnings((latest) => {
          if (!latest.isComplete) finishInnings(latest);
          return latest;
        });
      }
    }, 0);
  }, [maxWickets, maxBalls, finishInnings]); // no needBowler/needBatsman in deps — use refs

  // ── checkEnd (called from useEffect) ─────────────────────
  const checkEnd = useCallback(() => {
    if (isCompleteRef.current || needBatsmanRef.current || needBowlerRef.current) return;
    setInnings((inn) => {
      if (inn.isComplete) return inn;
      if (isInningsOver(inn.wickets, inn.balls, maxWickets, maxBalls)) finishInnings(inn);
      return inn;
    });
  }, [maxWickets, maxBalls, finishInnings]);

  // ── selectBowler ──────────────────────────────────────────
  const selectBowler = useCallback((bowlPlayerIdx) => {
    setInnings((prev) => {
      const updated = { ...prev, currentBowlerId: prev.bowlPlayers[bowlPlayerIdx].id };
      refs.current.onBallCommitted?.(JSON.parse(JSON.stringify(updated)));
      return updated;
    });
    setNeedBowler(false);
  }, []);

  // ── selectBatsman ─────────────────────────────────────────
  const selectBatsman = useCallback((batPlayerIdx) => {
    let needsBowlerAfter = false;
    setInnings((prev) => {
      const inn = JSON.parse(JSON.stringify(prev));
      inn.batsmen[inn.strikerIdx] = batPlayerIdx;
      inn.batPlayers[batPlayerIdx].status = "batting";
      needsBowlerAfter = !inn.currentBowlerId;
      refs.current.onBallCommitted?.(JSON.parse(JSON.stringify(inn)));
      return inn;
    });
    setNeedBatsman(false);
    setTimeout(() => {
      if (needsBowlerAfter) setNeedBowler(true);
    }, 0);
  }, []);

  return {
    innings,
    needBowler,
    needBatsman,
    isComplete,
    addBall,
    checkEnd,
    selectBowler,
    selectBatsman,
    availableBatsmen: getAvailableBatsmen(innings),
    battingTeamWithStats:  { ...battingTeam, players: innings.batPlayers  || battingTeam.players },
    bowlingTeamWithStats:  { ...bowlingTeam, players: innings.bowlPlayers || bowlingTeam.players },
  };
}
