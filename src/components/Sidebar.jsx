import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Activity, Settings, LogOut } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";

export default function Sidebar() {
  const location = useLocation();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth);
  };

  const navItems = [
    { name: "Clientes & Serviços", path: "/painel", icon: <Users size={20} /> },
    { name: "Dashboard IoT", path: "/iot", icon: <Activity size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <LayoutDashboard size={24} />
          <span>Ponto Cópias</span>
        </h1>
      </div>


      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === "/" && item.path === "/painel");
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
