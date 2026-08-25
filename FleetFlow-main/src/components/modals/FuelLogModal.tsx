import React, { useState, useEffect } from 'react';
import { X, Fuel, Save, DollarSign } from 'lucide-react';
import { Vehicle, ExpenseCategory } from '../../types';

interface FuelLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onSaveExpense: (data: any) => void;
}

export const FuelLogModal: React.FC<FuelLogModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSaveExpense
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Fuel');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(120);
  const [liters, setLiters] = useState<number>(75);
  const [vendor, setVendor] = useState('Shell Commercial Fleet Services');
  const [odometerKm, setOdometerKm] = useState<number>(0);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  useEffect(() => {
    if (isOpen && vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
      setOdometerKm(vehicles[0].currentOdometerKm);
      setReceiptNumber(`REC-${Math.floor(10000 + Math.random() * 90000)}`);
    }
  }, [isOpen, vehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      setOdometerKm(selectedVehicle.currentOdometerKm);
    }
  }, [vehicleId, selectedVehicle]);

  if (!isOpen) return null;

  const costPerLiter = (liters > 0 && amount > 0) ? Number((amount / liters).toFixed(3)) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;

    onSaveExpense({
      vehicleId,
      vehiclePlate: selectedVehicle?.licensePlate || 'N/A',
      category,
      date,
      amount: Number(amount),
      liters: category === 'Fuel' ? Number(liters) : undefined,
      costPerLiter: category === 'Fuel' ? costPerLiter : undefined,
      odometerKm: Number(odometerKm),
      vendor: vendor.trim() || 'Fleet Vendor',
      receiptNumber: receiptNumber.trim(),
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Fuel className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-white">Record Operating Expense / Fuel Fill</h2>
              <p className="text-xs text-slate-400">Track fuel efficiency, tolls, and operating cost per km</p>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Vehicle Selection */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Select Vehicle *</label>
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} &bull; {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Fuel">Fuel (Diesel / Petrol / EV)</option>
                <option value="Toll">Highway &amp; Bridge Tolls</option>
                <option value="Maintenance">Shop Maintenance / Parts</option>
                <option value="Insurance">Insurance &amp; Licensing</option>
                <option value="Other">Other Operational</option>
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Transaction Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Total Amount ($) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* If Fuel: Volume Liters */}
            {category === 'Fuel' ? (
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Fuel Volume (Liters)</span>
                  {costPerLiter && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ${costPerLiter}/L
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={liters}
                  onChange={(e) => setLiters(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Receipt / Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. REC-88910"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Vendor */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Vendor / Merchant Station</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Odometer */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Vehicle Odometer (km)</label>
              <input
                type="number"
                min="0"
                value={odometerKm}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Receipt Notes</label>
            <input
              type="text"
              placeholder="e.g. Full premium diesel tank fill before interstate trip"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
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
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-950"
            >
              <Save className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
