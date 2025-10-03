import "./App.css";

import { Routes, Route } from "react-router-dom";
import LoginGuard from "./LoginPage/LoginGuard";
import Painel from "./HomePage/HomePage";
// import MemoryGame from "./Jogos/memoria";

function App() {
  //configura rotas para a aplicação
  return (
    <>
      <div className="app">
        {/* <VLibras forceOnload /> */}
        <Routes>
          <Route element={<LoginGuard />}>
            {/* LoginGuard é o componente que verifica se o usuário está logado */}
            <Route path="/*" element={<Painel />} />{" "}
            {/* HomePage é o componente que exibe a página inicial */}
            {/* <Route path="/jogos/memoria" element={<MemoryGame />} /> */}
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
