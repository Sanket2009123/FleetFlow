import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Gauge, 
  Fuel, 
  Weight, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Wrench,
  Clock,
  Shield,
  Layers
} from 'lucide-react';
import { Vehicle, VehicleType, VehicleStatus, FuelType } from '../../types';

interface VehicleRegistryProps {
  vehicles: Vehicle[];
  onOpenNewVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onToggleStatus: (id: string, status: VehicleStatus) => void;
}

export const VehicleRegistry: React.FC<VehicleRegistryProps> = ({
  vehicles,
  onOpenNewVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onToggleStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch = 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = typeFilter === 'All' || v.type === typeFilter;
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [vehicles, searchTerm, typeFilter, statusFilter]);

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Available</span>
          </span>
        );
      case 'On Trip':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Truck className="w-3 h-3" />
            <span>On Trip</span>
          </span>
        );
      case 'In Shop':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Wrench className="w-3 h-3" />
            <span>In Shop</span>
          </span>
        );
      case 'Retired':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
            <AlertCircle className="w-3 h-3" />
            <span>Retired</span>
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
            <span>Vehicle Registry &amp; Fleet Inventory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {vehicles.length} Total Units
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete vehicle records, payload ratings, initial intake lifecycle, and operating statuses.
          </p>
        </div>

        <button
          onClick={onOpenNewVehicle}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Intake New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by license plate (e.g. TRK-8821), model, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Type & Status Selects */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-slate-900">All Vehicle Types</option>
              <option value="Truck" className="bg-slate-900">Heavy Haul Truck</option>
              <option value="Van" className="bg-slate-900">Delivery Van</option>
              <option value="Bike" className="bg-slate-900">Cargo E-Bike</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-slate-900">All Statuses</option>
              <option value="Available" className="bg-slate-900">Available</option>
              <option value="On Trip" className="bg-slate-900">On Trip</option>
              <option value="In Shop" className="bg-slate-900">In Shop</option>
              <option value="Retired" className="bg-slate-900">Retired</option>
            </select>
          </div>
        </div>

      </div>

      {/* Vehicles Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
            No vehicle records found matching your filters.
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div 
              key={vehicle.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4 text-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Top Header & License Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-extrabold text-sm px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 inline-block">
                      {vehicle.licensePlate}
                    </span>
                    <h3 className="font-bold text-white text-base mt-1.5 leading-snug">
                      {vehicle.name}
                    </h3>
                    <p className="text-slate-400 text-[11px]">{vehicle.model} &bull; {vehicle.year}</p>
                  </div>
                  <div>
                    {getStatusBadge(vehicle.status)}
                  </div>
                </div>

                {/* Specs Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-0.5">
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Weight className="w-3 h-3 text-emerald-400" />
                      <span>Max Payload</span>
                    </div>
                    <div className="font-bold text-white font-mono">
                      {vehicle.maxLoadCapacityKg.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">kg</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-0.5">
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Gauge className="w-3 h-3 text-blue-400" />
                      <span>Odometer</span>
                    </div>
                    <div className="font-bold text-white font-mono">
                      {vehicle.currentOdometerKm.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">km</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-0.5">
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Fuel className="w-3 h-3 text-amber-400" />
                      <span>Fuel / Powertrain</span>
                    </div>
                    <div className="font-bold text-white">
                      {vehicle.fuelType} ({vehicle.type})
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-0.5">
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-purple-400" />
                      <span>Acquisition</span>
                    </div>
                    <div className="font-bold text-white font-mono">
                      ${vehicle.acquisitionCost.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Hub: <strong className="text-slate-300">{vehicle.region}</strong></span>
                  {vehicle.lastServiceDate && (
                    <span>Last service: {vehicle.lastServiceDate}</span>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEditVehicle(vehicle)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit Vehicle Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove vehicle ${vehicle.licensePlate} (${vehicle.name}) from the fleet?`)) {
                        onDeleteVehicle(vehicle.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition-colors"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Status Toggle */}
                <div className="flex items-center space-x-1">
                  {vehicle.status !== 'In Shop' && (
                    <button
                      onClick={() => onToggleStatus(vehicle.id, 'In Shop')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold transition-colors"
                    >
                      Set In Shop
                    </button>
                  )}
                  {vehicle.status === 'In Shop' && (
                    <button
                      onClick={() => onToggleStatus(vehicle.id, 'Available')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold transition-colors"
                    >
                      Mark Available
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
