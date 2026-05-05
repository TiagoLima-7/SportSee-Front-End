export default class ActivityModel {
  constructor(raw) {
    this.userId = raw.userId;
    this.sessions = this._formatedSessions(raw.sessions);
  }

  /**
   * Converts ISO dates (“2020-07-01”) into day numbers (1–7):
   * this is what the SportSee mock-up displays on the X-axis.
   */

  _formatedSessions(sessions) {
    return sessions.map((session, index) => ({
      day: index + 1,
      kilogram: session.kilogram,
      calories: session.calories,
    }));
  }

  get kilogramRange() {
    const values = this.sessions.map((s) => s.kilogram);
    return [Math.min(...values) - 1, Math.max(...values) + 1];
  }

  get caloriesRange() {
    const values = this.sessions.map((s) => s.calories);
    return [0, Math.max(...values) + 50];
  }
}
