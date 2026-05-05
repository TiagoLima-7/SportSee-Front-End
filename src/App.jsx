import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";

function App() {
  return (
    // <Home/>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/user/12" replace />} />
        <Route path="user/:id" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
