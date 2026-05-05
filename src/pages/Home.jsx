import useUserData from "../hooks/useUserData.js";
import { useParams } from "react-router-dom";
import ActivityModel from "../models/ActivityModel.js";
import ActivityChart from "../components/charts/ActivityChart.jsx";

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

  return (
    <>
      <h1>Bonjour {user.userInfos.firstName}</h1>
      <p>Felicitations ! Vous avez explosé vos objectifs hier 👏</p>
      <p>Score : {Math.round(user.score * 100)}%</p>
      <ActivityChart model={activityModel} />
      //Débug temporaire
      <pre>{JSON.stringify({ activity, sessions, performance }, null, 2)}</pre>
    </>
  );
};

export default Home;
