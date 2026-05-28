import { useMemo, useRef, useEffect, useState } from "react";
import * as d3 from "d3";

import useElapsedTime from "../../hooks/useElapsedTime.js";

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
 *
 * Animation d'entrée :
 *   - Chaque barre monte de 0 jusqu'au sommet du chart (innerH), puis
 *     redescend jusqu'à sa valeur cible. Chaque demi-phase dure 1 sec,
 *     soit 2 sec par barre, en easeCubicOut (ease vers la fin de chaque
 *     demi-phase).
 *   - Les barres sont déclenchées en cascade, avec un stagger de
 *     2sec / nombre_de_barres entre chaque. Ordre : jour1-kg, jour1-cal,
 *     jour2-kg, jour2-cal, …
 */
const BAR_ANIM_DURATION = 2000;

const ActivityChart = ({ model }) => {
  // --- Dimensions internes du SVG (en unités viewBox, pas en pixels) ---
  const width = 835;
  const height = 320;
  const margin = { top: 80, right: 90, bottom: 60, left: 45 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const sessions = model.sessions;

  const [hoveredDay, setHoveredDay] = useState(null);

  // --- Scales D3 ---
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

  // --- Animation ---
  const nBars = sessions.length * 2;
  const stagger = BAR_ANIM_DURATION / nBars;
  const totalAnimDuration = (nBars - 1) * stagger + BAR_ANIM_DURATION;
  const elapsed = useElapsedTime(totalAnimDuration, sessions);

  /**
   * Calcule la hauteur courante d'une barre :
   *   - phase 1 (0 → 1s) : 0 → innerH (sommet du chart) en easeCubicOut
   *   - phase 2 (1 → 2s) : innerH → finalHeight en easeCubicOut
   * `barIndex` détermine le délai de départ (stagger).
   */
  const animatedHeight = (barIndex, finalHeight) => {
    const localT = elapsed - barIndex * stagger;
    if (localT <= 0) return 0;
    if (localT >= BAR_ANIM_DURATION) return finalHeight;

    const half = BAR_ANIM_DURATION / 2;
    if (localT < half) {
      const p = localT / half;
      return d3.easeCubicOut(p) * innerH;
    }
    const p = (localT - half) / half;
    return innerH + (finalHeight - innerH) * d3.easeCubicOut(p);
  };

  // --- Axes (générés par D3 dans useEffect) ---
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  useEffect(() => {
    if (!xAxisRef.current) return;
    const axis = d3.axisBottom(xScale).tickSize(0).tickPadding(16);
    const g = d3.select(xAxisRef.current).call(axis);
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

  // --- Layout des barres ---
  const barWidth = 7;
  const barGap = 8;

  // --- Tolltip ---
  const tooltipW = 39;
  const tooltipH = 63;
  const tooltipGap = 5; //distance entre la barre et le tooltip

  const hoveredSession =
    hoveredDay !== null ? sessions.find((s) => s.day === hoveredDay) : null;

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

        {/* Légende */}
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
          {/* Lignes de grille horizontales */}
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

          {/* Une <g> par jour : hit-area + barres */}
          {sessions.map((s, dayIdx) => {
            const bandX = xScale(s.day);
            const center = bandX + xScale.bandwidth() / 2;
            const step = xScale.step();
            const offset = (step - xScale.bandwidth()) / 2;
            const isHovered = hoveredDay === s.day;

            const kgFinalHeight = innerH - yKgScale(s.kilogram);
            const calFinalHeight = innerH - yCalScale(s.calories);
            const kgHeight = animatedHeight(dayIdx * 2, kgFinalHeight);
            const calHeight = animatedHeight(dayIdx * 2 + 1, calFinalHeight);

            return (
              <g
                key={s.day}
                onMouseEnter={() => setHoveredDay(s.day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Hit-area + background gris (rempli si hovered) */}
                <rect
                  x={bandX - offset}
                  y={0}
                  width={step}
                  height={innerH}
                  fill={isHovered ? "rgba(196, 196, 196, 0.5)" : "transparent"}
                />

                {/* Barre poids (kg) — y et height pilotés par l'animation */}
                <rect
                  x={center - barWidth - barGap / 2}
                  y={innerH - kgHeight}
                  width={barWidth}
                  height={kgHeight}
                  fill="#282D30"
                  rx={3}
                />
                {/* Barre calories */}
                <rect
                  x={center + barGap / 2}
                  y={innerH - calHeight}
                  width={barWidth}
                  height={calHeight}
                  fill="#E60000"
                  rx={3}
                />
              </g>
            );
          })}

          {/* Axes */}
          <g ref={xAxisRef} transform={`translate(0, ${innerH})`} />
          <g ref={yAxisRef} transform={`translate(${innerW}, 0)`} />

          {/* Tooltip — rendue en dernier pour être au-dessus du z-order */}
          {hoveredSession &&
            (() => {
              const center =
                xScale(hoveredSession.day) + xScale.bandwidth() / 2;
              const isLastDay =
                hoveredSession.day === sessions[sessions.length - 1].day;

              // À droite des barres pour les 6 premiers jours, à gauche pour le 7e
              const tooltipX = isLastDay
                ? center - barWidth - barGap / 2 - tooltipGap - tooltipW
                : center + barWidth + barGap / 2 + tooltipGap;

              return (
                <g
                  transform={`translate(${tooltipX}, 5)`}
                  style={{ pointerEvents: "none" }}
                >
                  <rect width={tooltipW} height={tooltipH} fill="#e60000" />
                  <text
                    x={tooltipW / 2}
                    y={20}
                    textAnchor="middle"
                    className="activity-chart-tooltip-text"
                  >
                    {hoveredSession.kilogram}kg
                  </text>
                  <text
                    x={tooltipW / 2}
                    y={42}
                    textAnchor="middle"
                    className="activity-chart-tooltip-text"
                  >
                    {hoveredSession.calories}Kcal
                  </text>
                </g>
              );
            })()}
        </g>
      </svg>
    </figure>
  );
};

export default ActivityChart;
