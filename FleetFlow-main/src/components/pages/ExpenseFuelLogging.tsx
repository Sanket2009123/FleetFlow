import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  Search, 
  Filter, 
  Plus, 
  DollarSign, 
  Gauge, 
  Trash2, 
  Receipt, 
  TrendingDown, 
  Truck,
  Droplets
} from 'lucide-react';
import { ExpenseLog, ExpenseCategory } from '../../types';

interface ExpenseFuelLoggingProps {
  expenses: ExpenseLog[];
  onOpenNewExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseFuelLogging: React.FC<ExpenseFuelLoggingProps> = ({
  expenses,
  onOpenNewExpense,
  onDeleteExpense
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = 
        e.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.receiptNumber && e.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchCategory = categoryFilter === 'All' || e.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const totalSpend = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const fuelSpend = useMemo(() => {
    return expenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalFuelLiters = useMemo(() => {
    return expenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + (e.liters || 0), 0);
  }, [expenses]);

  const avgFuelPricePerLiter = totalFuelLiters > 0 ? (fuelSpend / totalFuelLiters).toFixed(3) : '0.000';

  const getCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
      case 'Fuel':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Fuel</span>;
      case 'Toll':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Toll</span>;
      case 'Maintenance':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Maintenance</span>;
      case 'Insurance':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Insurance</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">{category}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Fuel &amp; Expense Logging</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {expenses.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fuel consumption metrics, toll expenditures, cost per liter indexing, and operational burn tracking.
          </p>
        </div>

        <button
          onClick={onOpenNewExpense}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense / Fuel Fill</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Operational Spend</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            ${totalSpend.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">All categories included</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Fuel Expenditure</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            ${fuelSpend.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-300 mt-0.5">Diesel, Petrol, Electric</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Fuel Volume Pumped</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalFuelLiters.toLocaleString()} <span className="text-xs text-slate-400 font-normal">liters</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Direct telemetry sync</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Average Unit Price</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ${avgFuelPricePerLiter} <span className="text-xs text-slate-400 font-normal">/ L</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Fleet-wide average</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by license plate, vendor name, or receipt number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-slate-900">All Categories</option>
              <option value="Fuel" className="bg-slate-900">Fuel</option>
              <option value="Toll" className="bg-slate-900">Tolls &amp; Bridges</option>
              <option value="Maintenance" className="bg-slate-900">Shop Maintenance</option>
              <option value="Insurance" className="bg-slate-900">Insurance &amp; Fees</option>
              <option value="Other" className="bg-slate-900">Other General</option>
            </select>
          </div>
        </div>

      </div>

      {/* Expense Entries Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Vehicle Plate</th>
                <th className="p-3">Category</th>
                <th className="p-3">Vendor / Station</th>
                <th className="p-3 text-right">Volume</th>
                <th className="p-3 text-right">Rate / L</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-center">Receipt</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{exp.date}</td>
                    
                    <td className="p-3">
                      <span className="font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                        {exp.vehiclePlate}
                      </span>
                    </td>

                    <td className="p-3">{getCategoryBadge(exp.category)}</td>

                    <td className="p-3">
                      <div className="font-semibold text-white">{exp.vendor}</div>
                      {exp.notes && <div className="text-[11px] text-slate-400 truncate max-w-xs">{exp.notes}</div>}
                    </td>

                    <td className="p-3 text-right font-mono">
                      {exp.liters ? `${exp.liters.toFixed(1)} L` : '-'}
                    </td>

                    <td className="p-3 text-right font-mono text-slate-400">
                      {exp.costPerLiter ? `$${exp.costPerLiter.toFixed(3)}` : '-'}
                    </td>

                    <td className="p-3 text-right font-mono font-extrabold text-amber-400">
                      ${exp.amount.toFixed(2)}
                    </td>

                    <td className="p-3 text-center font-mono text-[11px] text-slate-400">
                      {exp.receiptNumber || '-'}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Delete this expense record?')) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
