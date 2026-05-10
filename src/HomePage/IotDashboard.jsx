import { useEffect, useState } from "react";
import { ref, onValue, getDatabase } from "firebase/database";
import { Bell, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, differenceInDays } from "date-fns";

export default function IotDashboard() {
  const db = getDatabase();
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
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
  }, [db]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl font-medium text-gray-500 animate-pulse">
          Carregando sensores IoT...
        </p>
      </div>
    );
  }

  // IoT Simulation Logic (Data Analysis)
  const hoje = new Date();
  
  // Analisa clientes que não tem pedido recente
  const alertasInatividade = dados.filter((item) => {
    if (!item.dataUltimoServico) return true; // Se não tem data, já é um alerta
    const dias = differenceInDays(hoje, new Date(item.dataUltimoServico));
    return dias > 30;
  });

  const analiseServicos = dados.reduce((acc, item) => {
    const cat = item.categoriaServico || "Não Categorizado";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const dataGraficoPie = Object.keys(analiseServicos).map((key) => ({
    name: key,
    value: analiseServicos[key],
  }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const clientesAtivos = dados.length - alertasInatividade.length;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Activity size={32} className="text-blue-600" />
          Dashboard IoT e Análises
        </h1>
        <p className="text-gray-500 mt-2">
          Monitoramento inteligente de dados de clientes e serviços.
        </p>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Clientes</p>
            <p className="text-2xl font-bold text-gray-800">{dados.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Clientes Ativos (&lt;30 dias)</p>
            <p className="text-2xl font-bold text-gray-800">{clientesAtivos}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alerta de Inatividade</p>
            <p className="text-2xl font-bold text-gray-800">{alertasInatividade.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Painel de Alertas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-red-500" />
            Alertas Automáticos (IoT Simulator)
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {alertasInatividade.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum alerta no momento.</p>
            ) : (
              alertasInatividade.map((cliente) => {
                const dias = cliente.dataUltimoServico 
                  ? differenceInDays(hoje, new Date(cliente.dataUltimoServico))
                  : "N/A";
                
                return (
                  <div key={cliente.id} className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3">
                    <Clock className="text-red-500 shrink-0 mt-1" size={18} />
                    <div>
                      <p className="font-semibold text-red-800">{cliente.nome} ({cliente.empresa || 'Sem empresa'})</p>
                      <p className="text-sm text-red-600 mt-1">
                        {dias === "N/A" 
                          ? "Falta cadastrar a data do último serviço." 
                          : `Ciclo de faturamento pendente. Último serviço há ${dias} dias.`}
                      </p>
                      <button className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors font-medium">
                        Enviar Lembrete por WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfico de Categorias */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Distribuição de Serviços (Mineração de Dados)
          </h2>
          <div className="h-[300px]">
            {dataGraficoPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataGraficoPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dataGraficoPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Sem dados suficientes para o gráfico.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Para corrigir os icones importados faltando
import { Activity, Users } from "lucide-react";
