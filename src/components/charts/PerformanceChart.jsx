import * as d3 from "d3";

import useElapsedTime from "../../hooks/useElapsedTime.js";

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
 *
 * Animation d'entrée :
 *   - Phase 1 (0 → 1500ms) : chaque sommet du polygone "divague" avec une
 *     valeur calculée par une somme de sinus (pas de bruit purement aléatoire
 *     pour rester fluide). Chaque axe a sa propre fréquence/phase, donc le
 *     polygone se déforme de manière organique, pas synchrone.
 *   - Phase 2 (1500 → 2000ms) : blend en easeCubicOut entre la valeur noise
 *     et la valeur cible (data.value/maxValue), pour atterrir en douceur sur
 *     les vraies coordonnées.
 */
const PERF_ANIM_DURATION = 2000;
const PERF_NOISE_PHASE = 1500;

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

  const elapsed = useElapsedTime(PERF_ANIM_DURATION, data);

  /**
   * Bruit lissé par axe : somme de sinus à fréquences différentes, recadré
   * dans [0, 1]. Volontairement déterministe (fonction de t et i seulement),
   * donc reproductible et continu.
   */
  const noiseRatio = (i, tSec) => {
    const a = Math.sin(tSec * (1.7 + i * 0.5)) * 0.4;
    const b = Math.sin(tSec * (2.9 + i * 0.7) + i) * 0.25;
    return Math.max(0, Math.min(1, 0.5 + a + b));
  };

  /**
   * Ratio courant d'un axe :
   *   - Phase 1 : valeur noise seule.
   *   - Phase 2 : blend easeCubicOut entre noise et finalRatio.
   *   - Après duration : finalRatio.
   */
  const animatedRatio = (i, finalRatio) => {
    if (elapsed >= PERF_ANIM_DURATION) return finalRatio;
    const tSec = elapsed / 1000;
    const noise = noiseRatio(i, tSec);
    if (elapsed < PERF_NOISE_PHASE) return noise;

    const p =
      (elapsed - PERF_NOISE_PHASE) / (PERF_ANIM_DURATION - PERF_NOISE_PHASE);
    const blend = d3.easeCubicOut(p);
    return noise * (1 - blend) + finalRatio * blend;
  };

  // Points du polygone, recalculés à chaque frame (elapsed change).
  const points = data.map((d, i) => {
    const angle = -Math.PI / 2 - i * ((2 * Math.PI) / n);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const finalRatio = d.value / max;
    const ratio = animatedRatio(i, finalRatio);

    return {
      label: d.label,
      // Sommet du polygone "performance" (scaled par la valeur animée)
      px: cx + ratio * maxRadius * cosA,
      py: cy + ratio * maxRadius * sinA,
      // Position du label : statique, indépendante de l'animation
      lx: cx + (maxRadius + labelOffset) * cosA,
      ly: cy + (maxRadius + labelOffset) * sinA,
      cosA,
      sinA,
    };
  });

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
