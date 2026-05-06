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
 * Le formatage du nombre (séparateur de milliers) se fait via
 * Intl.toLocaleString('en-US') : 1930 → "1,930". On garde la locale 'en-US'
 * parce que la maquette SportSee utilise la virgule, pas l'espace de la
 * locale française.
 */

const KeyDataCard = ({ icon, iconColor, value, unit, label }) => {
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
          {value.toLocaleString("en-US")}
          {unit}
        </p>
        <p className="key-data-card-label">{label}</p>
      </div>
    </article>
  );
};

export default KeyDataCard;
