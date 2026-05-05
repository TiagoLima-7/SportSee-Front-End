/**
 * ScoreMdeol - couche d'adaptation pour le RadialChart "Score"
 *
 * Donnée brute : l'obeject 'user' du hook (déjà normalisé : ona toujours
 * 'score' même quand le Back-end renvoie 'todayScore')
 *
 * Très petit modèle, mais on garde la même structure que les autres pour cohérence:
 * si demain on doit ajouter de la logique ( changer la couleur en function du score,
 * libellé personnalisé selon les paliers, etc), elle vit ici et pas dans le component.
 */

export default class ScoreModel {
  /**
   * @param {object} user - { score: number entre 0 et 1 }
   */

  constructor(user) {
    this.score = Math.max(0, Math.min(1, user.score ?? 0));
  }

  /**
   * Pourcentage entier prêt à être affiché
   */
  get percentage() {
    return Math.round(this.score * 100);
  }
}
