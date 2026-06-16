/**
 * ScoreMdeol - couche d'adaptation pour le RadialChart "Score"
 *
 * Donnée brute : l'object 'user' du hook (déjà normalisé : on a toujours
 * 'score' même quand le Back-end renvoie 'todayScore')
 *
 * Quirk back-end à absorber ici : pour l'utilisateur 12 le score arrive sous la clé 'todayScore',
 * pour l'utilisateur 18 sous la clé 'score'. La normalisation vit dans ce model - l'endroit où la
 * donnée est interpretée - plutôt que dans useUserData, qui doit rester in transport pur.
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
    //Normalisation back entre 'todayScore' et 'score'
    //Fallback sur 0 si aucun des deux champs n'est présent
    const raw = user?.todayScore ?? user?.score ?? 0;

    //Clamp [0, 1] pour se prémunir d'une valeur inattendue (negatif, > 1)
    this.score = Math.max(0, Math.min(1, raw));
  }

  /**
   * Pourcentage entier prêt à être affiché
   */
  get percentage() {
    return Math.round(this.score * 100);
  }
}
