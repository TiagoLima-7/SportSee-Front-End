import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * AverageSessionChart - Line chart "Durée moyenne des sessions"
 *
 * Pattern hybride React + D3, courbe lissée via curveCatmullRom.
 *
 * Layout :
 *   - margin.left = margin.right = 0 → la courbe touche les bords gauche
 *     et droit du SVG (effet edge-to-edge de la maquette).
 *   - margin.bottom = 46 → décale les lettres des jours de 16px vers le haut.
 *   - margin.top = 80 → place pour le titre sur 2 lignes.
 *
 * Deux scales horizontales :
 *   - xScale (range [0, innerW]) → utilisée uniquement par la courbe
 *     pour qu'elle reste bord à bord.
 *   - xLabelScale (range [labelInset, innerW - labelInset]) → utilisée
 *     par les lettres des jours ET la position horizontale du dot.
 *     Le dot s'aligne donc pile au-dessus de la lettre du jour courant,
 *     tout en restant accroché à la courbe (y interpolé sur le path).
 *
 * Hover :
 *   - Le jour courant est déterminé via xLabelScale.invert(mouseX) +
 *     Math.round → frontières de zones au milieu entre deux lettres.
 *   - Position horizontale du dot = xLabelScale(day) → aligné avec la
 *     lettre du jour, donc tient compte du retrait de 15px.
 *   - Position verticale du dot = y de la courbe à cet x → le dot reste
 *     accroché à la courbe (via getPointOnPath + binary search).
 *   - Le tooltip affiche la valeur brute, jamais interpolée → plus de valeur
 *     négative sur un jour à 0 min.
 *   - L'overlay sombre couvre toute la figure rouge ; les titres rendus
 *     APRÈS le inner group restent au-dessus.
 */

const AverageSessionChart = ({ model }) => {
  const width = 258;
  const height = 263;
  const margin = { top: 80, right: 0, bottom: 46, left: 0 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Retrait horizontal appliqué UNIQUEMENT aux lettres des jours et à la
  // position horizontale du dot. La courbe garde son xScale "bord à bord".
  const labelInset = 15;

  const pathRef = useRef(null);
  const overlayRef = useRef(null);

  const [hovered, setHovered] = useState(null);
  const [animateReady, setAnimateReady] = useState(false);

  const sessions = model.sessions;

  // Scale "bord à bord" : sert à dessiner la courbe sur toute la largeur.
  const xScale = useMemo(
    () => d3.scaleLinear().domain([1, 7]).range([0, innerW]),
    [innerW],
  );

  // Scale en retrait : sert aux lettres des jours et au snapping du dot.
  const xLabelScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([1, 7])
        .range([labelInset, innerW - labelInset]),
    [innerW, labelInset],
  );

  const yScale = useMemo(
    () => d3.scaleLinear().domain(model.sessionLengthRange).range([innerH, 0]),
    [model, innerH],
  );

  const linePath = useMemo(() => {
    return d3
      .line()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.sessionLength))
      .curve(d3.curveCatmullRom.alpha(0.5))(sessions);
  }, [xScale, yScale, sessions]);

  // ─── Animation d'entrée du tracé ───
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
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);
  }, [linePath, animateReady]);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /**
   * Trouve le point de la courbe LISSÉE dont l'abscisse vaut targetX.
   * Binary search sur la longueur du path. Sert à coller le dot sur la
   * courbe à un x donné (ici xLabelScale(day)).
   */
  const getPointOnPath = (targetX) => {
    const pathEl = pathRef.current;
    if (!pathEl) return null;

    let totalLength;
    try {
      totalLength = pathEl.getTotalLength();
    } catch {
      return null;
    }
    if (!totalLength) return null;

    let lo = 0;
    let hi = totalLength;
    for (let i = 0; i < 30 && hi - lo > 0.5; i++) {
      const mid = (lo + hi) / 2;
      const p = pathEl.getPointAtLength(mid);
      if (p.x < targetX) lo = mid;
      else hi = mid;
    }

    const pt = pathEl.getPointAtLength((lo + hi) / 2);
    return { x: pt.x, y: pt.y };
  };

  /**
   * Détermine la session RÉELLE correspondant à la zone horizontale
   * où se trouve la souris. xLabelScale.invert(mouseX) donne un "jour float"
   * (entre 1 et 7) ; Math.round le snappe au jour le plus proche, donc
   * les frontières de zones tombent sur les milieux entre deux LETTRES
   * (xLabelScale(1.5), xLabelScale(2.5), …) — cohérent avec la position
   * du dot.
   */
  const getSessionAtX = (mouseX) => {
    const rawDay = xLabelScale.invert(mouseX);
    const dayNum = clamp(Math.round(rawDay), 1, 7);
    return sessions.find((s) => s.day === dayNum) ?? null;
  };

  const handleMove = (event) => {
    if (!overlayRef.current || !pathRef.current) return;
    const [x] = d3.pointer(event, overlayRef.current);
    const safeX = clamp(x, 0, innerW);

    const session = getSessionAtX(safeX);
    if (!session) return;

    // x horizontal du dot = position de la lettre du jour courant.
    const targetX = xLabelScale(session.day);
    // y = celui de la courbe à ce x → dot toujours accroché à la ligne.
    const point = getPointOnPath(targetX);
    if (!point) return;

    setHovered({
      x: targetX,
      y: point.y,
      // Tooltip = valeur brute du jour, jamais interpolée par la courbe.
      value: session.sessionLength,
    });
  };

  const handleLeave = () => setHovered(null);

  return (
    <figure className="average-sessions-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            style={{ visibility: animateReady ? "visible" : "hidden" }}
          />

          {/* Overlay : du cursor au bord droit, sur la pleine hauteur du SVG */}
          {hovered && (
            <rect
              x={hovered.x}
              y={-margin.top}
              width={width - margin.left - hovered.x}
              height={height}
              fill="#000000"
              fillOpacity={0.0975}
              pointerEvents="none"
            />
          )}

          {/* Lettres des jours — utilisent xLabelScale (15px de retrait),
              alignées avec la position horizontale du dot. */}
          {sessions.map((s) => (
            <text
              key={s.day}
              x={xLabelScale(s.day)}
              y={innerH + 25}
              textAnchor="middle"
              className="average-sessions-chart-day"
            >
              {s.dayLetter}
            </text>
          ))}

          {/* Point blanc + tooltip */}
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
                  Math.max(hovered.x + 12, 0),
                  innerW - 70,
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

          {/* Hit-area pour capter le hover */}
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

        {/* Titres rendus APRÈS le inner group → au-dessus de l'overlay */}
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
      </svg>
    </figure>
  );
};

export default AverageSessionChart;
