import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Gauge, DollarSign, AlertCircle } from 'lucide-react';
import { Trip } from '../../types';

interface CompleteTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  onComplete: (tripId: string, finalOdometerKm: number, revenue?: number, notes?: string) => void;
}

export const CompleteTripModal: React.FC<CompleteTripModalProps> = ({
  isOpen,
  onClose,
  trip,
  onComplete
}) => {
  const [finalOdometerKm, setFinalOdometerKm] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trip) {
      const estimatedEnd = trip.startOdometerKm + (trip.distanceKm || 100);
      setFinalOdometerKm(estimatedEnd);
      setRevenue(trip.revenue || 0);
      setNotes(trip.notes || 'Trip completed on schedule without freight discrepancies.');
      setError(null);
    }
  }, [trip, isOpen]);

  if (!isOpen || !trip) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalOdometerKm < trip.startOdometerKm) {
      setError(`Final odometer (${finalOdometerKm.toLocaleString()} km) cannot be less than trip start odometer (${trip.startOdometerKm.toLocaleString()} km).`);
      return;
    }

    onComplete(trip.id, Number(finalOdometerKm), Number(revenue), notes.trim());
  };

  const actualDistance = finalOdometerKm - trip.startOdometerKm;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-white">Complete &amp; Reconcile Trip</h2>
              <p className="text-xs text-slate-400">Sync vehicle odometer &amp; release asset + driver to Available</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Trip Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400">{trip.tripCode}</span>
              <span className="text-slate-400">{trip.vehiclePlate} ({trip.driverName})</span>
            </div>
            <div className="font-medium text-white text-xs">
              {trip.origin} &rarr; {trip.destination}
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-850">
              <span>Start Odometer: <strong className="text-white font-mono">{trip.startOdometerKm.toLocaleString()} km</strong></span>
              <span>Planned: <strong className="text-white font-mono">{trip.distanceKm} km</strong></span>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            
            {/* Final Odometer */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>Final Odometer (km) *</span>
                <span className="text-[10px] text-slate-400">
                  Calculated Run: <strong className="text-emerald-400 font-mono">{actualDistance >= 0 ? actualDistance : 0} km</strong>
                </span>
              </label>
              <input
                type="number"
                required
                min={trip.startOdometerKm}
                value={finalOdometerKm}
                onChange={(e) => setFinalOdometerKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500">
                Rule 4: Updating this replaces vehicle&apos;s odometer to {finalOdometerKm.toLocaleString()} km.
              </p>
            </div>

            {/* Final Revenue */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Final Invoiced Freight Revenue ($)</label>
              <input
                type="number"
                min="0"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Delivery Notes */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Sign-off / Completion Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

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
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-950"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete &amp; Release Asset</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
