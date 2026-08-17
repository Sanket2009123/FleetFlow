import React, { useState, useEffect } from 'react';
import { X, Wrench, Save, AlertTriangle } from 'lucide-react';
import { Vehicle, MaintenancePriority } from '../../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onSaveMaintenance: (data: any) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSaveMaintenance
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('Oil Change & Comprehensive Inspection');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState<number>(450);
  const [serviceProvider, setServiceProvider] = useState('Pacific Northwest Heavy Fleet Service');
  const [odometerAtService, setOdometerAtService] = useState<number>(0);
  const [priority, setPriority] = useState<MaintenancePriority>('Medium');
  const [description, setDescription] = useState('');
  const [performedBy, setPerformedBy] = useState('Lead Mechanic Dave Miller');
  const [error, setError] = useState<string | null>(null);

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  useEffect(() => {
    if (isOpen) {
      if (vehicles.length > 0 && !vehicleId) {
        setVehicleId(vehicles[0].id);
        setOdometerAtService(vehicles[0].currentOdometerKm);
      }
      setServiceType('Brake Pads & Rotor Resurfacing');
      setCost(650);
      setDescription('Front axle ceramic brake pad installation, rotor resurfacing, brake line pressure test.');
      setError(null);
    }
  }, [isOpen, vehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      setOdometerAtService(selectedVehicle.currentOdometerKm);
    }
  }, [vehicleId, selectedVehicle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setError('Please select a vehicle to service.');
      return;
    }
    if (cost < 0) {
      setError('Service cost cannot be negative.');
      return;
    }

    onSaveMaintenance({
      vehicleId,
      vehicleName: selectedVehicle?.name || 'Asset',
      vehiclePlate: selectedVehicle?.licensePlate || 'N/A',
      serviceType,
      serviceDate,
      cost: Number(cost),
      serviceProvider: serviceProvider.trim() || 'Internal Fleet Shop',
      odometerAtService: Number(odometerAtService),
      priority,
      description: description.trim(),
      performedBy: performedBy.trim() || 'Shop Technician',
      status: 'In Progress',
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Wrench className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Log Vehicle Service / Work Order</h2>
              <p className="text-xs text-slate-400">Rule 5: Submitting automatically sets vehicle to &apos;In Shop&apos;</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Rule 5 Notice */}
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 flex items-start space-x-2.5">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <strong>Fleet Isolation Rule:</strong> Creating this work order will immediately switch the selected vehicle&apos;s status to <strong>&apos;In Shop&apos;</strong>, removing it from the Trip Dispatcher pool until marked complete.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Vehicle */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Select Fleet Vehicle *</label>
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} &bull; {v.name} ({v.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Service Operation *</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Brake Replacement">Brake Replacement</option>
                <option value="Oil Change">Oil Change &amp; Filter</option>
                <option value="Tire Replacement">Tire Replacement &amp; Alignment</option>
                <option value="Transmission Service">Transmission Flush &amp; Fluid</option>
                <option value="Electrical Inspection">Electrical &amp; ECU Diagnostics</option>
                <option value="Engine Overhaul">Engine Overhaul &amp; Calibration</option>
                <option value="DOT Safety Inspection">Annual DOT Safety Inspection</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Severity / Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Critical">Critical (Immediate Grounding)</option>
                <option value="High">High (Impending Failure)</option>
                <option value="Medium">Medium (Routine Scheduled)</option>
                <option value="Low">Low (Preventive Inspection)</option>
              </select>
            </div>

            {/* Cost */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Service Cost ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Service Date */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Service Date</label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Service Provider */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Repair Shop / Vendor</label>
              <input
                type="text"
                value={serviceProvider}
                onChange={(e) => setServiceProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Performed By */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Lead Mechanic / Tech</label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Odometer at Service */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Odometer at Time of Service (km)</label>
              <input
                type="number"
                min="0"
                value={odometerAtService}
                onChange={(e) => setOdometerAtService(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Detailed Service Work Scope</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-950"
            >
              <Save className="w-4 h-4" />
              <span>Submit Work Order &amp; Lock Vehicle</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
