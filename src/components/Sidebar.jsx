import { NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const links = [
  { to: '/',                 label: 'Dashboard',        icon: '📊' },
  { to: '/drivers/pending',  label: 'Pending Approval',  icon: '⏳' },
  { to: '/drivers',          label: 'All Drivers',       icon: '🏍️' },
  { to: '/rides',            label: 'Rides',             icon: '🛣️' },
  { to: '/users',            label: 'Users',             icon: '👥' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏍️</span>
          <div>
            <div className="font-bold text-gray-900 text-lg leading-none">Baiku</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${isActive
                ? 'bg-yellow-50 text-yellow-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut(auth)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
