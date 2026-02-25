import { useState, useCallback } from "react";
import { PHASES } from "./constants";
import { cloneTeamForInnings, oversToMaxBalls, determineWinner, replayInningsStats } from "./utils/cricketUtils";
import { usePersistence } from "./hooks/usePersistence";
import styles from "./styles/theme";

import { HomeScreen, LimitedSetup, TeamSetup, TossScreen } from "./components/setup";
import { SeriesSetup }       from "./components/series/SeriesSetup";
import { SeriesDashboard }   from "./components/series/SeriesDashboard";
import { ScoringScreen }     from "./components/scoring/ScoringScreen";
import { InningsBetween, MatchResult } from "./components/result";
import { MatchHistory }      from "./components/history/MatchHistory";
import { MatchViewer }       from "./components/history/MatchViewer";

const opp = (i) => (i === 0 ? 1 : 0);

export default function App() {
  // ── Phase ─────────────────────────────────────────────────
  const [phase, setPhase] = useState(PHASES.HOME);

  // ── Match format ──────────────────────────────────────────
  const [matchType,     setMatchType]     = useState("limited");
  const [limitedConfig, setLimitedConfig] = useState({ overs:10, wickets:10 });

  // ── Teams (persisted across series matches) ───────────────
  const [teams, setTeams] = useState([null, null]);

  // ── Series config & data ──────────────────────────────────
  const [isSeries,     setIsSeries]     = useState(false);
  const [seriesConfig, setSeriesConfig] = useState(null);
  const [seriesData,   setSeriesData]   = useState({ matchHistory:[], wins:[0,0], ties:0 });

  // ── Per-match ─────────────────────────────────────────────
  const [battingFirstIdx, setBattingFirstIdx] = useState(0);
  const [innings1Snap,    setInnings1Snap]    = useState(null);
  const [innings2Snap,    setInnings2Snap]    = useState(null);

  // ── Team editing ──────────────────────────────────────────
  const [editingTeam,   setEditingTeam]   = useState(null);
  const [afterEditPhase,setAfterEditPhase] = useState(null);

  // ── History viewer ────────────────────────────────────────
  const [viewingMatch, setViewingMatch] = useState(null); // match record from DB

  // ── Resume state ─────────────────────────────────────────────
  // Saved innings snaps + reconstructed team player stats for resume
  const [resumeInnings1, setResumeInnings1] = useState(null);
  const [resumeInnings2, setResumeInnings2] = useState(null);
  // Teams with player stats reconstructed from saved innings (used during resume)
  const [resumeTeams,    setResumeTeams]    = useState(null); // [batTeam, bowlTeam] | null

  // ── Persistence ───────────────────────────────────────────
  const persist = usePersistence();

  // ── Derived ───────────────────────────────────────────────
  const fieldingFirstIdx    = opp(battingFirstIdx);
  const maxWickets          = matchType === "test"
    ? (teams[battingFirstIdx]?.players?.length ?? 11)
    : limitedConfig.wickets;
  const maxBalls            = matchType === "test" ? 0 : oversToMaxBalls(limitedConfig.overs);
  const seriesMatchesPlayed = seriesData.matchHistory.length;
  const totalMatches        = seriesConfig?.format?.totalMatches ?? 1;
  const seriesMatchesLeft   = totalMatches - seriesMatchesPlayed;
  const isBestOf            = ["best-of-3","best-of-5"].includes(seriesConfig?.format?.key);
  const winsNeeded          = isBestOf ? Math.ceil(totalMatches / 2) : null;
  const seriesDecided       = isBestOf
    ? (seriesData.wins[0] >= winsNeeded || seriesData.wins[1] >= winsNeeded)
    : seriesMatchesPlayed >= totalMatches;

  const getSeriesWinner = () => {
    if (!seriesDecided) return null;
    if (seriesData.wins[0] > seriesData.wins[1]) return 0;
    if (seriesData.wins[1] > seriesData.wins[0]) return 1;
    return null;
  };

  // ── DB helpers ────────────────────────────────────────────

  /**
   * Build the full match patch to persist at any point.
   */
  const buildMatchPatch = (extra = {}) => ({
    matchType,
    limitedConfig,
    teams,
    battingFirstIdx,
    innings1: innings1Snap,
    innings2: innings2Snap,
    phase,
    seriesId:    persist.activeSeriesId ?? null,
    seriesName:  seriesConfig?.seriesName ?? null,
    matchNum:    isSeries ? seriesMatchesPlayed + 1 : null,
    ...extra,
  });

  /**
   * Create a new DB match record when the toss is done.
   */
  const dbStartMatch = async (bfi) => {
    const id = await persist.startMatch({
      matchType,
      limitedConfig,
      teams,
      battingFirstIdx: bfi,
      phase: PHASES.INNINGS1,
      seriesId:   persist.activeSeriesId ?? null,
      seriesName: seriesConfig?.seriesName ?? null,
      matchNum:   isSeries ? seriesMatchesPlayed + 1 : null,
    });
    return id;
  };

  // ── Reset helpers ─────────────────────────────────────────

  const resetMatch = () => {
    setBattingFirstIdx(0);
    setInnings1Snap(null);
    setInnings2Snap(null);
    setResumeInnings1(null);
    setResumeInnings2(null);
    setResumeTeams(null);
  };

  const fullReset = () => {
    resetMatch();
    setTeams([null, null]);
    setSeriesConfig(null);
    setIsSeries(false);
    setSeriesData({ matchHistory:[], wins:[0,0], ties:0 });
    setResumeInnings1(null);
    setResumeInnings2(null);
    persist.clearActive();
    setPhase(PHASES.HOME);
  };

  // ── Series result recording ───────────────────────────────

  const appendSeriesResult = (inn1, inn2, matchId) => {
    const team2 = teams[fieldingFirstIdx];
    const wi = determineWinner(
      inn1?.runs ?? 0, inn1?.wickets ?? 0,
      inn2?.runs ?? 0, inn2?.wickets ?? 0,
      team2?.players?.length ?? 10
    );
    const winnerTeamIdx = wi.winner === null ? null
      : wi.winner === 0 ? battingFirstIdx : fieldingFirstIdx;

    const record = {
      matchNum: seriesMatchesPlayed + 1,
      battingFirstIdx,
      innings1: inn1, innings2: inn2,
      winnersTeamIdx: winnerTeamIdx,
      winType:    wi.winType,
      margin:     wi.margin,
      resultText:
        wi.winType === "wickets"
          ? `${teams[winnerTeamIdx]?.name} won by ${wi.margin} wicket${wi.margin !== 1 ? "s" : ""}`
          : wi.winType === "runs"
          ? `${teams[winnerTeamIdx]?.name} won by ${wi.margin} run${wi.margin !== 1 ? "s" : ""}`
          : "Match Tied",
    };

    let newWins = [...seriesData.wins];
    if (winnerTeamIdx !== null) newWins[winnerTeamIdx]++;
    const newTies = winnerTeamIdx === null ? seriesData.ties + 1 : seriesData.ties;

    const newData = {
      matchHistory: [...seriesData.matchHistory, record],
      wins: newWins,
      ties: newTies,
    };
    setSeriesData(newData);

    // Persist series update
    if (matchId) persist.recordSeriesMatch(matchId, newWins, newTies);

    return newData;
  };

  // ── Navigation: Home ──────────────────────────────────────

  const handleSingleMatch = (type) => {
    setIsSeries(false); setSeriesConfig(null);
    setMatchType(type);
    setTeams([null, null]); resetMatch();
    setPhase(type === "limited" ? PHASES.LIMITED_SETUP : PHASES.TEAM1);
  };

  const handleGoSeries   = () => setPhase(PHASES.SERIES_SETUP);
  const handleGoHistory  = () => setPhase(PHASES.HISTORY);

  // ── Navigation: Series Setup ──────────────────────────────

  const handleSeriesSetupNext = async ({ seriesName, format }) => {
    setSeriesConfig({ seriesName, format });
    setIsSeries(true);
    setSeriesData({ matchHistory:[], wins:[0,0], ties:0 });
    setTeams([null, null]); resetMatch();
    // Create series in DB
    await persist.startSeries({ seriesName, format, matchType, limitedConfig, teams, wins:[0,0], ties:0 });
    setPhase(PHASES.LIMITED_SETUP);
  };

  // ── Navigation: Limited Setup ─────────────────────────────

  const handleLimitedNext = (cfg) => {
    setLimitedConfig(cfg);
    setMatchType("limited");
    if (teams[0] && teams[1]) setPhase(PHASES.TOSS);
    else                       setPhase(PHASES.TEAM1);
  };

  // ── Navigation: Team Setup ────────────────────────────────

  const handleTeam1Next = (team) => {
    setTeams((t) => [team, t[1]]);
    if (editingTeam === 1) {
      setEditingTeam(null);
      setPhase(afterEditPhase ?? PHASES.TEAM2);
    } else {
      setPhase(PHASES.TEAM2);
    }
  };

  const handleTeam2Next = (team) => {
    setTeams((t) => [t[0], team]);
    setEditingTeam(null);
    if (isSeries && seriesData.matchHistory.length === 0) {
      setPhase(PHASES.SERIES_DASHBOARD);
    } else if (afterEditPhase) {
      setPhase(afterEditPhase);
      setAfterEditPhase(null);
    } else {
      setPhase(PHASES.TOSS);
    }
  };

  // ── Navigation: Toss ─────────────────────────────────────

  const handleToss = async (_winner, battingIdx) => {
    setBattingFirstIdx(battingIdx);
    await dbStartMatch(battingIdx);
    setPhase(PHASES.INNINGS1);
  };

  // ── Navigation: Innings ───────────────────────────────────

  const handleInnings1End = async (snap) => {
    setInnings1Snap(snap);
    await persist.saveMatch({ innings1: snap, phase: PHASES.BETWEEN });
    setPhase(PHASES.BETWEEN);
  };

  const handleInnings2End = async (snap) => {
    setInnings2Snap(snap);

    // Determine result
    const team2 = teams[fieldingFirstIdx];
    const wi = determineWinner(
      innings1Snap?.runs ?? 0, innings1Snap?.wickets ?? 0,
      snap?.runs ?? 0, snap?.wickets ?? 0,
      team2?.players?.length ?? 10
    );
    const winnerTeamIdx = wi.winner === null ? null
      : wi.winner === 0 ? battingFirstIdx : fieldingFirstIdx;

    const result = {
      winnersTeamIdx: winnerTeamIdx,
      winType:  wi.winType,
      margin:   wi.margin,
      resultText:
        wi.winType === "wickets"
          ? `${teams[winnerTeamIdx]?.name} won by ${wi.margin} wicket${wi.margin !== 1 ? "s" : ""}`
          : wi.winType === "runs"
          ? `${teams[winnerTeamIdx]?.name} won by ${wi.margin} run${wi.margin !== 1 ? "s" : ""}`
          : "Match Tied",
    };

    // Save completed match
    await persist.saveMatch({ innings2: snap, phase: PHASES.RESULT, status: "completed", result });
    await persist.completeMatch(result);

    if (isSeries) appendSeriesResult(innings1Snap, snap, persist.activeMatchId);
    setPhase(PHASES.RESULT);
  };

  // ── End Match (abandoned) ─────────────────────────────────

  const handleEndMatch = async (currentInnings) => {
    // Save whatever innings data we have so far
    const isInnings1 = !innings1Snap;
    const patch = isInnings1
      ? { innings1: currentInnings, status: "abandoned", phase: PHASES.INNINGS1 }
      : { innings1: innings1Snap, innings2: currentInnings, status: "abandoned", phase: PHASES.INNINGS2 };
    await persist.saveMatch(patch);
    await persist.abandonMatch();
    fullReset();
  };


  // ── Live-save: called after every ball ───────────────────
  // Persists the current innings state so resume works from exact delivery.
  const handleLiveSave1 = useCallback(async (snap) => {
    if (!persist.activeMatchId) return;
    await persist.saveMatch({ innings1: snap, phase: PHASES.INNINGS1 });
  }, [persist.activeMatchId, persist.saveMatch]);

  const handleLiveSave2 = useCallback(async (snap) => {
    if (!persist.activeMatchId) return;
    await persist.saveMatch({ innings2: snap, phase: PHASES.INNINGS2 });
  }, [persist.activeMatchId, persist.saveMatch]);

  // ── Navigation: Result ────────────────────────────────────

  const handleResultContinue = () => {
    if (isSeries && seriesConfig?.format?.key !== "single") {
      resetMatch();
      // Update series persistence if decided
      if (seriesDecided) persist.completeSeries();
      setPhase(PHASES.SERIES_DASHBOARD);
    } else {
      fullReset();
    }
  };

  // ── Series Dashboard actions ──────────────────────────────

  const handlePlayNextMatch = () => { resetMatch(); setPhase(PHASES.TOSS); };

  const handleEditTeams = () => {
    setEditingTeam(1);
    setAfterEditPhase(PHASES.SERIES_DASHBOARD);
    setPhase(PHASES.TEAM1);
  };

  // ── Back handlers ─────────────────────────────────────────

  const backFromLimitedSetup = () =>
    isSeries ? setPhase(PHASES.SERIES_SETUP) : setPhase(PHASES.HOME);

  const backFromTeam1 = () => {
    if (editingTeam) { setEditingTeam(null); setPhase(afterEditPhase ?? PHASES.SERIES_DASHBOARD); return; }
    setPhase(matchType === "limited" ? PHASES.LIMITED_SETUP : PHASES.HOME);
  };

  const backFromTeam2 = () => {
    if (editingTeam) { setEditingTeam(null); setPhase(PHASES.SERIES_DASHBOARD); return; }
    setPhase(PHASES.TEAM1);
  };

  // ── History: Resume match ─────────────────────────────────

  const handleResumeMatch = (matchRecord) => {
    const savedTeams = matchRecord.teams ?? [null, null];
    const bfi        = matchRecord.battingFirstIdx ?? 0;
    const ffi        = bfi === 0 ? 1 : 0;

    setMatchType(matchRecord.matchType ?? "limited");
    setLimitedConfig(matchRecord.limitedConfig ?? { overs:10, wickets:10 });
    setTeams(savedTeams);
    setBattingFirstIdx(bfi);
    setInnings1Snap(matchRecord.innings1 ?? null);
    setInnings2Snap(matchRecord.innings2 ?? null);
    persist.setActiveMatchId(matchRecord.id);
    setIsSeries(false);

    const savedPhase = matchRecord.phase ?? PHASES.INNINGS1;
    const isInnings2 = savedPhase === PHASES.INNINGS2 || savedPhase === "innings2";
    const isBetween  = savedPhase === PHASES.BETWEEN  || savedPhase === "between";

    if (isBetween) {
      setResumeInnings1(null);
      setResumeInnings2(null);
      setResumeTeams(null);
      setPhase(PHASES.BETWEEN);
    } else if (isInnings2 && matchRecord.innings2 && savedTeams[ffi] && savedTeams[bfi]) {
      // Resuming innings 2 — batting team is fieldingFirst, bowling is battingFirst
      const { battingPlayers, bowlingPlayers } = replayInningsStats(
        savedTeams[ffi], savedTeams[bfi], matchRecord.innings2
      );
      setResumeTeams([
        { ...savedTeams[ffi], players: battingPlayers },
        { ...savedTeams[bfi], players: bowlingPlayers },
      ]);
      setResumeInnings1(null);
      setResumeInnings2(matchRecord.innings2);
      setPhase(PHASES.INNINGS2);
    } else if (!isBetween && matchRecord.innings1 && savedTeams[bfi] && savedTeams[ffi]) {
      // Resuming innings 1 — batting team is battingFirst
      const { battingPlayers, bowlingPlayers } = replayInningsStats(
        savedTeams[bfi], savedTeams[ffi], matchRecord.innings1
      );
      setResumeTeams([
        { ...savedTeams[bfi], players: battingPlayers },
        { ...savedTeams[ffi], players: bowlingPlayers },
      ]);
      setResumeInnings1(matchRecord.innings1);
      setResumeInnings2(null);
      setPhase(PHASES.INNINGS1);
    } else {
      // No innings data yet — just go to innings1 fresh
      setResumeTeams(null);
      setResumeInnings1(null);
      setResumeInnings2(null);
      setPhase(PHASES.INNINGS1);
    }
  };

  const handleViewMatch = (matchRecord) => {
    setViewingMatch(matchRecord);
    setPhase(PHASES.MATCH_VIEW);
  };

  const handleResumeSeries = async (seriesRecord) => {
    // Restore series context
    setSeriesConfig({ seriesName: seriesRecord.seriesName, format: seriesRecord.format });
    setTeams(seriesRecord.teams ?? [null, null]);
    setMatchType(seriesRecord.matchType ?? "limited");
    setLimitedConfig(seriesRecord.limitedConfig ?? { overs:10, wickets:10 });
    setIsSeries(true);
    persist.setActiveSeriesId(seriesRecord.id);

    // Rebuild seriesData wins/ties from stored values + reconstruct matchHistory from matchIds
    // We just restore wins/ties; matchHistory is only for display — simplified restore
    setSeriesData({
      matchHistory: [], // rebuilt on next DB operations
      wins: seriesRecord.wins ?? [0,0],
      ties: seriesRecord.ties ?? 0,
    });
    resetMatch();
    setPhase(PHASES.SERIES_DASHBOARD);
  };

  const handleViewSeries = (seriesRecord) => {
    // For now, resume = view for series
    handleResumeSeries(seriesRecord);
  };

  // ── Header subtitle ───────────────────────────────────────

  const subtitle = isSeries && seriesConfig
    ? `${seriesConfig.format.icon} ${seriesConfig.seriesName}`
    : "Street Cricket Scorer";

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="app-bg">
        <div className="app-header">
          <div className="app-title">🏏 Gully Cricket</div>
          <div className="app-sub">{subtitle}</div>
          {persist.saving && (
            <div style={{ position:"absolute", top:6, right:10, fontSize:"0.55rem", color:"rgba(245,200,66,0.6)", fontFamily:"Orbitron,monospace", letterSpacing:1 }}>
              SAVING…
            </div>
          )}
        </div>

        {phase === PHASES.HOME && (
          <HomeScreen
            onSingleMatch={handleSingleMatch}
            onSeries={handleGoSeries}
            onHistory={handleGoHistory}
          />
        )}

        {phase === PHASES.HISTORY && (
          <MatchHistory
            listMatches={persist.listMatches}
            listSeries={persist.listSeries}
            onResumeMatch={handleResumeMatch}
            onViewMatch={handleViewMatch}
            onResumeSeries={handleResumeSeries}
            onViewSeries={handleViewSeries}
            onDeleteMatch={persist.removeMatch}
            onDeleteSeries={persist.removeSeries}
            onBack={() => setPhase(PHASES.HOME)}
          />
        )}

        {phase === PHASES.MATCH_VIEW && viewingMatch && (
          <MatchViewer
            match={viewingMatch}
            onResume={viewingMatch.status === "in-progress" ? handleResumeMatch : null}
            onBack={() => setPhase(PHASES.HISTORY)}
          />
        )}

        {phase === PHASES.SERIES_SETUP && (
          <SeriesSetup onBack={() => setPhase(PHASES.HOME)} onNext={handleSeriesSetupNext} />
        )}

        {phase === PHASES.LIMITED_SETUP && (
          <LimitedSetup onBack={backFromLimitedSetup} onNext={handleLimitedNext} />
        )}

        {phase === PHASES.TEAM1 && (
          <TeamSetup
            teamNum={1} totalTeams={2} existing={teams[0]}
            editOnly={!!editingTeam}
            onBack={backFromTeam1} onNext={handleTeam1Next}
          />
        )}

        {phase === PHASES.TEAM2 && (
          <TeamSetup
            teamNum={2} totalTeams={2} existing={teams[1]}
            editOnly={!!editingTeam}
            onBack={backFromTeam2} onNext={handleTeam2Next}
          />
        )}

        {phase === PHASES.SERIES_DASHBOARD && seriesConfig && (
          <SeriesDashboard
            seriesName={seriesConfig.seriesName}
            format={seriesConfig.format}
            teams={teams}
            wins={seriesData.wins}
            ties={seriesData.ties}
            matchesPlayed={seriesMatchesPlayed}
            matchesLeft={seriesMatchesLeft}
            winsNeeded={winsNeeded}
            isBestOf={isBestOf}
            matchHistory={seriesData.matchHistory}
            seriesDecided={seriesDecided}
            getSeriesWinner={getSeriesWinner}
            onPlayNextMatch={handlePlayNextMatch}
            onEditTeams={handleEditTeams}
            onNewSeries={fullReset}
          />
        )}

        {phase === PHASES.TOSS && (
          <TossScreen
            teams={teams}
            matchNum={isSeries ? seriesMatchesPlayed + 1 : null}
            onDecide={handleToss}
          />
        )}

        {phase === PHASES.INNINGS1 && teams[battingFirstIdx] && teams[fieldingFirstIdx] && (() => {
          const bat  = resumeTeams ? resumeTeams[0] : cloneTeamForInnings(teams[battingFirstIdx]);
          const bowl = resumeTeams ? resumeTeams[1] : cloneTeamForInnings(teams[fieldingFirstIdx]);
          return (
            <ScoringScreen
              key={`i1-${persist.activeMatchId}`}
              battingTeam={bat}
              bowlingTeam={bowl}
              maxWickets={maxWickets}
              maxBalls={maxBalls}
              matchType={matchType}
              inningsNum={1}
              target={null}
              resumeInnings={resumeInnings1}
              onLiveSave={handleLiveSave1}
              onInningsEnd={handleInnings1End}
              onEndMatch={handleEndMatch}
            />
          );
        })()}

        {phase === PHASES.BETWEEN && innings1Snap && (
          <InningsBetween
            teams={teams}
            battingFirstIdx={battingFirstIdx}
            innings1={innings1Snap}
            maxBalls={maxBalls}
            onStartSecond={async () => {
              await persist.saveMatch({ phase: PHASES.INNINGS2 });
              setPhase(PHASES.INNINGS2);
            }}
          />
        )}

        {phase === PHASES.INNINGS2 && teams[fieldingFirstIdx] && innings1Snap && (() => {
          const bat  = resumeTeams ? resumeTeams[0] : cloneTeamForInnings(teams[fieldingFirstIdx]);
          const bowl = resumeTeams ? resumeTeams[1] : cloneTeamForInnings(teams[battingFirstIdx]);
          return (
            <ScoringScreen
              key={`i2-${persist.activeMatchId}`}
              battingTeam={bat}
              bowlingTeam={bowl}
              maxWickets={maxWickets}
              maxBalls={maxBalls}
              matchType={matchType}
              inningsNum={2}
              target={innings1Snap.runs + 1}
              resumeInnings={resumeInnings2}
              onLiveSave={handleLiveSave2}
              onInningsEnd={handleInnings2End}
              onEndMatch={handleEndMatch}
            />
          );
        })()}

        {phase === PHASES.RESULT && (
          <MatchResult
            teams={teams}
            battingFirstIdx={battingFirstIdx}
            innings1={innings1Snap}
            innings2={innings2Snap}
            isSeries={isSeries && seriesConfig?.format?.key !== "single"}
            seriesName={seriesConfig?.seriesName}
            matchNum={seriesMatchesPlayed}
            totalMatches={totalMatches}
            seriesWins={seriesData.wins}
            onContinue={handleResultContinue}
          />
        )}
      </div>
    </>
  );
}
