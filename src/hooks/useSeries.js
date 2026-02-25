import { useState } from "react";
import { determineWinner } from "../utils/cricketUtils";

/**
 * Manages a series of matches between two teams.
 *
 * Tracks:
 *   - series metadata (name, format, totalMatches)
 *   - wins / ties per team
 *   - full match history
 *   - whether the series has been decided early (best-of formats)
 */
export function useSeries({ seriesName, format, teams }) {
  const isBestOf = format.key === "best-of-3" || format.key === "best-of-5";
  const winsNeeded = isBestOf ? Math.ceil(format.totalMatches / 2) : null;

  const [matchHistory, setMatchHistory] = useState([]); // [{matchNum, team0wins, team1wins, result}]
  const [wins, setWins] = useState([0, 0]);             // [team0 wins, team1 wins]
  const [ties, setTies] = useState(0);

  const matchesPlayed = matchHistory.length;
  const matchesLeft   = format.totalMatches - matchesPlayed;

  // Series is decided when:
  //   best-of: one team hits winsNeeded
  //   fixed:   all matches played
  const seriesDecided = isBestOf
    ? wins[0] >= winsNeeded || wins[1] >= winsNeeded
    : matchesPlayed >= format.totalMatches;

  // Series winner index (0 or 1) or null for tie / not decided
  const getSeriesWinner = () => {
    if (!seriesDecided) return null;
    if (wins[0] > wins[1]) return 0;
    if (wins[1] > wins[0]) return 1;
    return null; // tie
  };

  /**
   * Record a completed match result.
   * battingFirstIdx: which team[] index batted first in this match
   * innings1, innings2: innings snapshots
   * Returns the match record added.
   */
  const recordMatch = (battingFirstIdx, innings1Snap, innings2Snap) => {
    const fieldingFirstIdx = battingFirstIdx === 0 ? 1 : 0;
    const team2 = teams[fieldingFirstIdx];

    const wi = determineWinner(
      innings1Snap?.runs ?? 0,
      innings1Snap?.wickets ?? 0,
      innings2Snap?.runs ?? 0,
      innings2Snap?.wickets ?? 0,
      team2?.players?.length ?? 10
    );

    // Map winner index from "batted first / second" to teams[] index
    let winnersTeamIdx = null;
    if (wi.winner !== null) {
      winnersTeamIdx = wi.winner === 0 ? battingFirstIdx : fieldingFirstIdx;
    }

    const record = {
      matchNum: matchesPlayed + 1,
      battingFirstIdx,
      innings1: innings1Snap,
      innings2: innings2Snap,
      winnersTeamIdx,   // null = tie
      winType: wi.winType,
      margin: wi.margin,
      resultText:
        wi.winType === "wickets"
          ? `${teams[winnersTeamIdx]?.name} won by ${wi.margin} wicket${wi.margin !== 1 ? "s" : ""}`
          : wi.winType === "runs"
          ? `${teams[winnersTeamIdx]?.name} won by ${wi.margin} run${wi.margin !== 1 ? "s" : ""}`
          : "Match Tied",
    };

    setMatchHistory((h) => [...h, record]);
    setWins((w) => {
      const next = [...w];
      if (winnersTeamIdx !== null) next[winnersTeamIdx]++;
      return next;
    });
    if (winnersTeamIdx === null) setTies((t) => t + 1);

    return record;
  };

  return {
    seriesName,
    format,
    teams,
    matchHistory,
    matchesPlayed,
    matchesLeft,
    wins,
    ties,
    winsNeeded,
    isBestOf,
    seriesDecided,
    getSeriesWinner,
    recordMatch,
  };
}
