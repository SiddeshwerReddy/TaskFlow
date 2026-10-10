import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r shadow-sm relative">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
        </div>
        
        {/* User Profile Badge */}
        {user && (
          <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 text-left text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
