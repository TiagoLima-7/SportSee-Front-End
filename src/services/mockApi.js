/**
 * mockApi.js - point d'entrée unique pour les 4 endpoints SportSee.
 *
 * Ce fichier regroupe :
 *   - les deux implémentations (mock + réelle) côte à côte
 *   - un store réactif module-level (useSyncExternalStore) qui mémorise
 *     la source courante, sans Context ni Provider
 *   - les 4 fonctions publiques (getUserMainData, …) qui dispatchent vers
 *     la bonne implémentation en fonction de la source active
 *   - les helpers React : useApiSource() pour s'abonner depuis un composant,
 *     toggleApiSource() / setApiSource() pour basculer
 *
 * ============================================================
 *  POUR CHANGER L'API PAR DÉFAUT AU DÉMARRAGE :
 *  commente une ligne, décommente l'autre (juste en dessous).
 * ============================================================
 *
 * Note : la source courante est aussi persistée en localStorage. Si tu
 * changes la constante mais que tu vois encore l'ancienne source, c'est
 * que la valeur stockée prend le dessus → vide localStorage (ou clique
 * une fois sur le toggle dans le Header).
 */

import { useSyncExternalStore } from "react";

import {
  USER_MAIN_DATA,
  USER_ACTIVITY,
  USER_AVERAGE_SESSIONS,
  USER_PERFORMANCE,
} from "../data/mockData";

// =============================================================================
//   ↓↓↓ CHANGE LE DÉFAUT ICI : commente / décommente l'une des deux lignes ↓↓↓
// =============================================================================
//const DEFAULT_API_SOURCE = "real"; // vrai back-end Node sur http://localhost:3000
const DEFAULT_API_SOURCE = "mock"; // données mockées de src/data/mockData
// =============================================================================

const REAL_API_URL = "http://localhost:3000";
const MOCK_LATENCY_MS = 200;
const STORAGE_KEY = "sportSee:apiSource";

// -----------------------------------------------------------------------------
// Mock implementation - utilise src/data/mockData
// -----------------------------------------------------------------------------
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findOrThrow = (collection, predicate, label, userId) => {
  const item = collection.find(predicate);
  if (!item) {
    throw new Error(
      `[mockApi] ${label} introuvable pour l'utilisateur ${userId}`,
    );
  }
  return item;
};

const mockApi = {
  getUserMainData: async (userId) => {
    await wait(MOCK_LATENCY_MS);
    const data = findOrThrow(
      USER_MAIN_DATA,
      (u) => u.id === Number(userId),
      "USER_MAIN_DATA",
      userId,
    );
    return { data };
  },
  getUserActivity: async (userId) => {
    await wait(MOCK_LATENCY_MS);
    const data = findOrThrow(
      USER_ACTIVITY,
      (u) => u.userId === Number(userId),
      "USER_ACTIVITY",
      userId,
    );
    return { data };
  },
  getUserAverageSessions: async (userId) => {
    await wait(MOCK_LATENCY_MS);
    const data = findOrThrow(
      USER_AVERAGE_SESSIONS,
      (u) => u.userId === Number(userId),
      "USER_AVERAGE_SESSIONS",
      userId,
    );
    return { data };
  },
  getUserPerformance: async (userId) => {
    await wait(MOCK_LATENCY_MS);
    const data = findOrThrow(
      USER_PERFORMANCE,
      (u) => u.userId === Number(userId),
      "USER_PERFORMANCE",
      userId,
    );
    return { data };
  },
};

// -----------------------------------------------------------------------------
// Real implementation - frappe le micro back-end Node (localhost:3000)
// -----------------------------------------------------------------------------
const fetchOrThrow = async (path) => {
  let res;
  try {
    res = await fetch(`${REAL_API_URL}${path}`);
  } catch {
    throw new Error(
      `[realApi] Impossible de joindre ${REAL_API_URL}${path} - le back-end est-il démarré ?`,
    );
  }
  if (!res.ok) {
    throw new Error(`[realApi] ${res.status} ${res.statusText} sur ${path}`);
  }
  return res.json();
};

const realApi = {
  getUserMainData: (id) => fetchOrThrow(`/user/${id}`),
  getUserActivity: (id) => fetchOrThrow(`/user/${id}/activity`),
  getUserAverageSessions: (id) => fetchOrThrow(`/user/${id}/average-sessions`),
  getUserPerformance: (id) => fetchOrThrow(`/user/${id}/performance`),
};

// -----------------------------------------------------------------------------
// Store réactif module-level : la source courante + les abonnés React.
// Pas de Context, pas de Provider. useSyncExternalStore connecte n'importe
// quel composant à ce store et le re-render quand la valeur change.
// -----------------------------------------------------------------------------
const readStored = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "real" || v === "mock" ? v : DEFAULT_API_SOURCE;
  } catch {
    return DEFAULT_API_SOURCE;
  }
};

let currentSource = readStored();
const listeners = new Set();

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const getSnapshot = () => currentSource;

export const setApiSource = (next) => {
  if (next !== "mock" && next !== "real") return;
  if (next === currentSource) return;
  currentSource = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* mode privé / quota dépassé : on ignore */
  }
  listeners.forEach((l) => l());
};

export const toggleApiSource = () => {
  setApiSource(currentSource === "mock" ? "real" : "mock");
};

export const getApiSource = () => currentSource;

/**
 * Hook React : retourne { source, toggle } et re-render le composant
 * quand la source change. Aucune configuration globale à faire.
 */
export const useApiSource = () => {
  const source = useSyncExternalStore(subscribe, getSnapshot);
  return { source, toggle: toggleApiSource };
};

// -----------------------------------------------------------------------------
// API publique : ces 4 fonctions dispatchent vers l'implémentation active.
// useUserData (ou n'importe quel autre consommateur) les importe directement.
// -----------------------------------------------------------------------------
const impl = () => (currentSource === "real" ? realApi : mockApi);

export const getUserMainData = (id) => impl().getUserMainData(id);
export const getUserActivity = (id) => impl().getUserActivity(id);
export const getUserAverageSessions = (id) => impl().getUserAverageSessions(id);
export const getUserPerformance = (id) => impl().getUserPerformance(id);
