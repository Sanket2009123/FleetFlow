import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Fuel, 
  Wrench, 
  Truck, 
  Download, 
  ShieldCheck,
  Award,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Vehicle, Trip, MaintenanceLog, ExpenseLog } from '../../types';

interface AnalyticsReportsProps {
  vehicles: Vehicle[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  expenses: ExpenseLog[];
  onOpenAuditModal: () => void;
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({
  vehicles,
  trips,
  maintenanceLogs,
  expenses,
  onOpenAuditModal
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('All');

  // Calculate per-vehicle financial performance
  const vehicleStats = useMemo(() => {
    return vehicles.map(vehicle => {
      // Trips & Revenue
      const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'Completed');
      const tripRevenue = vehicleTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
      const totalKmTraveled = vehicleTrips.reduce((sum, t) => sum + t.distanceKm, 0);

      // Maintenance Costs
      const vehicleMaintenance = maintenanceLogs.filter(m => m.vehicleId === vehicle.id);
      const maintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0);

      // Fuel & Operating Expenses
      const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle.id);
      const fuelCost = vehicleExpenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
      const otherExpenses = vehicleExpenses.filter(e => e.category !== 'Fuel').reduce((sum, e) => sum + e.amount, 0);

      const operationalCost = maintenanceCost + fuelCost + otherExpenses;
      const netProfit = tripRevenue - operationalCost;

      // ROI = (Revenue - Operational Cost) / Acquisition Cost
      const roiPercentage = vehicle.acquisitionCost > 0 
        ? ((netProfit / vehicle.acquisitionCost) * 100).toFixed(2)
        : '0.00';

      const costPerKm = totalKmTraveled > 0 
        ? (operationalCost / totalKmTraveled).toFixed(2) 
        : '0.00';

      return {
        ...vehicle,
        tripCount: vehicleTrips.length,
        totalKmTraveled,
        tripRevenue,
        maintenanceCost,
        fuelCost,
        otherExpenses,
        operationalCost,
        netProfit,
        roiPercentage: parseFloat(roiPercentage),
        costPerKm: parseFloat(costPerKm)
      };
    });
  }, [vehicles, trips, maintenanceLogs, expenses]);

  // Aggregate Fleet Totals
  const totalFleetRevenue = useMemo(() => vehicleStats.reduce((sum, v) => sum + v.tripRevenue, 0), [vehicleStats]);
  const totalFleetMaintenance = useMemo(() => vehicleStats.reduce((sum, v) => sum + v.maintenanceCost, 0), [vehicleStats]);
  const totalFleetFuel = useMemo(() => vehicleStats.reduce((sum, v) => sum + v.fuelCost, 0), [vehicleStats]);
  const totalFleetOperationalCost = useMemo(() => vehicleStats.reduce((sum, v) => sum + v.operationalCost, 0), [vehicleStats]);
  const totalFleetCapital = useMemo(() => vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0), [vehicles]);
  const netFleetProfit = totalFleetRevenue - totalFleetOperationalCost;

  const fleetROI = totalFleetCapital > 0 
    ? ((netFleetProfit / totalFleetCapital) * 100).toFixed(2)
    : '0.00';

  const bestPerformingAsset = useMemo(() => {
    if (vehicleStats.length === 0) return null;
    return [...vehicleStats].sort((a, b) => b.roiPercentage - a.roiPercentage)[0];
  }, [vehicleStats]);

  const filteredStats = useMemo(() => {
    if (selectedVehicleId === 'All') return vehicleStats;
    return vehicleStats.filter(v => v.id === selectedVehicleId);
  }, [vehicleStats, selectedVehicleId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Audit Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Operational ROI &amp; Financial Analytics</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live P&amp;L Analysis
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time calculation of Operational Costs (Fuel + Maintenance), Net Profit margins, and Acquisition ROI.
          </p>
        </div>

        <button
          onClick={onOpenAuditModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-lg transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Master Audit Report</span>
        </button>
      </div>

      {/* 4 Financial Primary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Invoiced Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Freight Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            ${totalFleetRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1 pt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Completed cargo runs</span>
          </div>
        </div>

        {/* Total Operational Burn (Fuel + Maint) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Operational Costs</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
            ${totalFleetOperationalCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Fuel (${totalFleetFuel.toLocaleString()}) + Shop (${totalFleetMaintenance.toLocaleString()})
          </div>
        </div>

        {/* Net Profit Margin */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Net Operating Margin</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className={`text-3xl font-extrabold font-mono mt-1 ${netFleetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${netFleetProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            {totalFleetRevenue > 0 ? ((netFleetProfit / totalFleetRevenue) * 100).toFixed(1) : 0}% net operating margin
          </div>
        </div>

        {/* Fleet Amortized ROI */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Fleet Capital ROI</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className={`text-3xl font-extrabold font-mono mt-1 ${parseFloat(fleetROI) >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
            {fleetROI}%
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            On ${totalFleetCapital.toLocaleString()} total capital
          </div>
        </div>

      </div>

      {/* Best Performing Asset Spotlight */}
      {bestPerformingAsset && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-sm">Fleet Asset ROI Leader:</span>
                <span className="font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {bestPerformingAsset.licensePlate}
                </span>
              </div>
              <p className="text-slate-400 mt-0.5">
                {bestPerformingAsset.name} &bull; {bestPerformingAsset.model} &bull; Generated <strong className="text-emerald-400">${bestPerformingAsset.tripRevenue.toLocaleString()}</strong> revenue with <strong className="text-white">{bestPerformingAsset.roiPercentage}%</strong> capital yield.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 shrink-0 text-right">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Cost Per KM</div>
              <div className="font-mono font-bold text-white text-sm">${bestPerformingAsset.costPerKm} / km</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Net Yield</div>
              <div className="font-mono font-extrabold text-emerald-400 text-base">+${bestPerformingAsset.netProfit.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Ledger Table with Detailed ROI Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Asset Lifecycle &amp; Unit Economics Ledger
            </h2>
            <p className="text-[11px] text-slate-400">
              Formula: ROI = (Total Revenue &minus; (Maintenance Cost + Fuel Spend)) / Acquisition Cost
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-slate-400 text-xs">Filter Asset:</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Fleet Vehicles ({vehicles.length})</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.licensePlate} - {v.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Vehicle Plate &amp; Model</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Trips / Dist.</th>
                <th className="p-3 text-right">Revenue ($)</th>
                <th className="p-3 text-right">Maintenance ($)</th>
                <th className="p-3 text-right">Fuel Spend ($)</th>
                <th className="p-3 text-right">Total Op. Cost ($)</th>
                <th className="p-3 text-right">Cost / KM</th>
                <th className="p-3 text-right">Net Profit ($)</th>
                <th className="p-3 text-right">ROI %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filteredStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Plate & Name */}
                  <td className="p-3">
                    <div className="font-mono font-bold text-purple-300">
                      {stat.licensePlate}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{stat.name}</div>
                  </td>

                  {/* Type */}
                  <td className="p-3 text-slate-400">{stat.type}</td>

                  {/* Trips / KM */}
                  <td className="p-3 text-right font-mono">
                    <div>{stat.tripCount} trips</div>
                    <div className="text-[10px] text-slate-400">{stat.totalKmTraveled.toLocaleString()} km</div>
                  </td>

                  {/* Revenue */}
                  <td className="p-3 text-right font-mono font-bold text-white">
                    ${stat.tripRevenue.toLocaleString()}
                  </td>

                  {/* Maintenance Cost */}
                  <td className="p-3 text-right font-mono text-amber-400">
                    ${stat.maintenanceCost.toLocaleString()}
                  </td>

                  {/* Fuel Spend */}
                  <td className="p-3 text-right font-mono text-amber-300">
                    ${stat.fuelCost.toLocaleString()}
                  </td>

                  {/* Total Operational Cost */}
                  <td className="p-3 text-right font-mono font-bold text-slate-300">
                    ${stat.operationalCost.toLocaleString()}
                  </td>

                  {/* Cost per KM */}
                  <td className="p-3 text-right font-mono text-slate-400">
                    ${stat.costPerKm}/km
                  </td>

                  {/* Net Profit */}
                  <td className={`p-3 text-right font-mono font-bold ${stat.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${stat.netProfit.toLocaleString()}
                  </td>

                  {/* ROI % */}
                  <td className="p-3 text-right font-mono font-extrabold">
                    <span className={`px-2 py-0.5 rounded-full border ${
                      stat.roiPercentage >= 0
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      {stat.roiPercentage}%
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
