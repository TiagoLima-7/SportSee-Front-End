import { useState } from 'react'
import Header from '../components/layout/Header.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import useUserData from '../hooks/useUserData.js'

const Home = () => {
  const [userId] = useState(18);
  const { user, activity, sessions, performance, loading, error } = useUserData(userId);

  if(loading) return <p>Chargement...</p>
  if(error) return <p>Erreur : {error.message}</p>
  return (
    <div>
      <Header/>
      <Sidebar/>
      <div className="content">
        <h1>Bonjour {user.userInfos.firstName}</h1>
        <p>Felicitations ! Vous avez explosé vos objectifs hier 👏</p>
        <p>Score : {Math.round(user.score * 100)}%</p>
        <pre>{JSON.stringify({activity, sessions, performance}, null, 2)}</pre>
      </div>
    </div>
  )
}

export default Home