import { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * ActivityChart - Bar chart "Activité quotidienne".
 *
 * Pattern hybride React + D3 :
 *  - React possède le DOM (rend les <rect>, <text>, <g> en JSX)
 *  - D3 fournit les outils mathématiques (scales, axis generators)
 *  - useEffect + useRef uniquement là où D3 doit générer du DOM complexe
 *    (axes), parce que ré-écrire un d3.axis à la main en JSX serait
 *    inutilement verbeux.
 *
 * Le SVG utilise viewBox + preserveAspectRatio : il est donc 100% responsive,
 * c'est le conteneur parent qui décide de la taille finale via CSS.
 */
const ActivityChart = ({ model }) => {
  // ─── Dimensions internes du SVG (en unités viewBox, pas en pixels) ───
  const width = 835;
  const height = 320;
  const margin = { top: 80, right: 90, bottom: 60, left: 45 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const sessions = model.sessions;

  // ─── Scales D3 ───
  // useMemo évite de recréer les scales à chaque render.
  const xScale = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(sessions.map((s) => s.day))
        .range([0, innerW])
        .padding(0.7),
    [sessions, innerW],
  );

  const yKgScale = useMemo(
    () => d3.scaleLinear().domain(model.kilogramRange).range([innerH, 0]),
    [model, innerH],
  );

  const yCalScale = useMemo(
    () => d3.scaleLinear().domain(model.caloriesRange).range([innerH, 0]),
    [model, innerH],
  );

  // ─── Axes (générés par D3 dans useEffect) ───
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  useEffect(() => {
    if (!xAxisRef.current) return;
    const axis = d3.axisBottom(xScale).tickSize(0).tickPadding(16);
    const g = d3.select(xAxisRef.current).call(axis);
    // On retire la ligne horizontale par défaut (`domain`), on garde
    // seulement les labels - la grille est dessinée à la main plus bas.
    g.select(".domain").remove();
    g.selectAll("text").attr("fill", "#9B9EAC").style("font-size", "14px");
  }, [xScale]);

  useEffect(() => {
    if (!yAxisRef.current) return;
    const axis = d3.axisRight(yKgScale).ticks(3).tickSize(0).tickPadding(40);
    const g = d3.select(yAxisRef.current).call(axis);
    g.select(".domain").remove();
    g.selectAll("text").attr("fill", "#9B9EAC").style("font-size", "14px");
  }, [yKgScale]);

  // ─── Layout des barres ───
  const barWidth = 7;
  const barGap = 8;

  return (
    <figure className="activity-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Titre */}
        <text x={margin.left} y={30} className="activity-chart-title">
          Activité quotidienne
        </text>

        {/* Légende (en haut à droite) */}
        <g transform={`translate(${width - margin.right - 280}, 25)`}>
          <circle cx={0} cy={0} r={4} fill="#282D30" />
          <text x={10} y={5} className="activity-chart-legend">
            Poids (kg)
          </text>
          <circle cx={110} cy={0} r={4} fill="#E60000" />
          <text x={120} y={5} className="activity-chart-legend">
            Calories brûlées (kCal)
          </text>
        </g>

        {/* Zone de dessin */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Lignes de grille horizontales (3 ticks correspondant à yKg) */}
          {yKgScale.ticks(3).map((tick, i) => (
            <line
              key={tick}
              x1={0}
              x2={innerW}
              y1={yKgScale(tick)}
              y2={yKgScale(tick)}
              stroke="#DEDEDE"
              strokeDasharray={i === 0 ? "0" : "2,2"}
            />
          ))}

          {/* Barres : une paire (poids + calories) par jour */}
          {sessions.map((s) => {
            const center = xScale(s.day) + xScale.bandwidth() / 2;
            return (
              <g key={s.day}>
                <rect
                  x={center - barWidth - barGap / 2}
                  y={yKgScale(s.kilogram)}
                  width={barWidth}
                  height={innerH - yKgScale(s.kilogram)}
                  fill="#282D30"
                  rx={3}
                />
                <rect
                  x={center + barGap / 2}
                  y={yCalScale(s.calories)}
                  width={barWidth}
                  height={innerH - yCalScale(s.calories)}
                  fill="#E60000"
                  rx={3}
                />
              </g>
            );
          })}

          {/* Axe X (jours 1-7), placé en bas */}
          <g ref={xAxisRef} transform={`translate(0, ${innerH})`} />
          {/* Axe Y poids, placé à droite */}
          <g ref={yAxisRef} transform={`translate(${innerW}, 0)`} />
        </g>
      </svg>
    </figure>
  );
};

export default ActivityChart;
