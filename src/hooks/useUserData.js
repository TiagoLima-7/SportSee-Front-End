/**
 * useUserData — hook qui charge les 4 datasets d'un utilisateur en parallèle.
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

import { useEffect, useState } from 'react';
import {
  getUserMainData,
  getUserActivity,
  getUserAverageSessions,
  getUserPerformance,
} from '../services/mockApi';

const useUserData = (userId) => {
  const [data, setData] = useState({
    user: null,
    activity: null,
    sessions: null,
    performance: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId === undefined || userId === null) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getUserMainData(userId),
      getUserActivity(userId),
      getUserAverageSessions(userId),
      getUserPerformance(userId),
    ])
      .then(([mainRes, activityRes, sessionsRes, perfRes]) => {
        if (ignore) return;

        const main = mainRes.data;
        // Normalisation de la quirk back : user 12 → todayScore, user 18 → score
        const normalizedUser = {
          ...main,
          score: main.todayScore ?? main.score ?? 0,
        };

        setData({
          user: normalizedUser,
          activity: activityRes.data,
          sessions: sessionsRes.data,
          performance: perfRes.data,
        });
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  return { ...data, loading, error };
};

export default useUserData;