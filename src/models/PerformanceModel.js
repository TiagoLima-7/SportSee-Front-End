/**
 * PerformanceModel - couche d'adaptation pour le Radarchart "Perfomance"
 *
 * Donnée brute attendue (réponse de user/:id/performance) :
 *  {
 *      userId,
 *      Kind: { 1: 'cardio', 2: 'energy', 3: 'endurance', 4: 'strength', 5: 'speed', 6: 'intensity'},
 *      data: [{ value, kind }]
 *  }
 *
 * Deux problèmes à resoudre :
 *
 *  1. Ordre d'affichage. L'API renvoi kind=1 (cardio) en premier mais la maquette
 *  SportSee veut "Intensité" en haut, puis, en parcourant le radar dans le sens
 *  horaires inverse : Vitesse, Force, Endurance, Énergie, Cardio. Donc on lit
 *  les kinds dans l'ordre [6, 5, 4, 3, 2, 1].
 *
 *  2.Libellés. L'API utilise des termes anglais ('cardio', 'energy', etc) mais
 *  l'app est en françai. on traduit ici, dans le modèle, pour que le composant
 *  n'ait pas à le faire
 */

const KIND_LABELS_FR = {
  cardio: "Cardio",
  energy: "Énergie",
  endurance: "Endurance",
  strength: "Force",
  speed: "Vitesse",
  intensity: "Intensité",
};

//Ordre d'affichage: haut -> haut-gauche -> bas-gauche -> bas -> bas-droite -> haut-droite
const DISPLAY_ORDER = [6, 5, 4, 3, 2, 1];

export default class PerformanceModel {
  /**
   * @param {object} raw - {userId, kind: {...}, data: [...]}
   */
  constructor(raw) {
    this.userId = raw.userId;
    this.data = this._formatedData(raw);
  }

  _formatedData(raw) {
    return DISPLAY_ORDER.map((kindNumber) => {
      const item = raw.data.find((d) => d.kind === kindNumber);
      const englishLabel = raw.kind[kindNumber];
      return {
        label: KIND_LABELS_FR[englishLabel] ?? englishLabel,
        value: item ? item.value : 0,
      };
    });
  }

  /**
   * Valeur la plus haute parmi les 6 axes servira de référence
   * pour le cercle extérieur du radar (le polygone touchera ce cercle au max)
   */
  get maxValue() {
    return Math.max(...this.data.map((d) => d.value));
  }
}
