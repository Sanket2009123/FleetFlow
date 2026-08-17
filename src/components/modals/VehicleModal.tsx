import React, { useState, useEffect } from 'react';
import { X, Truck, Save, AlertCircle } from 'lucide-react';
import { Vehicle, VehicleType, FuelType } from '../../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSaveVehicle: (vehicleData: Partial<Vehicle>) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSaveVehicle
}) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [licensePlate, setLicensePlate] = useState('');
  const [type, setType] = useState<VehicleType>('Van');
  const [fuelType, setFuelType] = useState<FuelType>('Diesel');
  const [maxLoadCapacityKg, setMaxLoadCapacityKg] = useState<number>(2000);
  const [currentOdometerKm, setCurrentOdometerKm] = useState<number>(0);
  const [acquisitionCost, setAcquisitionCost] = useState<number>(55000);
  const [region, setRegion] = useState('Central Hub');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle) {
      setName(vehicle.name);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setLicensePlate(vehicle.licensePlate);
      setType(vehicle.type);
      setFuelType(vehicle.fuelType);
      setMaxLoadCapacityKg(vehicle.maxLoadCapacityKg);
      setCurrentOdometerKm(vehicle.currentOdometerKm);
      setAcquisitionCost(vehicle.acquisitionCost);
      setRegion(vehicle.region);
    } else {
      setName('');
      setModel('');
      setYear(2024);
      setLicensePlate('');
      setType('Van');
      setFuelType('Diesel');
      setMaxLoadCapacityKg(2000);
      setCurrentOdometerKm(0);
      setAcquisitionCost(55000);
      setRegion('Central Hub');
    }
    setError(null);
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      setError('License plate is required.');
      return;
    }
    if (maxLoadCapacityKg <= 0) {
      setError('Max load capacity must be greater than 0 kg.');
      return;
    }

    onSaveVehicle({
      name: name.trim() || `${model || 'Fleet'} Asset`,
      model: model.trim() || 'Commercial Carrier',
      year: Number(year),
      licensePlate: licensePlate.trim().toUpperCase(),
      type,
      fuelType,
      maxLoadCapacityKg: Number(maxLoadCapacityKg),
      currentOdometerKm: Number(currentOdometerKm),
      acquisitionCost: Number(acquisitionCost),
      region
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Truck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                {vehicle ? 'Edit Fleet Asset' : 'Intake New Fleet Asset'}
              </h2>
              <p className="text-xs text-slate-400">
                {vehicle ? 'Update vehicle specs and capacity limits' : 'Initial registration sets status automatically to Available'}
              </p>
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
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* License Plate */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">License Plate * (Unique)</label>
              <input
                type="text"
                required
                placeholder="e.g. TRK-8821-WA"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Asset Name */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Asset Name / Title</label>
              <input
                type="text"
                placeholder="e.g. Freightliner Cascadia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Model */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Make &amp; Model</label>
              <input
                type="text"
                placeholder="e.g. Transit 350 High Roof"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Model Year</label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Vehicle Type */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Vehicle Class</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VehicleType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Truck">Heavy Haul Truck (Class 8)</option>
                <option value="Van">Delivery Van</option>
                <option value="Bike">Cargo E-Bike</option>
                <option value="Car">Sedan / Courier Car</option>
                <option value="Trailer">Freight Trailer</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Powertrain / Fuel</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol / Gasoline</option>
                <option value="Electric">100% Electric (EV)</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">Compressed Natural Gas (CNG)</option>
              </select>
            </div>

            {/* Max Load Capacity */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Max Load Capacity (kg) *</label>
              <input
                type="number"
                required
                min="50"
                step="50"
                value={maxLoadCapacityKg}
                onChange={(e) => setMaxLoadCapacityKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">Enforced strictly at trip dispatch to prevent overweight cargo.</p>
            </div>

            {/* Current Odometer */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Current Odometer (km)</label>
              <input
                type="number"
                min="0"
                value={currentOdometerKm}
                onChange={(e) => setCurrentOdometerKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Acquisition Cost */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Acquisition Capital ($)</label>
              <input
                type="number"
                min="100"
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">Used in ROI denominator formula calculation.</p>
            </div>

            {/* Region / Hub */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Assigned Region / Hub</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Central Hub">Central Logistics Hub</option>
                <option value="North Hub">North Regional Depot</option>
                <option value="South Hub">South Metro Terminal</option>
                <option value="East Hub">East Coast Facility</option>
                <option value="West Hub">West Coast Distribution Center</option>
              </select>
            </div>

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
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950"
            >
              <Save className="w-4 h-4" />
              <span>{vehicle ? 'Save Changes' : 'Register Vehicle'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
