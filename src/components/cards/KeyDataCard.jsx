import useElapsedTime from "../../hooks/useElapsedTime.js";

/**
 * KeyDataCard - carte d'affichage d'une métrique nutrition.
 *
 * Composant 100% présentationnel (pas de logique métier, pas de modèle).
 * On l'instancie 4 fois dans Home pour afficher Calories, Protéines,
 * Glucides et Lipides.
 *
 * Props :
 *   - icon       : source de l'icône (chemin import depuis src/assets)
 *   - iconColor  : couleur de fond du conteneur de l'icône (avec alpha,
 *                  pour le rendu "light tint" de la maquette SportSee)
 *   - value      : nombre brut (ex. 1930)
 *   - unit       : suffixe à coller au nombre ('kCal', 'g'...)
 *   - label      : libellé sous la valeur ('Calories', 'Protéines'...)
 *
 * Animation d'entrée :
 *   - Le compteur monte de 0 jusqu'à `value` sur 2 secondes, en easeCubicOut
 *     (ralentit en approchant de la valeur cible). L'animation redémarre si
 *     `value` change (ex. quand l'utilisateur change).
 *
 * Le formatage du nombre (séparateur de milliers) se fait via
 * Intl.toLocaleString('en-US') : 1930 → "1,930". On garde la locale 'en-US'
 * parce que la maquette SportSee utilise la virgule, pas l'espace de la
 * locale française.
 */

const NUMBER_ANIM_DURATION = 2000;
const easeCubicOut = (t) => 1 - Math.pow(1 - t, 3);

const KeyDataCard = ({ icon, iconColor, value, unit, label }) => {
  const elapsed = useElapsedTime(NUMBER_ANIM_DURATION, value);
  const p = Math.min(elapsed / NUMBER_ANIM_DURATION, 1);
  const displayValue = Math.round(value * easeCubicOut(p));

  return (
    <article className="key-data-card">
      <div
        className="key-data-card-icon-wrapper"
        style={{ backgroundColor: iconColor }}
      >
        <img src={icon} alt="" className="key-data-card-icon" />
      </div>
      <div className="key-data-card-text">
        <p className="key-data-card-value">
          {displayValue.toLocaleString("en-US")}
          {unit}
        </p>
        <p className="key-data-card-label">{label}</p>
      </div>
    </article>
  );
};

export default KeyDataCard;
