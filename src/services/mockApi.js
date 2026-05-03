/**
 * Mock API SportSee — mime l'interface du vrai back-end.
 *
 * Chaque fonction :
 *   - retourne une Promise (comme fetch) → vos composants peuvent utiliser
 *     useEffect + async/await dès maintenant, sans changement quand vous
 *     brancherez la vraie API.
 *   - simule une latence réseau (configurable via FAKE_LATENCY_MS).
 *   - rejette avec une erreur de type "Not Found" si l'utilisateur n'existe pas,
 *     pour que vous puissiez tester vos branches d'erreur.
 *
 * Pour basculer vers le vrai back-end plus tard, il suffira de réécrire ces
 * 4 fonctions avec `fetch('http://localhost:3000/user/...')` — la signature
 * reste identique, donc aucun composant à modifier.
 */

import {
  USER_MAIN_DATA,
  USER_ACTIVITY,
  USER_AVERAGE_SESSIONS,
  USER_PERFORMANCE,
} from '../data/mockData';

const FAKE_LATENCY_MS = 200;

/**
 * Helpers internes
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findOrThrow = (collection, predicate, label, userId) => {
  const item = collection.find(predicate);
  if (!item) {
    throw new Error(`[mockApi] ${label} introuvable pour l'utilisateur ${userId}`);
  }
  return item;
};

/**
 * GET /user/:id
 * @param {number} userId
 * @returns {Promise<{ data: object }>}
 */
export const getUserMainData = async (userId) => {
  await wait(FAKE_LATENCY_MS);
  const data = findOrThrow(
    USER_MAIN_DATA,
    (u) => u.id === Number(userId),
    'USER_MAIN_DATA',
    userId,
  );
  return { data };
};

/**
 * GET /user/:id/activity
 * @param {number} userId
 * @returns {Promise<{ data: object }>}
 */
export const getUserActivity = async (userId) => {
  await wait(FAKE_LATENCY_MS);
  const data = findOrThrow(
    USER_ACTIVITY,
    (u) => u.userId === Number(userId),
    'USER_ACTIVITY',
    userId,
  );
  return { data };
};

/**
 * GET /user/:id/average-sessions
 * @param {number} userId
 * @returns {Promise<{ data: object }>}
 */
export const getUserAverageSessions = async (userId) => {
  await wait(FAKE_LATENCY_MS);
  const data = findOrThrow(
    USER_AVERAGE_SESSIONS,
    (u) => u.userId === Number(userId),
    'USER_AVERAGE_SESSIONS',
    userId,
  );
  return { data };
};

/**
 * GET /user/:id/performance
 * @param {number} userId
 * @returns {Promise<{ data: object }>}
 */
export const getUserPerformance = async (userId) => {
  await wait(FAKE_LATENCY_MS);
  const data = findOrThrow(
    USER_PERFORMANCE,
    (u) => u.userId === Number(userId),
    'USER_PERFORMANCE',
    userId,
  );
  return { data };
};