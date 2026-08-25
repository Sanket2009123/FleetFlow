import React, { useState, useEffect } from 'react';
import { X, Send, AlertTriangle, CheckCircle2, Weight, Truck, User } from 'lucide-react';
import { Vehicle, Driver, Trip } from '../../types';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  onSaveTrip: (tripData: any) => void;
}

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  drivers,
  onSaveTrip
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoWeightKg, setCargoWeightKg] = useState<number>(500);
  const [distanceKm, setDistanceKm] = useState<number>(120);
  const [revenue, setRevenue] = useState<number>(650);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter available vehicles: Only 'Available' status
  const availableVehicles = vehicles.filter(v => v.status === 'Available');

  // Filter valid drivers: Status 'On Duty' AND unexpired license
  const availableDrivers = drivers.filter(d => {
    const isNotExpired = new Date(d.licenseExpiryDate).getTime() > new Date().getTime();
    return d.status === 'On Duty' && isNotExpired;
  });

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const selectedDriver = drivers.find(d => d.id === driverId);

  // Check cargo weight vs vehicle capacity
  const isOverweight = selectedVehicle ? cargoWeightKg > selectedVehicle.maxLoadCapacityKg : false;

  useEffect(() => {
    if (isOpen) {
      if (availableVehicles.length > 0 && !vehicleId) {
        setVehicleId(availableVehicles[0].id);
      }
      if (availableDrivers.length > 0 && !driverId) {
        setDriverId(availableDrivers[0].id);
      }
      setOrigin('Seattle Regional Distribution Center, Bay 4');
      setDestination('Portland Gateway Hub');
      setCargoDescription('Commercial Electronics & Palletized Freight');
      setCargoWeightKg(800);
      setDistanceKm(280);
      setRevenue(1250);
      setNotes('Priority customer delivery with proof-of-delivery signature required.');
      setError(null);
    }
  }, [isOpen, vehicles, drivers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, isDirectDispatch = false) => {
    e.preventDefault();
    if (!vehicleId) {
      setError('Please select an available vehicle.');
      return;
    }
    if (!driverId) {
      setError('Please select an authorized on-duty driver.');
      return;
    }
    if (!origin.trim() || !destination.trim()) {
      setError('Origin and destination are required.');
      return;
    }
    if (isOverweight) {
      setError(`Overweight Cargo Violation: Cargo is ${cargoWeightKg.toLocaleString()} kg, which exceeds vehicle limit of ${selectedVehicle?.maxLoadCapacityKg.toLocaleString()} kg.`);
      return;
    }

    const tripCode = `TRP-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    onSaveTrip({
      tripCode,
      vehicleId,
      vehicleName: selectedVehicle?.name || 'Asset',
      vehiclePlate: selectedVehicle?.licensePlate || 'N/A',
      driverId,
      driverName: selectedDriver?.name || 'Driver',
      origin: origin.trim(),
      destination: destination.trim(),
      cargoDescription: cargoDescription.trim() || 'General Freight',
      cargoWeightKg: Number(cargoWeightKg),
      maxCapacityKg: selectedVehicle?.maxLoadCapacityKg || 2000,
      startOdometerKm: selectedVehicle?.currentOdometerKm || 0,
      distanceKm: Number(distanceKm),
      revenue: Number(revenue),
      notes: notes.trim(),
      status: isDirectDispatch ? 'Dispatched' : 'Draft',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Send className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Create Freight Dispatch Order</h2>
              <p className="text-xs text-slate-400">Validate payload capacity &amp; lock vehicle/driver to On Trip</p>
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
        <form className="p-5 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Overweight Warning Badge */}
          {isOverweight && selectedVehicle && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 flex items-start space-x-2.5 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-white">Rule 2 Violation - Overweight Cargo:</strong>
                <p className="mt-0.5 text-[11px]">
                  Specified cargo weight of <span className="font-bold underline">{cargoWeightKg.toLocaleString()} kg</span> exceeds this vehicle&apos;s certified limit of <span className="font-bold">{selectedVehicle.maxLoadCapacityKg.toLocaleString()} kg</span> ({selectedVehicle.licensePlate}). Dispatching is blocked.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Vehicle Selector */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>Select Available Asset *</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {availableVehicles.length} available
                </span>
              </label>
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              >
                {availableVehicles.length === 0 ? (
                  <option value="">No available vehicles in fleet</option>
                ) : (
                  availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} - {v.name} (Max {v.maxLoadCapacityKg.toLocaleString()} kg)
                    </option>
                  ))
                )}
              </select>
              {selectedVehicle && (
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Class: {selectedVehicle.type}</span>
                  <span className="font-mono text-emerald-400">Cap: {selectedVehicle.maxLoadCapacityKg.toLocaleString()} kg</span>
                </div>
              )}
            </div>

            {/* Driver Selector */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>Select Certified Driver *</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {availableDrivers.length} on duty
                </span>
              </label>
              <select
                required
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              >
                {availableDrivers.length === 0 ? (
                  <option value="">No on-duty drivers with valid license</option>
                ) : (
                  availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Score: {d.safetyScore} | Expiry: {d.licenseExpiryDate})
                    </option>
                  ))
                )}
              </select>
              {selectedDriver && (
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Endorsed: {selectedDriver.licenseCategories.join(', ')}</span>
                  <span className="text-emerald-400">Score: {selectedDriver.safetyScore}%</span>
                </div>
              )}
            </div>

            {/* Origin */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Origin Pickup Hub *</label>
              <input
                type="text"
                required
                placeholder="e.g. Seattle Regional Logistics Depot"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Destination Drop-Off *</label>
              <input
                type="text"
                required
                placeholder="e.g. Spokane Fulfillment Center"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Cargo Description */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Cargo Description</label>
              <input
                type="text"
                placeholder="e.g. High-value refrigerated pharmaceuticals"
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Cargo Weight */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>Cargo Weight (kg) *</span>
                {selectedVehicle && (
                  <span className="text-[10px] text-slate-400">
                    Max: {selectedVehicle.maxLoadCapacityKg.toLocaleString()} kg
                  </span>
                )}
              </label>
              <input
                type="number"
                required
                min="1"
                value={cargoWeightKg}
                onChange={(e) => setCargoWeightKg(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-white font-mono focus:outline-none ${
                  isOverweight ? 'border-rose-500 text-rose-200' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
            </div>

            {/* Distance (km) */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Route Distance (km)</label>
              <input
                type="number"
                min="1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Expected Revenue ($) */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Expected Freight Revenue ($)</label>
              <input
                type="number"
                min="0"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Dispatch Route Notes / Manifest Instructions</label>
            <textarea
              rows={2}
              placeholder="Special handling instructions, gate codes, or temperature thresholds..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isOverweight || !vehicleId || !driverId}
              onClick={(e) => handleSubmit(e, false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isOverweight || !vehicleId || !driverId}
              onClick={(e) => handleSubmit(e, true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Immediately</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
