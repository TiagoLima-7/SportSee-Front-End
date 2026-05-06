import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * AverageSessionChart - Line chart "Durée moyenne des sessions"
 *
 * Pattern hybride React + D3:
 * - React rend le SVG (path, text, etc)
 * - D3 fournit les scales et le générateur de courbe
 *
 * La courbe utilise curveCatmullRom (interpolation lisse qui passe par tous
 * les points sans overshoot prononcé) - c'est ce qui correspond le mieux à la maquette SportSee.
 */

const AverageSessionChart = ({ model }) => {
  const width = 258;
  const height = 263;
  const margin = { top: 80, right: 15, bottom: 30, left: 15 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const pathRef = useRef(null);
  const overlayRef = useRef(null);

  const [hovered, setHovered] = useState(null);
  const [animateReady, setAnimateReady] = useState(false);

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

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimateReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!pathRef.current || !animateReady || !linePath) return;

    const path = d3.select(pathRef.current);
    const totalLength = pathRef.current.getTotalLength();

    path
      .interrupt()
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  }, [linePath, animateReady]);

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const getInterpolatedPoint = (mouseX) => {
    const xValue = xScale.invert(mouseX);
    const clampedX = clamp(xValue, 1, 7);

    if (clampedX <= sessions[0].day) {
      return {
        x: xScale(sessions[0].day),
        y: yScale(sessions[0].sessionLength),
        value: sessions[0].sessionLength,
      };
    }

    if (clampedX >= sessions[sessions.length - 1].day) {
      const last = sessions[sessions.length - 1];
      return {
        x: xScale(last.day),
        y: yScale(last.sessionLength),
        value: last.sessionLength,
      };
    }

    let i = 0;
    while (i < sessions.length - 1 && sessions[i + 1].day < clampedX) {
      i += 1;
    }

    const a = sessions[i];
    const b = sessions[i + 1];
    const t = (clampedX - a.day) / (b.day - a.day);

    const interpolatedValue =
      a.sessionLength + (b.sessionLength - a.sessionLength) * t;

    return {
      x: mouseX,
      y: yScale(interpolatedValue),
      value: Math.round(interpolatedValue),
    };
  };

  const handleMove = (event) => {
    if (!overlayRef.current) return;

    const [x] = d3.pointer(event, overlayRef.current);
    const safeX = clamp(x, 0, innerW);

    setHovered(getInterpolatedPoint(safeX));
  };

  const handleLeave = () => setHovered(null);

  return (
    <figure className="average-sessions-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
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

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {hovered && (
            <rect
              x={hovered.x}
              y={0}
              width={innerW - hovered.x}
              height={innerH}
              fill="#000000"
              fillOpacity={0.0975}
              pointerEvents="none"
            />
          )}

          <path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              visibility: animateReady ? "visible" : "hidden",
            }}
          />

          {hovered && (
            <>
              <circle
                cx={hovered.x}
                cy={hovered.y}
                r={4}
                fill="#FFFFFF"
                pointerEvents="none"
              />

              <g
                transform={`translate(${Math.min(
                  Math.max(hovered.x + 12, 10),
                  innerW - 80,
                )}, ${Math.max(hovered.y - 28, 0)})`}
                pointerEvents="none"
              >
                <rect
                  x={0}
                  y={0}
                  width={70}
                  height={24}
                  rx={3}
                  ry={3}
                  fill="#FFFFFF"
                />
                <text
                  x={35}
                  y={16}
                  textAnchor="middle"
                  className="average-sessions-tooltip"
                >
                  {hovered.value} min
                </text>
              </g>
            </>
          )}

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

          <rect
            ref={overlayRef}
            x={0}
            y={0}
            width={innerW}
            height={innerH}
            fill="transparent"
            pointerEvents="all"
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onTouchMove={handleMove}
            onTouchEnd={handleLeave}
            style={{ cursor: "default" }}
          />
        </g>
      </svg>
    </figure>
  );
};

export default AverageSessionChart;
