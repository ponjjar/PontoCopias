import { useState } from "react";
import "../App.css";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { ref, set, getDatabase } from "firebase/database";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const inputStyle = {
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #e0e6ed',
  background: '#f8fafc',
  fontSize: '15px',
  outline: 'none',
  transition: 'all 0.2s',
  width: '100%',
  boxSizing: 'border-box'
};

const btnPrimaryStyle = {
  background: 'linear-gradient(90deg, #1A2980 0%, #26D0CE 100%)',
  color: '#fff',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  width: '100%',
  marginTop: '8px'
};

const btnSecondaryStyle = {
  background: 'transparent',
  color: '#2c3e50',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background 0.2s',
  width: '100%'
};

function Login() {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);

  const onSubmitLogin = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    if (email === "" || password === "") {
      alert("Preencha todos os campos");
      return;
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/home");
          window.location.reload();
        })
        .catch((error) => {
          console.log(error.code, error.message);
          alert("Usuário não encontrado ou senha incorreta");
        });
    }
  };

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    const nome = e.target[0].value;
    const email = e.target[1].value;
    const empresa = e.target[2].value;
    const password = e.target[3].value;

    if (nome === "" || email === "" || password === "") {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem("user", JSON.stringify(user));

        try {
          const dbRef = ref(getDatabase(), "/users/" + user.uid);
          set(dbRef, {
            name: nome,
            email: email,
            empresa: empresa || "",
            role: "comum",
          });
        } catch (error) {
          console.log(error);
        }
        alert("Usuário criado com sucesso");
        
        e.target[0].value = email;
        e.target[1].value = password;
        onSubmitLogin(e);
      })
      .catch((error) => {
        console.log(error);
        if (password.length < 6) {
          alert("Senha muito curta, tente novamente (mínimo 6 caracteres)");
        } else if (error.code === 'auth/email-already-in-use') {
          alert("Email já cadastrado");
        } else {
          alert("Erro ao cadastrar: " + error.message);
        }
      });
  };

  const handleResetPassword = async () => {
    const email = prompt("Digite seu email para redefinir a senha:");
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de redefinição enviado! Verifique sua caixa de entrada (ou span).");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar email. Verifique se o endereço está correto ou já possui cadastro.");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '24px'
    }}>
      <div style={{
        background: '#fff',
        padding: '48px 40px',
        borderRadius: '24px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #1A2980 0%, #26D0CE 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '8px',
          letterSpacing: '-1px'
        }}>
          Ponto Cópias
        </div>
        <p style={{ color: '#7f8c8d', marginBottom: '32px', fontSize: '16px' }}>
          {registering ? "Crie sua conta para continuar" : "Faça login no painel de serviços"}
        </p>

        {!registering ? (
          <form onSubmit={onSubmitLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" placeholder="Seu endereço de email" required style={inputStyle} />
            <input type="password" placeholder="Sua senha" required style={inputStyle} />
            
            <button type="button" onClick={handleResetPassword} style={{
              alignSelf: 'flex-end', background: 'transparent', border: 'none',
              color: '#007AFF', fontSize: '14px', cursor: 'pointer', padding: '0 4px',
              fontWeight: '600'
            }}>
              Esqueci minha senha
            </button>

            <button type="submit" style={btnPrimaryStyle} onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}>
              Entrar no Sistema
            </button>
            
            <div style={{ margin: '16px 0', color: '#bdc3c7', fontSize: '14px', position: 'relative' }}>
              <span style={{ background: '#fff', padding: '0 12px', position: 'relative', zIndex: 1 }}>OU</span>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#ecf0f1', zIndex: 0 }}></div>
            </div>

            <button type="button" onClick={() => setRegistering(true)} style={btnSecondaryStyle} onMouseOver={(e) => e.target.style.background = '#f8fafc'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
              Criar uma nova conta
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Seu nome completo" required style={inputStyle} />
            <input type="email" placeholder="Seu endereço de email" required style={inputStyle} />
            <input type="text" placeholder="Nome da sua Empresa (Opcional)" style={inputStyle} />
            <input type="password" placeholder="Crie uma senha segura" required style={inputStyle} />
            
            <button type="submit" style={btnPrimaryStyle} onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}>
              Cadastrar Conta
            </button>
            
            <div style={{ margin: '16px 0', color: '#bdc3c7', fontSize: '14px', position: 'relative' }}>
              <span style={{ background: '#fff', padding: '0 12px', position: 'relative', zIndex: 1 }}>JÁ POSSUI CONTA?</span>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#ecf0f1', zIndex: 0 }}></div>
            </div>

            <button type="button" onClick={() => setRegistering(false)} style={btnSecondaryStyle} onMouseOver={(e) => e.target.style.background = '#f8fafc'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
              Fazer Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
