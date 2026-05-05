import { useMemo } from "react";
import * as d3 from "d3";

/**
 * AverageSessionChart - Line chart "Durée moyenne des sessions"
 *
 * Pattern hybride React + D3:
 *
 *  -React rend le SVG (path, text, etc)
 *  -D3 fournit les scales et le générateur de courbe
 *
 * La courbe utilise curveCatmullRom (interpolation lisse qui passe par tous
 * les points sans overshoot prononcé) - c'est ce qui correspond le mieux à la maquette SportSee
 */

const AverageSessionChart = ({ model }) => {
  //Dimensions internes (=viewBox)
  const width = 258;
  const height = 263;
  const margin = { top: 80, right: 15, bottom: 30, left: 15 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const sessions = model.sessions;

  const xScale = useMemo(
    () => d3.scaleLinear().domain([1, 7]).range([0, innerW]),
    [innerW],
  );

  const yScale = useMemo(
    () => d3.scaleLinear().domain(model.sessionLengthRange).range([innerH, 0]),
    [model, innerH],
  );

  const linePath = useMemo(() => {
    const lineGen = d3
      .line()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.sessionLength))
      .curve(d3.curveCatmullRom.alpha(0.5));
    return lineGen(sessions);
  }, [xScale, yScale, sessions]);

  return (
    <figure className="average-sessions-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Titre - manuellement coupé sur 2 lignes (SVG <text> ne wrappe pas) */}
        <text
          x={margin.left + 9}
          y={36}
          className="average-sessions-chart-title"
        >
          Durée moyenne des
        </text>
        <text
          x={margin.left + 9}
          y={56}
          className="average-sessions-chart-title"
        >
          sessions
        </text>

        {/* Zone de dessin */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* La courbe */}
          <path
            d={linePath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Lettres des jours en bas */}
          {sessions.map((s) => (
            <text
              key={s.day}
              x={xScale(s.day)}
              y={innerH + 25}
              textAnchor="middle"
              className="average-sessions-chart-day"
            >
              {s.dayLetter}
            </text>
          ))}
        </g>
      </svg>
    </figure>
  );
};

export default AverageSessionChart;
