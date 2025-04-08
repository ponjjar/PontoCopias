import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./LoginPage";
import { getDatabase, ref, get } from "firebase/database";

//verifica se o usuário está logado no firebase e retorna true ou false
const VerifyLoggedId = async (user) => {
  // console.log("tentando verificar" + "/users/" + user["uid"]);
  const dbRef = ref(getDatabase(), "/users/" + user["uid"]);
  return await get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

function LoginGuard() {
  // await 1 secondo
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const VerifyUser = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      //aguarda verificação do usuário
      if (await VerifyLoggedId(user)) {
        setLoggedIn(true);
      } else {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    VerifyUser();
  }, []);

  // retorna o componente de login se o usuário não estiver logado ou carregando
  if (!loading) {
    if (!loggedIn) {
      return <Login />;
    }

    return <Outlet />;
  } else {
    return <h1>Carregando...</h1>;
  }
}

export default LoginGuard;
