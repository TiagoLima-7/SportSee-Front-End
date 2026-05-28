/**
 * useAvailableUsers - liste des utilisateurs interrogeables avec la source
 * courante (mock ou réelle).
 *
 * Le micro back-end SportSee n'a pas d'endpoint "list users", donc on
 * connaît les IDs à l'avance (12 et 18 sont les seuls mockés côté Node,
 * cf. README du back). Le hook va chercher le firstName de chacun via
 * la fonction getUserMainData() exportée par api.js — qui dispatch
 * automatiquement vers mock ou real selon la source active.
 *
 * Refetch quand la source bascule : utile si tu modifies les données mock
 * ou si le back démarre/se coupe.
 *
 * Les fetches qui échouent sont silencieusement filtrés → si l'API réelle
 * est éteinte, on retourne juste un tableau vide et le Header affichera
 * "Aucun utilisateur".
 */

import { useEffect, useState } from "react";

import { getUserMainData, useApiSource } from "../services/mockApi";

const KNOWN_USER_IDS = [12, 18];

const useAvailableUsers = () => {
  const { source } = useApiSource();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let ignore = false;

    Promise.all(
      KNOWN_USER_IDS.map((id) =>
        getUserMainData(id)
          .then((res) => ({
            id: res.data.id,
            firstName: res.data.userInfos.firstName,
          }))
          .catch(() => null),
      ),
    ).then((results) => {
      if (ignore) return;
      setUsers(results.filter(Boolean));
    });

    return () => {
      ignore = true;
    };
  }, [source]);

  return users;
};

export default useAvailableUsers;
