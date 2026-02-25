/**
 * db.js — IndexedDB persistence layer for Gully Cricket
 *
 * Schema:
 *   DB name: gully-cricket-db   version: 1
 *
 *   Object store: "matches"
 *     keyPath: id (uuid string)
 *     Fields:
 *       id          string    uuid
 *       createdAt   number    Date.now()
 *       updatedAt   number    Date.now()
 *       status      string    "in-progress" | "completed" | "abandoned"
 *       seriesId    string?   uuid of parent series (null for standalone)
 *       matchNum    number?   1-based position within a series
 *       matchType   string    "test" | "limited"
 *       limitedConfig { overs, wickets }?
 *       teams       [team0, team1]   (original setup teams)
 *       battingFirstIdx  number  0|1
 *       phase       string    last active PHASE key (so we know where to resume)
 *       innings1    object?   innings snapshot
 *       innings2    object?   innings snapshot
 *       result      object?   { winnersTeamIdx, winType, margin, resultText }
 *
 *   Object store: "series"
 *     keyPath: id (uuid string)
 *     Fields:
 *       id          string
 *       createdAt   number
 *       updatedAt   number
 *       status      string    "in-progress" | "completed"
 *       seriesName  string
 *       format      object    { key, label, totalMatches, icon, description }
 *       teams       [team0, team1]
 *       matchType   string
 *       limitedConfig object?
 *       wins        [n0, n1]
 *       ties        number
 *       matchIds    string[]  ordered list of match ids
 */

const DB_NAME    = "gully-cricket-db";
const DB_VERSION = 1;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains("matches")) {
        const ms = db.createObjectStore("matches", { keyPath: "id" });
        ms.createIndex("by_status",    "status",    { unique: false });
        ms.createIndex("by_seriesId",  "seriesId",  { unique: false });
        ms.createIndex("by_createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains("series")) {
        const ss = db.createObjectStore("series", { keyPath: "id" });
        ss.createIndex("by_status",    "status",    { unique: false });
        ss.createIndex("by_createdAt", "createdAt", { unique: false });
      }
    };

    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror   = (e) => reject(e.target.error);
  });
}

function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
}

// ── Generic helpers ───────────────────────────────────────────

function tx(storeName, mode = "readonly") {
  return openDB().then((db) => {
    const t = db.transaction(storeName, mode);
    return t.objectStore(storeName);
  });
}

function wrap(req) {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

function getAll(store) {
  return new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

// ── MATCHES ───────────────────────────────────────────────────

export async function createMatch(data) {
  const store = await tx("matches", "readwrite");
  const record = {
    id:          uuid(),
    createdAt:   Date.now(),
    updatedAt:   Date.now(),
    status:      "in-progress",
    seriesId:    null,
    matchNum:    null,
    ...data,
  };
  await wrap(store.add(record));
  return record;
}

export async function updateMatch(id, patch) {
  const store = await tx("matches", "readwrite");
  const existing = await wrap(store.get(id));
  if (!existing) throw new Error(`Match ${id} not found`);
  const updated = { ...existing, ...patch, updatedAt: Date.now() };
  await wrap(store.put(updated));
  return updated;
}

export async function getMatch(id) {
  const store = await tx("matches", "readonly");
  return wrap(store.get(id));
}

export async function getAllMatches() {
  const store = await tx("matches", "readonly");
  const all   = await getAll(store);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteMatch(id) {
  const store = await tx("matches", "readwrite");
  return wrap(store.delete(id));
}

// ── SERIES ────────────────────────────────────────────────────

export async function createSeries(data) {
  const store = await tx("series", "readwrite");
  const record = {
    id:        uuid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status:    "in-progress",
    matchIds:  [],
    wins:      [0, 0],
    ties:      0,
    ...data,
  };
  await wrap(store.add(record));
  return record;
}

export async function updateSeries(id, patch) {
  const store = await tx("series", "readwrite");
  const existing = await wrap(store.get(id));
  if (!existing) throw new Error(`Series ${id} not found`);
  const updated = { ...existing, ...patch, updatedAt: Date.now() };
  await wrap(store.put(updated));
  return updated;
}

export async function getSeries(id) {
  const store = await tx("series", "readonly");
  return wrap(store.get(id));
}

export async function getAllSeries() {
  const store = await tx("series", "readonly");
  const all   = await getAll(store);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteSeries(id) {
  // Delete series + all its matches
  const seriesStore = await tx("series", "readwrite");
  const s = await wrap(seriesStore.get(id));
  if (s?.matchIds?.length) {
    const matchStore = await tx("matches", "readwrite");
    for (const mid of s.matchIds) await wrap(matchStore.delete(mid));
  }
  return wrap(seriesStore.delete(id));
}
