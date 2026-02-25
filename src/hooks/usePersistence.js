/**
 * usePersistence.js
 *
 * Thin React wrapper around the db service.
 * Gives App.jsx simple save / load / list functions
 * without exposing IndexedDB internals everywhere.
 */
import { useState, useCallback, useEffect } from "react";
import * as db from "../services/db";

export function usePersistence() {
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Active IDs ─────────────────────────────────────────────
  // These are stored here so App.jsx doesn't need its own state for them
  const [activeMatchId,  setActiveMatchId]  = useState(null);
  const [activeSeriesId, setActiveSeriesId] = useState(null);

  // ── Match ops ──────────────────────────────────────────────

  /**
   * Start a brand-new match record in IndexedDB.
   * Returns the new match id.
   */
  const startMatch = useCallback(async (matchData) => {
    try {
      setSaving(true);
      const record = await db.createMatch(matchData);
      setActiveMatchId(record.id);
      return record.id;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Persist the latest match state (called after every important phase change).
   */
  const saveMatch = useCallback(async (patch) => {
    if (!activeMatchId) return;
    try {
      setSaving(true);
      await db.updateMatch(activeMatchId, patch);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }, [activeMatchId]);

  /**
   * Mark the active match as completed.
   */
  const completeMatch = useCallback(async (result) => {
    if (!activeMatchId) return;
    try {
      await db.updateMatch(activeMatchId, { status: "completed", result });
    } catch (e) {
      setError(e.message);
    }
  }, [activeMatchId]);

  /**
   * Mark the active match as abandoned (user pressed "End Match").
   */
  const abandonMatch = useCallback(async () => {
    if (!activeMatchId) return;
    try {
      await db.updateMatch(activeMatchId, { status: "abandoned" });
    } catch (e) {
      setError(e.message);
    }
  }, [activeMatchId]);

  /**
   * Delete a match permanently.
   */
  const removeMatch = useCallback(async (id) => {
    try {
      await db.deleteMatch(id);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // ── Series ops ─────────────────────────────────────────────

  /**
   * Create a new series record. Returns the series id.
   */
  const startSeries = useCallback(async (seriesData) => {
    try {
      const record = await db.createSeries(seriesData);
      setActiveSeriesId(record.id);
      return record.id;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, []);

  /**
   * Persist latest series state.
   */
  const saveSeries = useCallback(async (patch) => {
    if (!activeSeriesId) return;
    try {
      await db.updateSeries(activeSeriesId, patch);
    } catch (e) {
      setError(e.message);
    }
  }, [activeSeriesId]);

  /**
   * Append a new match id to the series and update wins/ties.
   */
  const recordSeriesMatch = useCallback(async (matchId, wins, ties) => {
    if (!activeSeriesId) return;
    try {
      const series = await db.getSeries(activeSeriesId);
      if (!series) return;
      await db.updateSeries(activeSeriesId, {
        matchIds: [...(series.matchIds ?? []), matchId],
        wins,
        ties,
      });
    } catch (e) {
      setError(e.message);
    }
  }, [activeSeriesId]);

  const completeSeries = useCallback(async () => {
    if (!activeSeriesId) return;
    try {
      await db.updateSeries(activeSeriesId, { status: "completed" });
    } catch (e) {
      setError(e.message);
    }
  }, [activeSeriesId]);

  const removeSeries = useCallback(async (id) => {
    try {
      await db.deleteSeries(id);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // ── Listing ───────────────────────────────────────────────

  const listMatches = useCallback(() => db.getAllMatches(), []);
  const listSeries  = useCallback(() => db.getAllSeries(),  []);
  const loadMatch   = useCallback((id) => db.getMatch(id),  []);
  const loadSeries  = useCallback((id) => db.getSeries(id), []);

  // ── Reset active ids (call on fullReset) ──────────────────
  const clearActive = useCallback(() => {
    setActiveMatchId(null);
    setActiveSeriesId(null);
  }, []);

  return {
    // state
    saving, loading, error,
    activeMatchId, activeSeriesId,
    // match
    startMatch, saveMatch, completeMatch, abandonMatch, removeMatch,
    // series
    startSeries, saveSeries, recordSeriesMatch, completeSeries, removeSeries,
    // listing
    listMatches, listSeries, loadMatch, loadSeries,
    // misc
    clearActive,
    setActiveMatchId, setActiveSeriesId,
  };
}
