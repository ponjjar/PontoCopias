import { useState } from "react";
import "../App.css";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, set, getDatabase } from "firebase/database";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
function Login() {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  // Import the functions you need from the SDKs you need
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
  const onSubmitLogin = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    //check if all fields are filled
    if (e.target[0].value === "" || e.target[1].value === "") {
      alert("Preencha todos os campos");
      return;
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
          localStorage.setItem("user", JSON.stringify(user));
          //go to home page
          navigate("/home");
          window.location.reload();
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          alert("Usuário não encontrado");
        });
    }
  };

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    const email = e.target[1].value;
    const password = e.target[2].value;
    //check if all fields are filled
    if (
      e.target[0].value === "" ||
      e.target[1].value === "" ||
      e.target[2].value === ""
    ) {
      alert("Preencha todos os campos");
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        //create user name in realtime database

        const user = userCredential.user;
        console.log(user);
        localStorage.setItem("user", JSON.stringify(user));

        try {
          const dbRef = ref(getDatabase(), "/users/" + user.uid);
          set(dbRef, {
            name: e.target[0].value,
            email: e.target[1].value,
          });
        } catch (error) {
          //create this user in database
          console.log(error);
        }
        alert("Usuário criado com sucesso");
        //go to home page
        //call onSubmitLogin
        e.target[0].value = e.target[1].value;
        e.target[1].value = e.target[2].value;

        onSubmitLogin(e);
      })
      .catch((error) => {
        const errorCode = error.code;

        console.log(error);
        if (password.length < 6) {
          alert("Senha muito curta, tente novamente");
        } else if (errorCode === 400) {
          alert("Revise os campos e tente novamente");
        } else if (error.message === "EMAIL_EXISTS") {
          alert("Email já cadastrado");
        }
      });
  };

  //const analytics = getAnalytics(app);
  return (
    <>
      <div></div>
      <h1>Ponto das Cópias</h1>
      <h3>{registering ? "Se cadastre" : "Faça o login"}</h3>
      {
        //make a login form with register screen with column screen
      }
      <div
        style={{
          //pass a card idea with elevation with a form
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1rem",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderRadius: "1rem",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {!registering && (
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginTop: "1rem",
            }}
            onSubmit={(e) => {
              e.preventDefault();
              console.log(e.target[0].value);
              console.log(e.target[1].value);
              onSubmitLogin(e);
            }}
          >
            <label>
              <input type="text" placeholder="Digite seu email" />
            </label>
            <label>
              <input type="password" placeholder="Digite sua senha" />
            </label>
            <button
              type="submit"
              style={{
                maxWidth: "200px",
                minWidth: "150px",

                alignSelf: "center",
              }}
            >
              Entrar
            </button>

            <button
              style={{ alignSelf: "center", backgroundColor: "transparent" }}
              onClick={() => setRegistering(true)}
            >
              Ainda não tenho uma conta
            </button>
          </form>
        )}
        {registering && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log(e.target[0].value);
              console.log(e.target[1].value);
              console.log(e.target[2].value);
              onSubmitRegister(e);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <label>
              <input type="text" placeholder="Digite seu nome" />
            </label>
            <label>
              <input type="text" placeholder="Digite seu email" />
            </label>
            <label>
              <input type="password" placeholder="Digite sua senha" />
            </label>
            <button type="submit">Registrar</button>
            <button
              style={{ alignSelf: "flex-end", backgroundColor: "transparent" }}
              onClick={() => setRegistering(false)}
            >
              Já tenho uma conta
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export default Login;
