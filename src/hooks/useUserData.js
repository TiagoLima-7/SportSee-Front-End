/**
 * useUserData - hook qui charge les 4 datasets d'un utilisateur en parallèle.
 *
 * Usage :
 *   const { user, activity, sessions, performance, loading, error } = useUserData(12);
 *
 * - Les 4 appels partent en parallèle via Promise.all (pas en cascade).
 * - Le hook gère le re-fetch automatique quand `userId` change.
 * - Le flag `ignore` évite les "race conditions" si l'utilisateur change
 *   rapidement d'ID (ou en mode StrictMode où l'effet est exécuté deux fois).
 *
 * Ce hook est un TRANSPORT PUR : il ne fait aucune transformation métier
 * des données reçues. Toutes les normalisations spécifiques (quirks back,
 * propriétés calculées, libellés affichables, ranges Y, etc.) vivent dans
 * les MODELS — cf. ScoreModel pour la normalisation todayScore/score,
 * ActivityModel pour les ranges kilogramme/calories, etc.
 */

import { useEffect, useState } from "react";

import {
  getUserMainData,
  getUserActivity,
  getUserAverageSessions,
  getUserPerformance,
  useApiSource,
} from "../services/mockApi";

const initialState = {
  fetchedKey: null, // `${userId}:${source}`
  data: {
    user: null,
    activity: null,
    sessions: null,
    performance: null,
  },
  error: null,
};

const useUserData = (userId) => {
  const { source } = useApiSource();

  const [state, setState] = useState(initialState);

  // Clé composée : on considère la donnée "fraîche" uniquement si elle a été
  // fetchée pour le bon user ET avec la bonne source.
  const fetchKey = userId != null ? `${userId}:${source}` : null;

  useEffect(() => {
    if (userId == null) return;

    let ignore = false;

    Promise.all([
      getUserMainData(userId),
      getUserActivity(userId),
      getUserAverageSessions(userId),
      getUserPerformance(userId),
    ])
      .then(([mainRes, activityRes, sessionsRes, perfRes]) => {
        if (ignore) return;
        // const main = mainRes.data;
        setState({
          fetchedKey: `${userId}:${source}`,
          data: {
            // Normalisation de la quirk back : user 12 → todayScore, user 18 → score
            // user: { ...main, score: main.todayScore ?? main.score ?? 0 },
            user: mainRes.data,
            activity: activityRes.data,
            sessions: sessionsRes.data,
            performance: perfRes.data,
          },
          error: null,
        });
      })
      .catch((err) => {
        if (ignore) return;
        setState({
          fetchedKey: `${userId}:${source}`,
          data: initialState.data,
          error: err,
        });
      });

    return () => {
      ignore = true;
    };
  }, [userId, source]);

  // États dérivés - pas de useState, pas d'effet, juste du calcul à chaque render.
  const loading = fetchKey != null && state.fetchedKey !== fetchKey;
  const error = state.fetchedKey === fetchKey ? state.error : null;

  return {
    ...state.data,
    loading,
    error,
  };
};

export default useUserData;
