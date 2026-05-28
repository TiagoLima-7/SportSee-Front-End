/**
 * Mock data SportSee - reproduit fidèlement la structure renvoyée par le back-end de référence.
 * 4 datasets, chacun correspondant à un endpoint :
 *   - USER_MAIN_DATA          → GET /user/:id
 *   - USER_ACTIVITY           → GET /user/:id/activity
 *   - USER_AVERAGE_SESSIONS   → GET /user/:id/average-sessions
 *   - USER_PERFORMANCE        → GET /user/:id/performance
 *
 * NOTE : le back-end officiel a une incohérence - l'utilisateur 12 a `todayScore`
 * tandis que l'utilisateur 18 a `score`. On conserve cette quirk ici pour pouvoir
 * la gérer dans la couche d'adaptation (model/service), comme avec le vrai back.
 */

// --- USER_MAIN_DATA ----------------------------------------------
export const USER_MAIN_DATA = [
  {
    id: 12,
    userInfos: {
      firstName: "MockedUser#1",
      lastName: "Dovineau",
      age: 31,
    },
    todayScore: 0.12,
    keyData: {
      calorieCount: 1930,
      proteinCount: 155,
      carbohydrateCount: 290,
      lipidCount: 50,
    },
  },
  {
    id: 18,
    userInfos: {
      firstName: "MockedUser#2",
      lastName: "Ratorez",
      age: 34,
    },
    score: 0.5,
    keyData: {
      calorieCount: 2500,
      proteinCount: 90,
      carbohydrateCount: 150,
      lipidCount: 120,
    },
  },
];

// --- USER_ACTIVITY -----------------------------------------------
export const USER_ACTIVITY = [
  {
    userId: 12,
    sessions: [
      { day: "2020-07-01", kilogram: 80, calories: 240 },
      { day: "2020-07-02", kilogram: 80, calories: 220 },
      { day: "2020-07-03", kilogram: 81, calories: 280 },
      { day: "2020-07-01", kilogram: 80, calories: 240 },
      { day: "2020-07-02", kilogram: 80, calories: 220 },
      { day: "2020-07-03", kilogram: 81, calories: 280 },
      { day: "2020-07-04", kilogram: 81, calories: 290 },
      { day: "2020-07-05", kilogram: 80, calories: 160 },
      { day: "2020-07-06", kilogram: 78, calories: 162 },
      { day: "2020-07-07", kilogram: 76, calories: 390 },
    ],
  },
  {
    userId: 18,
    sessions: [
      { day: "2020-07-01", kilogram: 70, calories: 240 },
      { day: "2020-07-02", kilogram: 69, calories: 220 },
      { day: "2020-07-03", kilogram: 70, calories: 280 },
      { day: "2020-07-04", kilogram: 70, calories: 500 },
      { day: "2020-07-05", kilogram: 69, calories: 160 },
      { day: "2020-07-06", kilogram: 69, calories: 162 },
      { day: "2020-07-07", kilogram: 69, calories: 590 },
    ],
  },
];

// --- USER_AVERAGE_SESSIONS ---------------------------------------
// `day` est codé 1-7 (Lundi → Dimanche) côté back.
export const USER_AVERAGE_SESSIONS = [
  {
    userId: 12,
    sessions: [
      { day: 1, sessionLength: 30 },
      { day: 2, sessionLength: 23 },
      { day: 3, sessionLength: 45 },
      { day: 4, sessionLength: 50 },
      { day: 5, sessionLength: 0 },
      { day: 6, sessionLength: 0 },
      { day: 7, sessionLength: 60 },
    ],
  },
  {
    userId: 18,
    sessions: [
      { day: 1, sessionLength: 30 },
      { day: 2, sessionLength: 40 },
      { day: 3, sessionLength: 50 },
      { day: 4, sessionLength: 30 },
      { day: 5, sessionLength: 30 },
      { day: 6, sessionLength: 50 },
      { day: 7, sessionLength: 50 },
    ],
  },
];

// --- USER_PERFORMANCE --------------------------------------------
// `kind` est un mapping numérique → libellé. Attention : les libellés sont en
// anglais et l'ordre des `data` n'est pas l'ordre d'affichage du radar chart.
const PERFORMANCE_KIND = {
  1: "cardio",
  2: "energy",
  3: "endurance",
  4: "strength",
  5: "speed",
  6: "intensity",
};

export const USER_PERFORMANCE = [
  {
    userId: 12,
    kind: PERFORMANCE_KIND,
    data: [
      { value: 80, kind: 1 },
      { value: 120, kind: 2 },
      { value: 140, kind: 3 },
      { value: 50, kind: 4 },
      { value: 200, kind: 5 },
      { value: 90, kind: 6 },
    ],
  },
  {
    userId: 18,
    kind: PERFORMANCE_KIND,
    data: [
      { value: 200, kind: 1 },
      { value: 240, kind: 2 },
      { value: 80, kind: 3 },
      { value: 80, kind: 4 },
      { value: 220, kind: 5 },
      { value: 110, kind: 6 },
    ],
  },
];
