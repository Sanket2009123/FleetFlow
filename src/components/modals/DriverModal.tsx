import React, { useState, useEffect } from 'react';
import { X, User, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Driver, VehicleType, DriverStatus } from '../../types';

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  onSaveDriver: (data: Partial<Driver>) => void;
}

export const DriverModal: React.FC<DriverModalProps> = ({
  isOpen,
  onClose,
  driver,
  onSaveDriver
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategories, setLicenseCategories] = useState<VehicleType[]>(['Truck', 'Van']);
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('2027-12-31');
  const [safetyScore, setSafetyScore] = useState<number>(95);
  const [status, setStatus] = useState<DriverStatus>('On Duty');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (driver) {
      setName(driver.name);
      setEmail(driver.email);
      setPhone(driver.phone);
      setLicenseNumber(driver.licenseNumber);
      setLicenseCategories(driver.licenseCategories);
      setLicenseExpiryDate(driver.licenseExpiryDate);
      setSafetyScore(driver.safetyScore);
      setStatus(driver.status);
      setNotes(driver.notes || '');
    } else {
      setName('');
      setEmail('');
      setPhone('+1 (555) 000-0000');
      setLicenseNumber('');
      setLicenseCategories(['Truck', 'Van']);
      setLicenseExpiryDate('2027-12-31');
      setSafetyScore(95);
      setStatus('On Duty');
      setNotes('');
    }
    setError(null);
  }, [driver, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (cat: VehicleType) => {
    if (licenseCategories.includes(cat)) {
      if (licenseCategories.length > 1) {
        setLicenseCategories(licenseCategories.filter(c => c !== cat));
      }
    } else {
      setLicenseCategories([...licenseCategories, cat]);
    }
  };

  const isExpired = new Date(licenseExpiryDate).getTime() < new Date().getTime();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !licenseNumber.trim()) {
      setError('Driver full name and license number are required.');
      return;
    }

    onSaveDriver({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@fleetflow.io`,
      phone: phone.trim(),
      licenseNumber: licenseNumber.trim().toUpperCase(),
      licenseCategories,
      licenseExpiryDate,
      safetyScore: Number(safetyScore),
      status: isExpired ? 'Suspended' : status,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <User className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                {driver ? 'Edit Driver Profile' : 'Register Commercial Driver'}
              </h2>
              <p className="text-xs text-slate-400">CDL license validation and asset class qualifications</p>
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

          {isExpired && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 flex items-center space-x-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Compliance Warning:</strong> The chosen expiration date ({licenseExpiryDate}) is in the past. Driver will be marked as Suspended and blocked from dispatches.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Driver Name */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Carlos Hernandez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* License Number */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Commercial License # (CDL) *</label>
              <input
                type="text"
                required
                placeholder="e.g. CDL-WA-992144"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Email Address</label>
              <input
                type="email"
                placeholder="carlos.h@fleetflow.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 234-9912"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">License Expiration Date *</label>
              <input
                type="date"
                required
                value={licenseExpiryDate}
                onChange={(e) => setLicenseExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Safety Score */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>Safety Compliance Score (0-100)</span>
                <span className="font-mono text-emerald-400 font-bold">{safetyScore}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={safetyScore}
                onChange={(e) => setSafetyScore(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

          </div>

          {/* Qualified Vehicle Categories */}
          <div className="space-y-1.5 pt-2">
            <label className="text-slate-300 font-semibold">Endorsed Vehicle Classes *</label>
            <div className="flex flex-wrap gap-2">
              {(['Truck', 'Van', 'Bike', 'Car', 'Trailer'] as VehicleType[]).map((cat) => {
                const isSelected = licenseCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Driver Notes */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Driver Record &amp; Medical Cert Notes</label>
            <textarea
              rows={2}
              placeholder="Hazmat certifications, interstate credentials, clean record..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
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
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950"
            >
              <Save className="w-4 h-4" />
              <span>{driver ? 'Save Changes' : 'Register Driver'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
