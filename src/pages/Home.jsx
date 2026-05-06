import useUserData from "../hooks/useUserData.js";
import { useParams } from "react-router-dom";

import ActivityModel from "../models/ActivityModel.js";
import AverageSessionModel from "../models/AverageSessionModel.js";
import PerformanceModel from "../models/PerformanceModel.js";
import ScoreModel from "../models/ScoreModel.js";

import ActivityChart from "../components/charts/ActivityChart.jsx";
import AverageSessionChart from "../components/charts/AverageSessionChart.jsx";
import PerformanceChart from "../components/charts/PerformanceChart.jsx";
import ScoreChart from "../components/charts/ScoreChart.jsx";

import KeyDataCard from "../components/cards/KeyDataCard.jsx";

import caloriesIcon from "../assets/icons/energy.svg";
import proteinsIcon from "../assets/icons/chicken.svg";
import carbIcon from "../assets/icons/apple.svg";
import lipidIcon from "../assets/icons/cheeseburger.svg";

const KEY_DATA_CONFIG = [
  {
    icon: caloriesIcon,
    iconColor: "var(--red-bg)",
    unit: "kCal",
    label: "Calories",
    dataKey: "calorieCount",
  },
  {
    icon: proteinsIcon,
    iconColor: "rgba(74, 184, 255, 0.07)",
    unit: "g",
    label: "Protéines",
    dataKey: "proteinCount",
  },
  {
    icon: carbIcon,
    iconColor: "rgba(249, 206, 35, 0.07)",
    unit: "g",
    label: "Glucides",
    dataKey: "carbohydrateCount",
  },
  {
    icon: lipidIcon,
    iconColor: "rgba(253, 81, 129, 0.07)",
    unit: "g",
    label: "Lipides",
    dataKey: "lipidCount",
  },
];

const Home = () => {
  // const [userId] = useState(18);
  // const { user, activity, sessions, performance, loading, error } = useUserData(userId);
  const { id } = useParams();
  const userId = Number(id);

  //If URL contains anything other than a number, we avoid calling the API with NAN
  const isValidId = Number.isInteger(userId) && userId > 0;

  const { user, activity, sessions, performance, loading, error } = useUserData(
    isValidId ? userId : null,
  );

  if (!isValidId) return <p>Identifiant utilisateur invalide</p>;
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Utilisateur introuvable : {error.message}</p>;

  const activityModel = new ActivityModel(activity);
  const avarageSessionLengthModel = new AverageSessionModel(sessions);
  const performanceModel = new PerformanceModel(performance);
  const scoreModel = new ScoreModel(user);

  return (
    <div className="data-container">
      <div className="text-container">
        <h1>
          Bonjour <span className="user-name">{user.userInfos.firstName}</span>
        </h1>
        <p>Felicitations ! Vous avez explosé vos objectifs hier 👏</p>
      </div>
      <div className="graphs-container">
        <div className="main-graphs-container">
          <ActivityChart model={activityModel} />
          <div className="small-graphs-container">
            <AverageSessionChart model={avarageSessionLengthModel} />
            <PerformanceChart model={performanceModel} />
            <ScoreChart model={scoreModel} />
          </div>
        </div>
        <div className="recap-container">
          {KEY_DATA_CONFIG.map((cfg) => (
            <KeyDataCard
              key={cfg.label}
              icon={cfg.icon}
              iconColor={cfg.iconColor}
              value={user.keyData[cfg.dataKey]}
              unit={cfg.unit}
              label={cfg.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
