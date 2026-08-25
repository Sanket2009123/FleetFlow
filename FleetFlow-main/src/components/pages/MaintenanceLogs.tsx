import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Trash2, 
  DollarSign, 
  Gauge, 
  Building2, 
  UserCheck
} from 'lucide-react';
import { MaintenanceLog, MaintenancePriority, MaintenanceStatus } from '../../types';

interface MaintenanceLogsProps {
  logs: MaintenanceLog[];
  onOpenNewMaintenance: () => void;
  onCompleteMaintenance: (id: string) => void;
  onDeleteMaintenance: (id: string) => void;
}

export const MaintenanceLogs: React.FC<MaintenanceLogsProps> = ({
  logs,
  onOpenNewMaintenance,
  onCompleteMaintenance,
  onDeleteMaintenance
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchSearch = 
        l.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || l.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [logs, searchTerm, statusFilter, priorityFilter]);

  const totalMaintenanceCost = useMemo(() => {
    return logs.reduce((sum, l) => sum + l.cost, 0);
  }, [logs]);

  const inShopCount = useMemo(() => {
    return logs.filter(l => l.status === 'In Progress').length;
  }, [logs]);

  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Critical</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">Low</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Maintenance Logs &amp; Shop Telemetry</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {inShopCount} Active in Shop
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated asset isolation, repair work orders, shop invoice reconciliation, and preventive maintenance.
          </p>
        </div>

        <button
          onClick={onOpenNewMaintenance}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Service / Work Order</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Maintenance Spend</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            ${totalMaintenanceCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all completed &amp; active logs</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Vehicles In Shop</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {inShopCount} <span className="text-xs text-slate-400 font-normal">assets offline</span>
          </div>
          <div className="text-[11px] text-amber-300 mt-0.5">Excluded from Dispatcher dropdown</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Work Orders</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {logs.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            {logs.filter(l => l.status === 'Completed').length} resolved successfully
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by license plate, service provider, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
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
              <option value="All" className="bg-slate-900">All Statuses</option>
              <option value="In Progress" className="bg-slate-900">In Progress</option>
              <option value="Completed" className="bg-slate-900">Completed</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-slate-900">All Priorities</option>
              <option value="Critical" className="bg-slate-900">Critical</option>
              <option value="High" className="bg-slate-900">High</option>
              <option value="Medium" className="bg-slate-900">Medium</option>
              <option value="Low" className="bg-slate-900">Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Logs Table / Cards */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
            No maintenance records found.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
                    {log.vehiclePlate}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {log.serviceType} &bull; <span className="text-slate-400 font-normal">{log.vehicleName}</span>
                    </h3>
                    <div className="text-[11px] text-slate-400">Date: {log.serviceDate}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getPriorityBadge(log.priority)}
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold text-xs border ${
                    log.status === 'Completed'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {log.status === 'Completed' ? 'Completed & Released' : 'In Shop (Offline)'}
                  </span>
                </div>
              </div>

              {/* Description & Details */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
                <p className="text-slate-300 text-xs leading-relaxed">
                  {log.description || 'Routine preventive maintenance inspection & parts replacement.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vendor: <strong className="text-slate-200">{log.serviceProvider}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tech: <strong className="text-slate-200">{log.performedBy}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span>Odometer: <strong className="text-slate-200">{log.odometerAtService.toLocaleString()} km</strong></span>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400">Cost:</span>
                  <span className="text-base font-mono font-extrabold text-amber-400">
                    ${log.cost.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {log.status === 'In Progress' && (
                    <button
                      onClick={() => onCompleteMaintenance(log.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete &amp; Return to Fleet</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete maintenance record for ${log.vehiclePlate}?`)) {
                        onDeleteMaintenance(log.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
