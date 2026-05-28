import { useEffect, useState } from "react";

/**
 * Hook qui retourne le temps écoulé en ms depuis le montage du composant
 * (ou depuis le changement de `restartKey`), mis à jour à chaque frame
 * via requestAnimationFrame, jusqu'à atteindre `duration`.
 *
 * Utile pour piloter des animations dérivées (hauteur de barre, score,
 * compteur de valeur, etc.) sans empiler plusieurs setState ni recourir
 * à d3.transition côté JSX.
 *
 * @param {number} duration   Durée totale de l'animation en ms.
 * @param {*}      restartKey Optionnel : si ça change, l'animation
 *                            redémarre depuis 0 (par ex. quand l'utilisateur
 *                            change et que les valeurs cibles changent).
 * @returns {number} Temps écoulé en ms, dans [0, duration].
 */
export default function useElapsedTime(duration, restartKey = 0) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let startTime = null;
    let rafId;

    // Le premier tick fait startTime = now → t = 0 → setElapsed(0).
    // Pas besoin de reset synchrone ici, qui déclencherait un warning
    // "setState dans le corps d'un effet". La boucle RAF s'en charge
    // de manière asynchrone, ce qui est conforme aux recommandations React.
    const tick = (now) => {
      if (startTime === null) startTime = now;
      const t = now - startTime;
      setElapsed(Math.min(t, duration));
      if (t < duration) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [duration, restartKey]);

  return elapsed;
}
