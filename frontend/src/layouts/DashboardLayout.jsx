import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
        </div>
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
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button className="flex items-center gap-3 w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded-md font-medium">
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
