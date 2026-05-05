import useUserData from "../hooks/useUserData.js";
import { useParams } from "react-router-dom";

import ActivityModel from "../models/ActivityModel.js";
import AverageSessionModel from "../models/AverageSessionModel.js";
import ScoreModel from "../models/ScoreModel.js";

import ActivityChart from "../components/charts/ActivityChart.jsx";
import AverageSessionChart from "../components/charts/AverageSessionChart.jsx";
import PerformanceModel from "../models/PerformanceModel.js";
import PerformanceChart from "../components/charts/PerformanceChart.jsx";
import ScoreChart from "../components/charts/ScoreChart.jsx";

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
        <div className="recap-container"></div>
      </div>
    </div>
  );
};

export default Home;
