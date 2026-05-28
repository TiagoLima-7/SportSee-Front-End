/**
 * AverageSessionModel - couche d'adaptation pour le chart "Durée moyenne des sessions"
 *
 * Donnée brute attendue (réponse de user/:id/average-sessions):
 * { userId, sessions: [{ day:1-7, sessionLength: number }, ...] }
 *
 * Rôle:
 *
 *  -Associer à chaque jour numérique sa lettre d'affichage (L, M, M, J, V, S, D)
 *  -Calculer le domaine Y de la courbe
 *   avec un peu de padding pour que la ligne ne touche ni le haut ni le bas du chart.
 */

export default class AverageSessionModel {
  //Static: Indépendent de l'instance et partagé pour tous les modèles
  static DAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

  /**
   * @param {object} raw = { userId, sessions: [...] }
   */
  constructor(raw) {
    this.userId = raw.userId;
    this.sessions = this._formatedSessions(raw.sessions);
  }

  _formatedSessions(sessions) {
    return sessions.map((session) => ({
      day: session.day,
      dayLetter: AverageSessionModel.DAY_LETTERS[session.day - 1],
      sessionLength: session.sessionLength,
    }));
  }

  get sessionLengthRange() {
    const values = this.sessions.map((s) => s.sessionLength);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.2 || 10;
    return [min - pad, max + pad];
  }
}
