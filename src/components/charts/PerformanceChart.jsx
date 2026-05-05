import { useMemo } from "react";

/**
 * PerformanceChart - RadarChart hexagonal "Performance".
 *
 * Pour ce chart, D3 n'apporte pas grand-chose : pas de scale band/linear, pas
 * d'axe à générer, juste de la trigonométrie polaire qu'on fait à la main.
 * On reste sur du SVG/JSX pur, ce qui rend le code plus court à lire.
 *
 * Géométrie :
 *   - 6 axes équidistants (60° entre chaque)
 *   - Le sommet 0 est en HAUT du chart (angle = -π/2 en convention SVG, où
 *     y croît vers le bas)
 *   - On parcourt en sens HORAIRE INVERSE → angle décroît à chaque sommet
 *   - Pour chaque sommet, position cartésienne :
 *       x = cx + r·cos(θ)
 *       y = cy + r·sin(θ)
 */
const PerformanceChart = ({ model }) => {
  const size = 258;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 75; // rayon du cercle extérieur (laisse de la place pour les labels)
  const labelOffset = 14; // distance entre l'hexagone extérieur et le texte des labels
  const ringCount = 5; // nombre d'hexagones concentriques (style SportSee)

  const data = model.data;
  const max = model.maxValue;
  const n = data.length;

  // Calcul one-shot de tout ce dont le rendu a besoin pour chaque axe.
  const points = useMemo(
    () =>
      data.map((d, i) => {
        const angle = -Math.PI / 2 - i * ((2 * Math.PI) / n);
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const ratio = d.value / max;

        return {
          label: d.label,
          // Sommet du polygone "performance" (scaled par la valeur)
          px: cx + ratio * maxRadius * cosA,
          py: cy + ratio * maxRadius * sinA,
          // Position du label (un peu à l'extérieur du gros hexagone)
          lx: cx + (maxRadius + labelOffset) * cosA,
          ly: cy + (maxRadius + labelOffset) * sinA,
          // Pour aligner correctement le texte selon sa position angulaire
          cosA,
          sinA,
        };
      }),
    [data, max, n, cx, cy, maxRadius, labelOffset],
  );

  // Helper : génère les sommets d'un hexagone de rayon donné, format "x,y x,y ..."
  const hexagonPoints = (radius) =>
    Array.from({ length: n }, (_, i) => {
      const angle = -Math.PI / 2 - i * ((2 * Math.PI) / n);
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");

  // Les 5 hexagones concentriques : 20%, 40%, 60%, 80%, 100% du rayon max
  const rings = Array.from({ length: ringCount }, (_, i) =>
    hexagonPoints(maxRadius * ((i + 1) / ringCount)),
  );

  // Le polygone de performance (le rouge transparent)
  const polygonPoints = points.map((p) => `${p.px},${p.py}`).join(" ");

  // Aligne le texte du label selon sa position autour du cercle
  const textAnchor = (cosA) => {
    if (cosA > 0.1) return "start";
    if (cosA < -0.1) return "end";
    return "middle";
  };
  const dominantBaseline = (sinA) => {
    if (sinA > 0.1) return "hanging";
    if (sinA < -0.1) return "auto";
    return "middle";
  };

  return (
    <figure className="performance-chart">
      <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet">
        {/* Hexagones concentriques (la grille) */}
        {rings.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1}
          />
        ))}

        {/* Polygone de performance (rouge transparent) */}
        <polygon
          points={polygonPoints}
          fill="rgba(255, 1, 1, 0.7)"
          stroke="none"
        />

        {/* Labels des axes */}
        {points.map((p) => (
          <text
            key={p.label}
            x={p.lx}
            y={p.ly}
            textAnchor={textAnchor(p.cosA)}
            dominantBaseline={dominantBaseline(p.sinA)}
            className="performance-chart-label"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </figure>
  );
};

export default PerformanceChart;
