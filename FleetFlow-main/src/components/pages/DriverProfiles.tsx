import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  Calendar, 
  Award, 
  Phone, 
  Mail,
  Truck
} from 'lucide-react';
import { Driver, DriverStatus, VehicleType } from '../../types';

interface DriverProfilesProps {
  drivers: Driver[];
  onOpenNewDriver: () => void;
  onEditDriver: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
  onToggleStatus: (id: string, status: DriverStatus) => void;
}

export const DriverProfiles: React.FC<DriverProfilesProps> = ({
  drivers,
  onOpenNewDriver,
  onEditDriver,
  onDeleteDriver,
  onToggleStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchSearch = 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate).getTime() < new Date().getTime();
  };

  const getStatusBadge = (driver: Driver) => {
    if (isLicenseExpired(driver.licenseExpiryDate)) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          <span>License Expired</span>
        </span>
      );
    }

    switch (driver.status) {
      case 'On Duty':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>On Duty (Available)</span>
          </span>
        );
      case 'On Trip':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Truck className="w-3 h-3" />
            <span>On Trip</span>
          </span>
        );
      case 'Off Duty':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
            <span>Off Duty</span>
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span>Suspended</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Driver Compliance &amp; Profiles</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {drivers.length} Certified Drivers
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Commercial license verification, vehicle class endorsements, safety ratings, and automated expiration blocks.
          </p>
        </div>

        <button
          onClick={onOpenNewDriver}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Driver Profile</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by driver name, license number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-slate-900">All Driver Statuses</option>
              <option value="On Duty" className="bg-slate-900">On Duty (Available)</option>
              <option value="On Trip" className="bg-slate-900">On Trip</option>
              <option value="Off Duty" className="bg-slate-900">Off Duty</option>
              <option value="Suspended" className="bg-slate-900">Suspended / Expired</option>
            </select>
          </div>
        </div>

      </div>

      {/* Drivers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
            No driver records found matching your filters.
          </div>
        ) : (
          filteredDrivers.map((driver) => {
            const expired = isLicenseExpired(driver.licenseExpiryDate);

            return (
              <div 
                key={driver.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all shadow-xl space-y-4 text-xs flex flex-col justify-between ${
                  expired ? 'border-rose-700/60 ring-1 ring-rose-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">
                          {driver.name}
                        </h3>
                        <div className="font-mono text-[11px] text-purple-300 font-bold">
                          {driver.licenseNumber}
                        </div>
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(driver)}
                    </div>
                  </div>

                  {/* License Expiration Notice if expired */}
                  {expired && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-[11px] flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Commercial license expired on {driver.licenseExpiryDate}. Dispatches auto-locked.</span>
                    </div>
                  )}

                  {/* Endorsements & Safety Score */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        <span>Safety Score</span>
                      </div>
                      <div className="font-bold text-white font-mono flex items-baseline space-x-1">
                        <span className={`text-base ${driver.safetyScore >= 90 ? 'text-emerald-400' : driver.safetyScore >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {driver.safetyScore}
                        </span>
                        <span className="text-[10px] text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span>License Expiry</span>
                      </div>
                      <div className={`font-bold font-mono ${expired ? 'text-rose-400' : 'text-slate-200'}`}>
                        {driver.licenseExpiryDate}
                      </div>
                    </div>
                  </div>

                  {/* Endorsed Classes */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      Qualified Asset Endorsements:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {driver.licenseCategories.map((cat) => (
                        <span 
                          key={cat}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-semibold"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{driver.email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{driver.phone}</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditDriver(driver)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove driver ${driver.name} from records?`)) {
                          onDeleteDriver(driver.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition-colors"
                      title="Delete Driver"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Toggle Status */}
                  <div className="flex items-center space-x-1">
                    {driver.status === 'On Duty' && (
                      <button
                        onClick={() => onToggleStatus(driver.id, 'Off Duty')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors"
                      >
                        Set Off Duty
                      </button>
                    )}
                    {driver.status === 'Off Duty' && (
                      <button
                        onClick={() => onToggleStatus(driver.id, 'On Duty')}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold transition-colors"
                      >
                        Set On Duty
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
