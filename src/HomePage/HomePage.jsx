import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { onValue, ref, getDatabase, push } from "firebase/database";

export default function Painel() {
  const db = getDatabase();
  const [dados, setDados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroResponsavel, setFiltroResponsavel] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaInfo, setNovaInfo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [novaEmpresa, setNovaEmpresa] = useState("");
  const [novoResponsavel, setNovoResponsavel] = useState("");
  const [novoDocumentoTipo, setNovoDocumentoTipo] = useState("");
  const [novoDocumentoNumero, setNovoDocumentoNumero] = useState("");
  const [novoEndereco, setNovoEndereco] = useState("");
  const [novoFone, setNovoFone] = useState("");
  const [novaObs, setNovaObs] = useState("");
  const [expandidoId, setExpandidoId] = useState(null);

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
          console.log("Usuário verificado.");
        } else {
          console.log("Usuário não encontrado.");
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
      }
      setCarregando(false);
    });
  }, []);

  const dadosFiltrados = dados.filter(
    (item) =>
      (item.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        item.info?.toLowerCase().includes(filtro.toLowerCase())) &&
      item.empresa?.toLowerCase().includes(filtroEmpresa.toLowerCase()) &&
      item.responsavel?.toLowerCase().includes(filtroResponsavel.toLowerCase())
  );

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
    setNovoNome("");
    setNovaInfo("");
    setNovaEmpresa("");
    setNovoResponsavel("");
    setNovoDocumentoTipo("");
    setNovoDocumentoNumero("");
    setNovoEndereco("");
    setNovoFone("");
    setNovaObs("");
    setModalAberto(false);
  };

  if (carregando) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Carregando dados...</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        width: "100%",
        margin: "0 auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 36,
          fontWeight: "bold",
          marginBottom: 24,
          color: "#1a1a1a",
          textAlign: "center",
        }}
      >
        Ponto das Cópias
      </h1>

      <input
        type="text"
        placeholder="Pesquisar por nome ou informação..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={inputStyle}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          margin: "16px 0",
        }}
      >
        <input
          type="text"
          placeholder="Filtrar por empresa"
          value={filtroEmpresa}
          onChange={(e) => setFiltroEmpresa(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Filtrar por responsável"
          value={filtroResponsavel}
          onChange={(e) => setFiltroResponsavel(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button
        onClick={() => setModalAberto(true)}
        style={{
          backgroundColor: "#28a745",
          color: "#fff",
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
          width: "100%",
          fontSize: 18,
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
      >
        Cadastrar Novo
      </button>

      <div style={{ height: 1, backgroundColor: "#ccc", marginBottom: 12 }} />

      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {dadosFiltrados.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: "#fdfdfd",
              padding: 24,
              borderRadius: 12,
              marginBottom: 20,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
              borderLeft: "5px solid #007AFF",
            }}
          >
            <p style={{ fontWeight: "600", fontSize: 22, marginBottom: 8 }}>
              {item.nome}
            </p>
            <p style={{ fontSize: 17, color: "#444" }}>{item.info}</p>
            {expandidoId === item.id && (
              <div style={{ marginTop: 10, color: "#333", fontSize: 15 }}>
                {item.empresa && (
                  <p>
                    <strong>Empresa:</strong> {item.empresa}
                  </p>
                )}
                {item.responsavel && (
                  <p>
                    <strong>Responsável:</strong> {item.responsavel}
                  </p>
                )}
                <p>
                  <strong>Documento:</strong>{" "}
                  {item.tipoDocumento ? item.tipoDocumento : "Não registrado"}{" "}
                  {item.numeroDocumento ? item.numeroDocumento : ""}
                </p>
                {item.endereco && (
                  <p>
                    <strong>Endereço:</strong> {item.endereco}
                  </p>
                )}
                {item.fone && (
                  <p>
                    <strong>Fone:</strong> {item.fone}
                  </p>
                )}
                {item.observacoes && (
                  <p>
                    <strong>Observações:</strong> {item.observacoes}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => toggleExpandido(item.id)}
              style={{
                marginTop: 10,
                background: "#007AFF",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {expandidoId === item.id ? "Fechar" : "..."}
            </button>
          </div>
        ))}
        {dadosFiltrados.length === 0 && (
          <p style={{ color: "#888", textAlign: "center", marginTop: 20 }}>
            Nenhum dado encontrado.
          </p>
        )}
      </div>

      {modalAberto && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: 24,
            position: "fixed",
            top: "10%",
            left: "5%",
            right: "5%",
            maxWidth: "600px",
            margin: "0 auto",
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            zIndex: 999,
          }}
        >
          <h2
            style={{
              fontSize: 24,
              marginBottom: 16,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Cadastrar Novo Dado
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >
            <input
              type="text"
              placeholder="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Informação"
              value={novaInfo}
              onChange={(e) => setNovaInfo(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Nome da Empresa"
              value={novaEmpresa}
              onChange={(e) => setNovaEmpresa(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Responsável"
              value={novoResponsavel}
              onChange={(e) => setNovoResponsavel(e.target.value)}
              style={inputStyle}
            />
            <select
              value={novoDocumentoTipo}
              onChange={(e) => setNovoDocumentoTipo(e.target.value)}
              style={inputStyle}
            >
              <option value="">Selecione o tipo de documento</option>
              <option value="CNPJ">CNPJ</option>
              <option value="CPF">CPF</option>
              <option value="RG">RG</option>
            </select>
            <input
              type="text"
              placeholder="Número do Documento"
              value={novoDocumentoNumero}
              onChange={(e) => setNovoDocumentoNumero(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Endereço"
              value={novoEndereco}
              onChange={(e) => setNovoEndereco(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Fone/Fax"
              value={novoFone}
              onChange={(e) => setNovoFone(e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="Observações"
              value={novaObs}
              onChange={(e) => setNovaObs(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              onClick={salvarNoFirebase}
              style={{
                backgroundColor: "#007AFF",
                color: "#fff",
                padding: 12,
                borderRadius: 8,
                flex: 1,
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
              }}
            >
              Salvar
            </button>
            <button
              onClick={() => setModalAberto(false)}
              style={{
                backgroundColor: "#6c757d",
                color: "#fff",
                padding: 12,
                borderRadius: 8,
                flex: 1,
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
