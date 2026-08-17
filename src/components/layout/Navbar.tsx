import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Send, 
  Wrench, 
  Fuel, 
  Users, 
  BarChart3, 
  Boxes,
  Database
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeTripsCount: number;
  inShopCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeTripsCount,
  inShopCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { 
      id: '3d_twin', 
      label: '3D Fleet & Radar', 
      icon: Boxes, 
      special: true, 
      specialText: '3D WebGL',
      specialColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    { id: 'vehicles', label: 'Vehicle Registry', icon: Truck },
    { 
      id: 'trips', 
      label: 'Trip Dispatcher', 
      icon: Send, 
      badge: activeTripsCount > 0 ? `${activeTripsCount} Active` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    { 
      id: 'maintenance', 
      label: 'Maintenance', 
      icon: Wrench,
      badge: inShopCount > 0 ? `${inShopCount} In Shop` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    { id: 'expenses', label: 'Expenses & Fuel', icon: Fuel },
    { id: 'drivers', label: 'Driver Profiles', icon: Users },
    { id: 'analytics', label: 'ROI Analytics', icon: BarChart3 },
    { 
      id: 'mern_hub', 
      label: 'MERN & MongoDB', 
      icon: Database, 
      special: true,
      specialText: 'MERN API',
      specialColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}

                {item.special && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${item.specialColor || 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                    {item.specialText || 'REST API'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

