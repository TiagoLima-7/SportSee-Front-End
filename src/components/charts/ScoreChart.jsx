import { useMemo } from "react";
import * as d3 from "d3";

import useElapsedTime from "../../hooks/useElapsedTime.js";

/**
 * ScoreChart - Arc radial "Score du jour".
 *
 * Structure visuelle (de l'arrière vers l'avant) :
 *   1. Fond gris clair (la figure)
 *   2. Cercle blanc central → crée l'effet "anneau"
 *   3. Arc rouge → représente le pourcentage
 *   4. Textes au centre (pourcentage + caption "de votre objectif")
 *
 * Géométrie :
 *   - Arc démarre à 12h (startAngle = 0 dans la convention d3.arc)
 *   - Va dans le sens HORAIRE INVERSE (endAngle négatif)
 *   - cornerRadius = épaisseur/2 → extrémités semi-circulaires
 *
 * Animation d'entrée :
 *   - Phase 1 (0 → 1s) : score 0 → 1 (anneau rempli à 100%) en easeCubicOut.
 *   - Phase 2 (1 → 2s) : score 1 → model.score en easeCubicOut.
 *   - Le pourcentage affiché au centre suit la même animation pour rester
 *     cohérent visuellement avec l'arc.
 */
const SCORE_ANIM_DURATION = 2000;

const ScoreChart = ({ model }) => {
  const size = 258;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 80;
  const innerRadius = 70;
  const thickness = outerRadius - innerRadius;

  const elapsed = useElapsedTime(SCORE_ANIM_DURATION, model.score);

  // Score courant : up-down 0 → 1 → model.score, easeCubicOut sur chaque demi-phase.
  const animatedScore = (() => {
    if (elapsed >= SCORE_ANIM_DURATION) return model.score;
    const p = elapsed / SCORE_ANIM_DURATION;
    if (p < 0.5) {
      return d3.easeCubicOut(p / 0.5);
    }
    const p2 = (p - 0.5) / 0.5;
    return 1 + (model.score - 1) * d3.easeCubicOut(p2);
  })();

  const arcPath = useMemo(() => {
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(-2 * Math.PI * animatedScore)
      .cornerRadius(thickness / 2);
    return arc();
  }, [animatedScore, innerRadius, outerRadius, thickness]);

  const displayedPercentage = Math.round(animatedScore * 100);

  return (
    <figure className="score-chart">
      <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet">
        {/* Titre en haut à gauche */}
        <text x={20} y={32} className="score-chart-title">
          Score
        </text>

        {/* Cercle blanc central : crée l'anneau visuel */}
        <circle cx={cx} cy={cy} r={innerRadius} fill="#FFFFFF" />

        {/* L'arc rouge — translaté au centre car d3.arc() génère relatif à (0,0) */}
        <g transform={`translate(${cx}, ${cy})`}>
          <path d={arcPath} fill="#FF0000" />
        </g>

        {/* Textes au centre */}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          className="score-chart-percentage"
        >
          {displayedPercentage}%
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          className="score-chart-caption"
        >
          de votre
        </text>
        <text
          x={cx}
          y={cy + 36}
          textAnchor="middle"
          className="score-chart-caption"
        >
          objectif
        </text>
      </svg>
    </figure>
  );
};

export default ScoreChart;
