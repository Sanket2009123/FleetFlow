import React from 'react';
import { 
  Truck, 
  Shield, 
  PlusCircle, 
  Send, 
  UserCircle2, 
  Activity, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  activeTab: string;
  userRole: UserRole;
  userName: string;
  onOpenLoginModal: () => void;
  onOpenNewTrip: () => void;
  onOpenNewVehicle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  userName,
  onOpenLoginModal,
  onOpenNewTrip,
  onOpenNewVehicle
}) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Fleet Manager':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Dispatcher':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Safety Officer':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Financial Analyst':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/20">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">FleetFlow</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
              Intelligent Dispatch &amp; Asset Life-Cycle Hub
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Add Vehicle (Fleet Manager) */}
          {(userRole === 'Fleet Manager') && (
            <button
              id="header-add-vehicle-btn"
              onClick={onOpenNewVehicle}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:border-slate-600"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Intake Vehicle</span>
            </button>
          )}

          {/* Quick Dispatch Trip (Dispatcher / Manager) */}
          {(userRole === 'Fleet Manager' || userRole === 'Dispatcher') && (
            <button
              id="header-dispatch-btn"
              onClick={onOpenNewTrip}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Trip</span>
            </button>
          )}

          {/* User Role Card / Switcher Button */}
          <button
            id="header-role-switcher-btn"
            onClick={onOpenLoginModal}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-700 group-hover:border-emerald-500/50">
              {userName.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center space-x-1">
                <span>{userName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
              </div>
              <div className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadgeColor(userRole)}`}>
                {userRole}
              </div>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};
