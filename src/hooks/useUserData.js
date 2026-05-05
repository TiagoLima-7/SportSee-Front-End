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
 * - On normalise ici la quirk `todayScore` / `score` du back-end pour que
 *   les composants n'aient plus à se poser la question.
 */

import { useEffect, useState } from "react";
import {
  getUserMainData,
  getUserActivity,
  getUserAverageSessions,
  getUserPerformance,
} from "../services/mockApi";

const initialState = {
  fetchedFor: null,
  data: {
    user: null,
    activity: null,
    sessions: null,
    performance: null,
  },
  error: null,
};

const useUserData = (userId) => {
  const [state, setState] = useState(initialState);

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
        const main = mainRes.data;
        setState({
          fetchedFor: userId,
          data: {
            // Normalisation de la quirk back : user 12 → todayScore, user 18 → score
            user: { ...main, score: main.todayScore ?? main.score ?? 0 },
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
          fetchedFor: userId,
          data: initialState.data,
          error: err,
        });
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  // États dérivés - pas de useState, pas d'effet, juste du calcul à chaque render.
  const loading = userId != null && state.fetchedFor !== userId;
  const error = state.fetchedFor === userId ? state.error : null;

  return {
    ...state.data,
    loading,
    error,
  };
};

export default useUserData;
