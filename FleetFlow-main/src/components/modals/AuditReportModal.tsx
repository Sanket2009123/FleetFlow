import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { Vehicle, Driver, Trip, MaintenanceLog, ExpenseLog } from '../../types';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  expenses: ExpenseLog[];
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  drivers,
  trips,
  maintenanceLogs,
  expenses
}) => {
  const [reportType, setReportType] = useState<'Full' | 'Compliance' | 'Financial'>('Full');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const totalRevenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
  const totalExpenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperationalROI = totalRevenue - (totalMaintenanceCost + totalExpenseCost);

  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'Full' || reportType === 'Compliance') {
      csvContent += '=== VEHICLES INVENTORY ===\n';
      csvContent += 'License Plate,Name,Type,Fuel Type,Capacity (kg),Odometer (km),Acquisition Cost,Status,Region\n';
      vehicles.forEach(v => {
        csvContent += `"${v.licensePlate}","${v.name}","${v.type}","${v.fuelType}",${v.maxLoadCapacityKg},${v.currentOdometerKm},${v.acquisitionCost},"${v.status}","${v.region}"\n`;
      });

      csvContent += '\n=== DRIVER COMPLIANCE ===\n';
      csvContent += 'Name,License Number,Expiry Date,Safety Score,Status,Categories\n';
      drivers.forEach(d => {
        csvContent += `"${d.name}","${d.licenseNumber}","${d.licenseExpiryDate}",${d.safetyScore},"${d.status}","${d.licenseCategories.join('|')}"\n`;
      });
    }

    if (reportType === 'Full' || reportType === 'Financial') {
      csvContent += '\n=== TRIP RECONCILIATION ===\n';
      csvContent += 'Trip Code,Plate,Driver,Origin,Destination,Cargo Weight (kg),Distance (km),Revenue,Status\n';
      trips.forEach(t => {
        csvContent += `"${t.tripCode}","${t.vehiclePlate}","${t.driverName}","${t.origin}","${t.destination}",${t.cargoWeightKg},${t.distanceKm},${t.revenue || 0},"${t.status}"\n`;
      });

      csvContent += '\n=== EXPENSE & FUEL AUDIT ===\n';
      csvContent += 'Date,Plate,Category,Amount,Liters,CostPerLiter,Vendor,Receipt\n';
      expenses.forEach(e => {
        csvContent += `"${e.date}","${e.vehiclePlate}","${e.category}",${e.amount},${e.liters || 0},${e.costPerLiter || 0},"${e.vendor}","${e.receiptNumber || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fleetflow_audit_report_${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Generate Executive Fleet Audit Report</h2>
              <p className="text-xs text-slate-400">Export regulatory compliance dossiers and financial P&amp;L records</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Report Type Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Report Audit Scope</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReportType('Full')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  reportType === 'Full'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Comprehensive Master Audit
              </button>
              <button
                type="button"
                onClick={() => setReportType('Compliance')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  reportType === 'Compliance'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 ring-1 ring-blue-500/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                DOT Safety &amp; Licenses
              </button>
              <button
                type="button"
                onClick={() => setReportType('Financial')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  reportType === 'Financial'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-1 ring-purple-500/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Financial &amp; Fuel ROI
              </button>
            </div>
          </div>

          {/* Audit Metrics Snapshot */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="text-slate-300 font-semibold text-xs border-b border-slate-850 pb-2">
              Live Audit Manifest Summary ({new Date().toLocaleDateString()})
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-850">
                <div className="text-slate-400 text-[10px]">Active Vehicles</div>
                <div className="font-bold text-white font-mono text-sm">{vehicles.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-850">
                <div className="text-slate-400 text-[10px]">Drivers</div>
                <div className="font-bold text-white font-mono text-sm">{drivers.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-850">
                <div className="text-slate-400 text-[10px]">Trips Logged</div>
                <div className="font-bold text-white font-mono text-sm">{trips.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-850">
                <div className="text-slate-400 text-[10px]">Net Fleet P&amp;L</div>
                <div className="font-bold text-emerald-400 font-mono text-sm">${netOperationalROI.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Close
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950 transition-all"
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Downloaded Successfully</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download CSV Audit File</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
