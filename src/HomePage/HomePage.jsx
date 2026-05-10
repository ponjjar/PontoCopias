import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { onValue, ref, getDatabase, push, update } from "firebase/database";
import FontSlider from "../utils/fontSlider";

export default function Painel() {
  const db = getDatabase();
  const [userData, setUserData] = useState(null);

  const [dados, setDados] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  const [filtro, setFiltro] = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroResponsavel, setFiltroResponsavel] = useState("");
  
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaInfo, setNovaInfo] = useState("");
  const [novaEmpresa, setNovaEmpresa] = useState("");
  const [novoResponsavel, setNovoResponsavel] = useState("");
  const [novoDocumentoTipo, setNovoDocumentoTipo] = useState("");
  const [novoDocumentoNumero, setNovoDocumentoNumero] = useState("");
  const [novoEndereco, setNovoEndereco] = useState("");
  const [novoFone, setNovoFone] = useState("");
  const [novaObs, setNovaObs] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [expandidoId, setExpandidoId] = useState(null);
  const [tuyaStatus, setTuyaStatus] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("status");

  // Agendamento Modal states
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
  const [agendDate, setAgendDate] = useState("");
  const [agendTime, setAgendTime] = useState("");

  const toggleExpandido = (id) => {
    setExpandidoId(expandidoId === id ? null : id);
  };

  const inputStyle = {
    padding: "14px 18px",
    marginBottom: 0,
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "10px",
    border: "1px solid #bbb",
    fontSize: "16px",
    outline: "none",
    transition: "border 0.3s",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  };

  useEffect(() => {
    const user = getAuth().currentUser;
    if (user) {
      const userRef = ref(db, `/users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const ud = snapshot.val();
          setUserData({ uid: user.uid, ...ud });
          // Auto select best tab
          if (!abaAtiva || abaAtiva === 'gerenciamento' || abaAtiva === 'status') {
             if (ud.role === 'admin') setAbaAtiva('gerenciamento');
             else setAbaAtiva('agendamentos');
          }
        }
      });
    }

    const dadosRef = ref(db, "/data");
    onValue(dadosRef, (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const formatado = Object.entries(raw).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setDados(formatado);
      } else {
        setDados([]);
      }
      setCarregando(false);
    });

    const agendRef = ref(db, "/agendamentos");
    onValue(agendRef, (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const formatado = Object.entries(raw).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        formatado.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        setAgendamentos(formatado);
      } else {
        setAgendamentos([]);
      }
    });

    // Fetch Tuya Status
    fetch('/api/tuya-status')
      .then(res => res.json())
      .then(data => {
         if (data && data.result && Array.isArray(data.result)) {
           const switchState = data.result.find(item => item.code.includes('switch') || typeof item.value === 'boolean');
           if (switchState) {
             setTuyaStatus(switchState.value);
           } else {
             setTuyaStatus(false);
           }
         } else {
           setTuyaStatus(false);
         }
      })
      .catch(err => {
         console.error("Erro ao ler Tuya:", err);
         setTuyaStatus(false);
      });
  }, []);

  const isAdmin = userData?.role === 'admin';

  let dadosVisiveis = [];
  if (isAdmin) {
    dadosVisiveis = dados.filter(
      (item) =>
        (item.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
          item.info?.toLowerCase().includes(filtro.toLowerCase())) &&
        item.empresa?.toLowerCase().includes(filtroEmpresa.toLowerCase()) &&
        item.responsavel?.toLowerCase().includes(filtroResponsavel.toLowerCase())
    );
  } else if (userData?.empresa) {
    dadosVisiveis = dados.filter(item => item.empresa?.toLowerCase() === userData.empresa.toLowerCase());
  }

  const salvarNoFirebase = async () => {
    if (novoNome.trim() === "") return;
    const refDados = ref(db, "/data");
    await push(refDados, {
      nome: novoNome,
      info: novaInfo,
      empresa: novaEmpresa,
      responsavel: novoResponsavel,
      tipoDocumento: novoDocumentoTipo,
      numeroDocumento: novoDocumentoNumero,
      endereco: novoEndereco,
      fone: novoFone,
      observacoes: novaObs,
    });
    limparFormularioData();
    setModalAberto(false);
  };

  const salvarAgendamento = async () => {
    if (!agendDate || !agendTime) {
      alert("Selecione data e hora!");
      return;
    }
    const refAgend = ref(db, "/agendamentos");
    await push(refAgend, {
      userId: userData.uid,
      userName: userData.name,
      userEmpresa: userData.empresa || "",
      date: agendDate,
      time: agendTime,
      status: "pendente",
      dados: {
        nome: novoNome,
        info: novaInfo,
        empresa: novaEmpresa,
        responsavel: novoResponsavel,
        tipoDocumento: novoDocumentoTipo,
        numeroDocumento: novoDocumentoNumero,
        endereco: novoEndereco,
        fone: novoFone,
        observacoes: novaObs,
      }
    });
    limparFormularioData();
    setAgendDate("");
    setAgendTime("");
    setModalAgendamentoAberto(false);
    alert("Agendamento criado!");
  };

  const limparFormularioData = () => {
    setNovoNome(""); setNovaInfo(""); setNovaEmpresa(""); setNovoResponsavel("");
    setNovoDocumentoTipo(""); setNovoDocumentoNumero(""); setNovoEndereco("");
    setNovoFone(""); setNovaObs("");
  };

  const abrirModalParaGerenciamento = (agendamento) => {
    setNovoNome(agendamento.dados?.nome || "");
    setNovaInfo(agendamento.dados?.info || "");
    setNovaEmpresa(agendamento.dados?.empresa || "");
    setNovoResponsavel(agendamento.dados?.responsavel || "");
    setNovoDocumentoTipo(agendamento.dados?.tipoDocumento || "");
    setNovoDocumentoNumero(agendamento.dados?.numeroDocumento || "");
    setNovoEndereco(agendamento.dados?.endereco || "");
    setNovoFone(agendamento.dados?.fone || "");
    setNovaObs(agendamento.dados?.observacoes || "");
    setModalAberto(true);
  };

  const confirmarAgendamento = async (id) => {
    const agendRef = ref(db, `/agendamentos/${id}`);
    await update(agendRef, { status: "confirmado" });
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem("user");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };


  if (carregando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <h1 style={{ fontSize: 24, color: '#555', fontFamily: "'Inter', sans-serif" }}>Carregando dados...</h1>
      </div>
    );
  }

  const myAgendamentos = agendamentos.filter(a => a.userId === userData?.uid);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f4f7f6",
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Topbar */}
      <div style={{
        background: 'linear-gradient(90deg, #1A2980 0%, #26D0CE 100%)',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: 24, fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>Ponto das Cópias</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isAdmin && (
            <button 
              onClick={() => setAbaAtiva("gerenciamento")}
              style={{
                background: abaAtiva === "gerenciamento" ? "rgba(255,255,255,0.2)" : "transparent",
                border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px",
                cursor: "pointer", fontWeight: "600", transition: "all 0.3s"
              }}
            >
              Gerenciamento
            </button>
          )}
          <button 
            onClick={() => setAbaAtiva("agendamentos")}
            style={{
              background: abaAtiva === "agendamentos" ? "rgba(255,255,255,0.2)" : "transparent",
              border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px",
              cursor: "pointer", fontWeight: "600", transition: "all 0.3s"
            }}
          >
            {isAdmin ? "Agendamentos (Todos)" : "Meus Agendamentos"}
          </button>
          {!isAdmin && userData?.empresa && (
             <button 
             onClick={() => setAbaAtiva("empresa")}
             style={{
               background: abaAtiva === "empresa" ? "rgba(255,255,255,0.2)" : "transparent",
               border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px",
               cursor: "pointer", fontWeight: "600", transition: "all 0.3s"
             }}
           >
             Minha Empresa
           </button>
          )}
          <button 
            onClick={() => setAbaAtiva("status")}
            style={{
              background: abaAtiva === "status" ? "rgba(255,255,255,0.2)" : "transparent",
              border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px",
              cursor: "pointer", fontWeight: "600", transition: "all 0.3s",
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {tuyaStatus === true ? '🟢 Online' : tuyaStatus === false ? '🔴 Offline' : '⚪ Verificando'}
          </button>
          
          {/* LOGOUT BUTTON */}
          <button 
            onClick={handleLogout}
            style={{
              background: "rgba(255, 59, 48, 0.2)",
              border: "1px solid rgba(255, 59, 48, 0.4)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s",
              display: 'flex',
              alignItems: 'center',
              marginLeft: '8px'
            }}
            onMouseOver={(e) => {
               e.currentTarget.style.background = "rgba(255, 59, 48, 0.4)";
            }}
            onMouseOut={(e) => {
               e.currentTarget.style.background = "rgba(255, 59, 48, 0.2)";
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <FontSlider />
        
        {abaAtiva === "status" && (
          <div style={{
            background: "#fff", padding: "48px 32px", borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)", textAlign: "center", marginTop: "24px"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "24px", animation: "pulse 2s infinite" }}>
              {tuyaStatus === true ? '✅' : tuyaStatus === false ? '⛔' : '⏳'}
            </div>
            <h2 style={{ fontSize: "32px", color: "#333", marginBottom: "16px" }}>
              {tuyaStatus === null ? "Verificando status..." : 
               tuyaStatus === true ? "A copiadora está funcionando!" : 
               "A copiadora não está funcionando."}
            </h2>
            <p style={{ fontSize: "18px", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
              {tuyaStatus === null ? "Aguarde um momento enquanto conectamos com o dispositivo." :
               tuyaStatus === true ? "Todos os sistemas operacionais. Você pode utilizar a copiadora neste momento." :
               "No momento o equipamento encontra-se desligado ou em manutenção. Por favor, volte mais tarde."}
            </p>
          </div>
        )}

        {(abaAtiva === "gerenciamento" || abaAtiva === "empresa") && (
          <div style={{ marginTop: "24px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: "28px", color: "#2c3e50", margin: 0 }}>
                {isAdmin ? "Gerenciar Dados" : `Dados da Empresa: ${userData?.empresa}`}
              </h2>
              {isAdmin && (
                <button
                  onClick={() => { limparFormularioData(); setModalAberto(true); }}
                  style={{
                    backgroundColor: "#007AFF", color: "#fff", padding: "12px 24px",
                    borderRadius: "10px", fontSize: "16px", fontWeight: "600",
                    border: "none", cursor: "pointer", transition: "transform 0.2s, background-color 0.2s",
                    boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)"
                  }}
                >
                  + Cadastrar Novo
                </button>
              )}
            </div>

            {isAdmin && (
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
                <input
                  type="text" placeholder="Pesquisar por nome ou informação..."
                  value={filtro} onChange={(e) => setFiltro(e.target.value)}
                  style={{...inputStyle, marginBottom: '16px'}}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <input
                    type="text" placeholder="Filtrar por empresa"
                    value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)} style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Filtrar por responsável"
                    value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)} style={inputStyle}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {dadosVisiveis.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#fff", padding: "24px", borderRadius: "16px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)", borderTop: "6px solid #007AFF",
                    display: "flex", flexDirection: "column", justifyContent: "space-between"
                  }}
                >
                  <div>
                    <p style={{ fontWeight: "700", fontSize: "20px", color: "#2c3e50", marginBottom: "8px", margin: 0 }}>{item.nome}</p>
                    <p style={{ fontSize: "15px", color: "#7f8c8d", marginTop: 0, marginBottom: "16px", lineHeight: "1.5" }}>{item.info}</p>
                    {expandidoId === item.id && (
                      <div style={{ marginTop: "16px", color: "#34495e", fontSize: "14px", padding: "16px", background: "#f8f9fa", borderRadius: "8px" }}>
                        {item.empresa && <p style={{margin: "4px 0"}}><strong>Empresa:</strong> {item.empresa}</p>}
                        {item.responsavel && <p style={{margin: "4px 0"}}><strong>Responsável:</strong> {item.responsavel}</p>}
                        <p style={{margin: "4px 0"}}><strong>Documento:</strong> {item.tipoDocumento || "Não registrado"} {item.numeroDocumento || ""}</p>
                        {item.endereco && <p style={{margin: "4px 0"}}><strong>Endereço:</strong> {item.endereco}</p>}
                        {item.fone && <p style={{margin: "4px 0"}}><strong>Fone:</strong> {item.fone}</p>}
                        {item.observacoes && <p style={{margin: "4px 0"}}><strong>Observações:</strong> {item.observacoes}</p>}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpandido(item.id)}
                    style={{
                      marginTop: "20px", background: expandidoId === item.id ? "#ecf0f1" : "#f0f7ff",
                      color: expandidoId === item.id ? "#7f8c8d" : "#007AFF",
                      border: expandidoId === item.id ? "1px solid #bdc3c7" : "1px solid #cce5ff",
                      borderRadius: "8px", padding: "10px", cursor: "pointer",
                      fontSize: "14px", fontWeight: "600", width: "100%"
                    }}
                  >
                    {expandidoId === item.id ? "Ocultar Detalhes" : "Ver Detalhes Completos"}
                  </button>
                </div>
              ))}
            </div>
            
            {dadosVisiveis.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px", background: "#fff", borderRadius: "16px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <p style={{ color: "#7f8c8d", fontSize: "18px", margin: 0 }}>Nenhum registro encontrado.</p>
              </div>
            )}
          </div>
        )}

        {abaAtiva === "agendamentos" && (
           <div style={{ marginTop: "24px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: "28px", color: "#2c3e50", margin: 0 }}>
                {isAdmin ? "Todos os Agendamentos" : "Meu Histórico de Agendamentos"}
              </h2>
              {!isAdmin && (
                <button
                  onClick={() => { limparFormularioData(); setModalAgendamentoAberto(true); }}
                  style={{
                    backgroundColor: "#28a745", color: "#fff", padding: "12px 24px",
                    borderRadius: "10px", fontSize: "16px", fontWeight: "600",
                    border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                  }}
                >
                  + Agendar Horário
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {(isAdmin ? agendamentos : myAgendamentos).map((item) => {
                 // Check if 1 hour before
                 const is1HourBefore = (new Date(`${item.date}T${item.time}`) - new Date()) <= 3600000;
                 return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#fff", padding: "24px", borderRadius: "16px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)", borderLeft: "6px solid #8e44ad",
                  }}
                >
                  <p style={{ fontWeight: "700", fontSize: "18px", margin: "0 0 8px 0" }}>{item.date} às {item.time}</p>
                  <p style={{ margin: "0 0 8px 0", color: "#555" }}>
                    Status: <strong style={{ color: item.status === 'confirmado' ? '#28a745' : '#f39c12' }}>{item.status.toUpperCase()}</strong>
                  </p>
                  <p style={{ margin: "0 0 16px 0", color: "#777" }}>Usuário: {item.userName} {item.userEmpresa ? `(${item.userEmpresa})` : ''}</p>
                  
                  <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>
                    <strong>Dados para cópia:</strong>
                    <p style={{ margin: "4px 0" }}>Nome: {item.dados?.nome}</p>
                    <p style={{ margin: "4px 0" }}>Info: {item.dados?.info}</p>
                  </div>

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => abrirModalParaGerenciamento(item)}
                        style={{
                          background: "#007AFF", color: "#fff", border: "none", borderRadius: "6px",
                          padding: "8px 12px", cursor: "pointer", flex: 1, fontWeight: "bold"
                        }}
                      >
                        Adicionar aos Dados
                      </button>
                      {item.status === 'pendente' && (
                        <button
                          onClick={() => confirmarAgendamento(item.id)}
                          style={{
                            background: "#28a745", color: "#fff", border: "none", borderRadius: "6px",
                            padding: "8px 12px", cursor: "pointer", flex: 1, fontWeight: "bold"
                          }}
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  )}
                  {!isAdmin && item.status === 'pendente' && is1HourBefore && (
                     <div style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '12px' }}>
                        *Aguardando confirmação do Ponto das Cópias.
                     </div>
                  )}
                </div>
              )})}
              {(isAdmin ? agendamentos : myAgendamentos).length === 0 && (
                <p style={{ color: "#777" }}>Nenhum agendamento encontrado.</p>
              )}
            </div>
           </div>
        )}
      </div>

      {/* MODAL GERENCIAMENTO (Adicionar aos dados oficiais) */}
      {modalAberto && (
        <>
          <div 
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998, backdropFilter: "blur(4px)" }}
            onClick={() => setModalAberto(false)}
          />
          <div
            style={{
              backgroundColor: "#fff", padding: "32px", position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", width: "90%", maxWidth: "600px", maxHeight: "90vh",
              overflowY: "auto", borderRadius: "16px", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", zIndex: 999,
            }}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "24px", fontWeight: "700", color: "#2c3e50", textAlign: "center" }}>
              Cadastrar Novo Dado (Gerenciamento Oficial)
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
              <input type="text" placeholder="Nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Informação" value={novaInfo} onChange={(e) => setNovaInfo(e.target.value)} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="text" placeholder="Nome da Empresa" value={novaEmpresa} onChange={(e) => setNovaEmpresa(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Responsável" value={novoResponsavel} onChange={(e) => setNovoResponsavel(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <select value={novoDocumentoTipo} onChange={(e) => setNovoDocumentoTipo(e.target.value)} style={inputStyle}>
                  <option value="">Tipo de documento</option><option value="CNPJ">CNPJ</option><option value="CPF">CPF</option><option value="RG">RG</option>
                </select>
                <input type="text" placeholder="Número do Documento" value={novoDocumentoNumero} onChange={(e) => setNovoDocumentoNumero(e.target.value)} style={inputStyle} />
              </div>
              <input type="text" placeholder="Endereço" value={novoEndereco} onChange={(e) => setNovoEndereco(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Fone/Fax" value={novoFone} onChange={(e) => setNovoFone(e.target.value)} style={inputStyle} />
              <textarea placeholder="Observações" value={novaObs} onChange={(e) => setNovaObs(e.target.value)} style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} />
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
              <button onClick={() => setModalAberto(false)} style={{ backgroundColor: "#f1f3f5", color: "#495057", padding: "14px", borderRadius: "10px", flex: 1, fontWeight: "600", border: "none", cursor: "pointer", fontSize: "16px" }}>Cancelar</button>
              <button onClick={salvarNoFirebase} style={{ backgroundColor: "#007AFF", color: "#fff", padding: "14px", borderRadius: "10px", flex: 1, fontWeight: "600", border: "none", cursor: "pointer", fontSize: "16px" }}>Salvar Cadastro</button>
            </div>
          </div>
        </>
      )}

      {/* MODAL AGENDAMENTO */}
      {modalAgendamentoAberto && (
        <>
          <div 
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998, backdropFilter: "blur(4px)" }}
            onClick={() => setModalAgendamentoAberto(false)}
          />
          <div
            style={{
              backgroundColor: "#fff", padding: "32px", position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", width: "90%", maxWidth: "600px", maxHeight: "90vh",
              overflowY: "auto", borderRadius: "16px", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", zIndex: 999,
            }}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "8px", fontWeight: "700", color: "#2c3e50", textAlign: "center" }}>
              Fazer Agendamento
            </h2>
            {tuyaStatus === false && (
               <p style={{textAlign:'center', color: '#dc3545', fontWeight: 'bold'}}>
                 Atenção: A copiadora encontra-se OFF no momento.
               </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="date" value={agendDate} onChange={(e) => setAgendDate(e.target.value)} style={inputStyle} />
                <input type="time" value={agendTime} onChange={(e) => setAgendTime(e.target.value)} style={inputStyle} />
              </div>
              <h4 style={{ margin: '16px 0 0 0' }}>Preencha os dados das cópias (opcional, para acelerar o processo):</h4>
              <input type="text" placeholder="Nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Informação" value={novaInfo} onChange={(e) => setNovaInfo(e.target.value)} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="text" placeholder="Nome da Empresa" value={novaEmpresa} onChange={(e) => setNovaEmpresa(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Responsável" value={novoResponsavel} onChange={(e) => setNovoResponsavel(e.target.value)} style={inputStyle} />
              </div>
              <textarea placeholder="Observações" value={novaObs} onChange={(e) => setNovaObs(e.target.value)} style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} />
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
              <button onClick={() => setModalAgendamentoAberto(false)} style={{ backgroundColor: "#f1f3f5", color: "#495057", padding: "14px", borderRadius: "10px", flex: 1, fontWeight: "600", border: "none", cursor: "pointer", fontSize: "16px" }}>Cancelar</button>
              <button onClick={salvarAgendamento} style={{ backgroundColor: "#28a745", color: "#fff", padding: "14px", borderRadius: "10px", flex: 1, fontWeight: "600", border: "none", cursor: "pointer", fontSize: "16px" }}>Agendar</button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
