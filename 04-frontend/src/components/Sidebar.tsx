import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: '历史保护建筑', icon: '🏛️' },
  { path: '/maps', label: '历史地图', icon: '🗺️' },
  { path: '/buildings', label: '历史建筑管理', icon: '🏢' },
  { path: '/photos', label: '历史照片管理', icon: '📷' },
  { path: '/timeline', label: '历史事件', icon: '📜' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={`bg-gray-900 text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!collapsed && <h1 className="font-bold text-lg">上海历史</h1>}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title={collapsed ? '展开菜单' : '收起菜单'}
        >
          {collapsed ? '👉' : '👈'}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
              location.pathname === item.path ? 'bg-gray-800 border-r-4 border-blue-500' : ''
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}