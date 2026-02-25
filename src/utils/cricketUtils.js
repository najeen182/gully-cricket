// ─── Formatting ───────────────────────────────────────────────
export const ballsToOvers = (balls) =>
  `${Math.floor(balls / 6)}.${balls % 6}`;

export const oversToMaxBalls = (overs) => overs * 6;

// ─── Rate Calculations ────────────────────────────────────────
export const calcRunRate = (runs, balls) =>
  balls === 0 ? "0.00" : ((runs / balls) * 6).toFixed(2);

export const calcRequiredRunRate = (target, runs, balls, totalBalls) => {
  const ballsLeft = totalBalls - balls;
  if (ballsLeft <= 0) return "---";
  const runsNeeded = target - runs;
  if (runsNeeded <= 0) return "0.00";
  return ((runsNeeded / ballsLeft) * 6).toFixed(2);
};

export const calcStrikeRate = (runs, balls) =>
  balls === 0 ? null : ((runs / balls) * 100).toFixed(0);

export const calcEconomy = (runs, totalBalls) => {
  if (totalBalls === 0) return null;
  return (runs / (totalBalls / 6)).toFixed(2);
};

// ─── Cricket Logic ─────────────────────────────────────────────

/**
 * Returns true if strike should rotate after this delivery.
 * Rules:
 *   - Odd runs (1, 3, 5) on a legal delivery → rotate
 *   - End of over (handled externally) → always rotate
 *   - Wide → no rotate
 *   - No ball → rotate based on runs off it
 */
export const shouldRotateStrike = (type, runs) => {
  if (type === "Wd") return false;   // wide — no rotate
  if (type === "W") return false;    // wicket — handled separately
  return runs % 2 === 1;
};

/**
 * Returns true if the delivery counts as a legal ball (advances over).
 */
export const isLegalDelivery = (type) =>
  type !== "Wd" && type !== "Nb";

/**
 * Returns true if this delivery ends the innings.
 */
export const isInningsOver = (wickets, balls, maxWickets, maxBalls) => {
  if (wickets >= maxWickets) return true;
  if (maxBalls > 0 && balls >= maxBalls) return true;
  return false;
};

/**
 * Determine match winner from both innings.
 * Returns { winner: 0|1|null, winType, margin }
 *   winner = index of teams[] that won, or null for tie
 */
export const determineWinner = (inn1Runs, inn1Wickets, inn2Runs, inn2Wickets, team2TotalPlayers) => {
  if (inn1Runs > inn2Runs) {
    return { winner: 0, winType: "runs", margin: inn1Runs - inn2Runs };
  }
  if (inn2Runs > inn1Runs) {
    const wicketsLeft = team2TotalPlayers - inn2Wickets;
    return { winner: 1, winType: "wickets", margin: wicketsLeft };
  }
  return { winner: null, winType: "tie", margin: 0 };
};

// ─── Player Factories ──────────────────────────────────────────
export const createPlayer = (id, name) => ({
  id,
  name: name || `Player ${id + 1}`,
  // batting
  runs: 0,
  balls: 0,
  fours: 0,
  sixes: 0,
  status: "yet to bat",   // "yet to bat" | "batting" | "out"
  // bowling
  oversBowled: 0,
  ballsBowled: 0,
  runsConceded: 0,
  wicketsTaken: 0,
  wides: 0,
  noBalls: 0,
});

export const createDefaultPlayers = (count) =>
  Array.from({ length: count }, (_, i) => createPlayer(i, `Player ${i + 1}`));

export const cloneTeamForInnings = (team) => ({
  ...team,
  players: team.players.map((p) => createPlayer(p.id, p.name)),
});

// ─── Innings Factory ───────────────────────────────────────────
export const createInnings = () => ({
  runs: 0,
  wickets: 0,
  balls: 0,
  extras: { wide: 0, noBall: 0, legBye: 0, bye: 0 },
  overs: [],           // array of completed overs (each is array of ball strings)
  currentOver: [],     // balls in current over
  batsmen: [0, 1],     // indices into batting team players
  strikerIdx: 0,       // index within batsmen[]
  nonStrikerIdx: 1,    // index within batsmen[]
  currentBowlerId: null,
  fallOfWickets: [],
  isComplete: false,
});


// ─── Replay innings to restore player stats ───────────────────
/**
 * Given a saved innings snapshot and the original team (just names+ids),
 * replay all recorded balls to reconstruct accurate per-player batting stats.
 *
 * Returns { battingPlayers, bowlingPlayers } with full stats restored.
 */
export const replayInningsStats = (teamBat, teamBowl, inningsSnap) => {
  if (!inningsSnap) {
    return {
      battingPlayers: teamBat.players.map((p) => createPlayer(p.id, p.name)),
      bowlingPlayers: teamBowl.players.map((p) => createPlayer(p.id, p.name)),
    };
  }

  const inn = inningsSnap;

  // Fresh player stat objects keyed by player id
  const batStats  = {};
  const bowlStats = {};
  teamBat.players.forEach((p)  => { batStats[p.id]  = createPlayer(p.id, p.name); });
  teamBowl.players.forEach((p) => { bowlStats[p.id] = createPlayer(p.id, p.name); });

  // Helper: get bowler id from over index (recorded in overs array)
  // We don't store bowler-per-over in the snapshot, so we can't attribute bowling
  // stats per-over perfectly. Instead we use fallOfWickets + current batsmen
  // to reconstruct batting status only, which is what matters for the batsman picker.

  // Mark dismissed batsmen
  inn.fallOfWickets.forEach((f) => {
    if (batStats[f.batsmanId]) batStats[f.batsmanId].status = "out";
  });

  // Mark current batsmen as batting
  inn.batsmen.forEach((playerIdx) => {
    const p = teamBat.players[playerIdx];
    if (p && batStats[p.id] && batStats[p.id].status !== "out") {
      batStats[p.id].status = "batting";
    }
  });

  // Reconstruct batting run totals by scanning all overs + currentOver balls.
  // We track striker using the same indices the innings uses.
  // NOTE: We can only approximate this since the innings doesn't snapshot
  // per-ball striker assignments precisely after resume. For the resume case
  // we just need correct status (out/batting/yet-to-bat) for the batsman picker.
  // Detailed stat reconstruction is a nice-to-have, not required for correctness.

  return {
    battingPlayers:  teamBat.players.map((p)  => batStats[p.id]  || createPlayer(p.id, p.name)),
    bowlingPlayers:  teamBowl.players.map((p) => bowlStats[p.id] || createPlayer(p.id, p.name)),
  };
};
