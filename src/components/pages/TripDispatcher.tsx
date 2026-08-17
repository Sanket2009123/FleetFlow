import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck, 
  User, 
  MapPin, 
  Weight, 
  Gauge, 
  DollarSign, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { Trip, TripStatus } from '../../types';

interface TripDispatcherProps {
  trips: Trip[];
  onOpenNewTrip: () => void;
  onDispatchTrip: (id: string) => void;
  onOpenCompleteModal: (trip: Trip) => void;
  onCancelTrip: (id: string) => void;
}

export const TripDispatcher: React.FC<TripDispatcherProps> = ({
  trips,
  onOpenNewTrip,
  onDispatchTrip,
  onOpenCompleteModal,
  onCancelTrip
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchSearch = 
        t.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [trips, searchTerm, statusFilter]);

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Clock className="w-3 h-3" />
            <span>Draft Cargo</span>
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Truck className="w-3 h-3" />
            <span>Dispatched / Active</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
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
            <span>Trip Dispatcher &amp; Route Logistics</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {trips.length} Total Trips
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch routes with strict cargo weight limits, driver validation, and post-trip odometer reconciliation.
          </p>
        </div>

        <button
          onClick={onOpenNewTrip}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Freight Dispatch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by trip code (e.g. TRP-2025), origin, destination, driver, or plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Status Select */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-slate-900">All Trip Statuses</option>
              <option value="Draft" className="bg-slate-900">Draft Cargo</option>
              <option value="Dispatched" className="bg-slate-900">Dispatched / In Transit</option>
              <option value="Completed" className="bg-slate-900">Completed Deliveries</option>
              <option value="Cancelled" className="bg-slate-900">Cancelled</option>
            </select>
          </div>
        </div>

      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
            No freight shipment trips found matching your query.
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <div 
              key={trip.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-extrabold text-sm px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
                    {trip.tripCode}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {trip.cargoDescription}
                    </h3>
                    <div className="text-[11px] text-slate-400">Created: {new Date(trip.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  {getStatusBadge(trip.status)}
                </div>
              </div>

              {/* Waypoint Routing Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Route */}
                <div className="md:col-span-2 p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div className="w-0.5 h-6 bg-slate-700 my-0.5" />
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    </div>
                    <div className="space-y-2.5 flex-1">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Origin Location</div>
                        <div className="text-white font-medium">{trip.origin}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Destination Drop-Off</div>
                        <div className="text-white font-medium">{trip.destination}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics Stats */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Weight className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cargo Weight:</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        {trip.cargoWeightKg.toLocaleString()} / {trip.maxCapacityKg.toLocaleString()} kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Gauge className="w-3.5 h-3.5 text-blue-400" />
                        <span>Distance:</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        {trip.distanceKm} km
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                        <span>Revenue:</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        ${trip.revenue?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>

                  {trip.endOdometerKm && (
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                      <span>End Odometer:</span>
                      <span className="font-mono font-bold text-slate-200">{trip.endOdometerKm.toLocaleString()} km</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Asset & Driver Badges + Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Asset: <strong className="text-white font-mono">{trip.vehiclePlate}</strong></span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Driver: <strong className="text-white">{trip.driverName}</strong></span>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  {trip.status === 'Draft' && (
                    <button
                      onClick={() => onDispatchTrip(trip.id)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-950 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Now</span>
                    </button>
                  )}

                  {trip.status === 'Dispatched' && (
                    <button
                      onClick={() => onOpenCompleteModal(trip)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-950 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete &amp; Reconcile</span>
                    </button>
                  )}

                  {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                    <button
                      onClick={() => {
                        if (confirm(`Cancel trip ${trip.tripCode}? Assigned vehicle & driver will be released.`)) {
                          onCancelTrip(trip.id);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs transition-colors"
                    >
                      Cancel Trip
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
