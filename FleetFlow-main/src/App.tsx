import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { CommandCenter } from './components/pages/CommandCenter';
import { VehicleRegistry } from './components/pages/VehicleRegistry';
import { TripDispatcher } from './components/pages/TripDispatcher';
import { MaintenanceLogs } from './components/pages/MaintenanceLogs';
import { ExpenseFuelLogging } from './components/pages/ExpenseFuelLogging';
import { DriverProfiles } from './components/pages/DriverProfiles';
import { AnalyticsReports } from './components/pages/AnalyticsReports';
import { Fleet3DVisualizer } from './components/pages/Fleet3DVisualizer';
import { MernHub } from './components/pages/MernHub';
import { InteractiveBackground3D } from './components/3d/InteractiveBackground3D';

// Modals
import { LoginModal } from './components/modals/LoginModal';
import { VehicleModal } from './components/modals/VehicleModal';
import { TripModal } from './components/modals/TripModal';
import { CompleteTripModal } from './components/modals/CompleteTripModal';
import { MaintenanceModal } from './components/modals/MaintenanceModal';
import { FuelLogModal } from './components/modals/FuelLogModal';
import { DriverModal } from './components/modals/DriverModal';
import { AuditReportModal } from './components/modals/AuditReportModal';

import { api } from './services/api';
import { 
  Vehicle, 
  Driver, 
  Trip, 
  MaintenanceLog, 
  ExpenseLog, 
  DashboardKPIs, 
  UserRole, 
  VehicleStatus, 
  DriverStatus,
  User
} from './types';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation & User Persona State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Fleet Manager');
  const [userName, setUserName] = useState<string>('Marcus Vance');
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [enable3DBackground, setEnable3DBackground] = useState(true);

  // Core Fleet State
  const [kpis, setKpis] = useState<DashboardKPIs | undefined>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Toast Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Modals Open/Close State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Fetch all fleet data
  const loadFleetData = useCallback(async () => {
    try {
      setLoading(true);
      const [vData, dData, tData, mData, eData, kpiData] = await Promise.all([
        api.getVehicles(),
        api.getDrivers(),
        api.getTrips(),
        api.getMaintenance(),
        api.getExpenses(),
        api.getKPIs()
      ]);

      setVehicles(vData);
      setDrivers(dData);
      setTrips(tData);
      setMaintenanceLogs(mData);
      setExpenses(eData);
      setKpis(kpiData);
    } catch (err: any) {
      console.error('Failed to load fleet data', err);
      showToast(err?.message || 'Error loading fleet database', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFleetData();
  }, [loadFleetData]);

  // Vehicle Actions
  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, vehicleData);
        showToast(`Vehicle ${vehicleData.licensePlate || ''} updated successfully.`);
      } else {
        await api.createVehicle(vehicleData);
        showToast(`Vehicle ${vehicleData.licensePlate || ''} registered with status 'Available'.`);
      }
      setIsVehicleModalOpen(false);
      setEditingVehicle(null);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save vehicle', 'error');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await api.deleteVehicle(id);
      showToast('Vehicle removed from fleet inventory.');
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete vehicle', 'error');
    }
  };

  const handleToggleVehicleStatus = async (id: string, status: VehicleStatus) => {
    try {
      await api.toggleVehicleStatus(id, status);
      showToast(`Vehicle status set to '${status}'.`);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Driver Actions
  const handleSaveDriver = async (driverData: Partial<Driver>) => {
    try {
      if (editingDriver) {
        await api.updateDriver(editingDriver.id, driverData);
        showToast(`Driver ${driverData.name} updated.`);
      } else {
        await api.createDriver(driverData);
        showToast(`Driver ${driverData.name} registered successfully.`);
      }
      setIsDriverModalOpen(false);
      setEditingDriver(null);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save driver profile', 'error');
    }
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      await api.deleteDriver(id);
      showToast('Driver removed from registry.');
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete driver', 'error');
    }
  };

  const handleToggleDriverStatus = async (id: string, status: DriverStatus) => {
    try {
      await api.toggleDriverStatus(id, status);
      showToast(`Driver status set to '${status}'.`);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Trip Dispatch Actions
  const handleSaveTrip = async (tripData: any) => {
    try {
      await api.createTrip(tripData);
      if (tripData.status === 'Dispatched') {
        showToast(`Trip ${tripData.tripCode} dispatched! Asset & Driver set to 'On Trip'.`);
      } else {
        showToast(`Trip ${tripData.tripCode} saved to draft queue.`);
      }
      setIsTripModalOpen(false);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create trip', 'error');
    }
  };

  const handleDispatchTrip = async (id: string) => {
    try {
      const trip = await api.dispatchTrip(id);
      showToast(`Trip ${trip.tripCode} dispatched! Vehicle & Driver set to 'On Trip'.`);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch trip', 'error');
    }
  };

  const handleCompleteTrip = async (tripId: string, finalOdometerKm: number, revenue?: number, notes?: string) => {
    try {
      await api.completeTrip(tripId, finalOdometerKm, revenue, notes);
      showToast(`Trip completed! Odometer updated to ${finalOdometerKm.toLocaleString()} km. Asset released.`);
      setCompletingTrip(null);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete trip', 'error');
    }
  };

  const handleCancelTrip = async (id: string) => {
    try {
      await api.cancelTrip(id);
      showToast('Trip cancelled and assets released back to available.');
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel trip', 'error');
    }
  };

  // Maintenance Actions
  const handleSaveMaintenance = async (mData: any) => {
    try {
      await api.createMaintenance(mData);
      showToast(`Work order logged! Vehicle ${mData.vehiclePlate} set to 'In Shop' and isolated.`);
      setIsMaintenanceModalOpen(false);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to log maintenance', 'error');
    }
  };

  const handleCompleteMaintenance = async (id: string) => {
    try {
      await api.completeMaintenance(id);
      showToast('Service completed! Vehicle returned to Available pool.');
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete maintenance', 'error');
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    try {
      await api.deleteMaintenance(id);
      showToast('Maintenance record removed.');
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
  };

  // Expense Actions
  const handleSaveExpense = async (eData: any) => {
    try {
      await api.createExpense(eData);
      showToast(`Expense of $${Number(eData.amount).toFixed(2)} recorded.`);
      setIsExpenseModalOpen(false);
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save expense', 'error');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id);
      showToast('Expense record removed.');
      await loadFleetData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  const activeTripsCount = trips.filter(t => t.status === 'Dispatched').length;
  const inShopCount = vehicles.filter(v => v.status === 'In Shop').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      
      {/* Dynamic 3D Moving Particle & Supply Network Canvas */}
      {enable3DBackground && (
        <InteractiveBackground3D className="fixed inset-0 pointer-events-none opacity-45 z-0" />
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border flex items-center space-x-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
          toast.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-700 shadow-rose-950/50'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-700 shadow-emerald-950/50'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        userRole={userRole}
        userName={userName}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenNewTrip={() => setIsTripModalOpen(true)}
        onOpenNewVehicle={() => {
          setEditingVehicle(null);
          setIsVehicleModalOpen(true);
        }}
      />

      {/* Primary Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTripsCount={activeTripsCount}
        inShopCount={inShopCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Synchronizing fleet telemetry &amp; SQLite database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <CommandCenter
                kpis={kpis}
                vehicles={vehicles}
                drivers={drivers}
                trips={trips}
                maintenanceLogs={maintenanceLogs}
                onOpenNewTrip={() => setIsTripModalOpen(true)}
                onOpenNewVehicle={() => {
                  setEditingVehicle(null);
                  setIsVehicleModalOpen(true);
                }}
                onOpenNewMaintenance={() => setIsMaintenanceModalOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === '3d_twin' && (
              <Fleet3DVisualizer
                vehicles={vehicles}
                trips={trips}
                onDispatchTrip={() => setIsTripModalOpen(true)}
              />
            )}

            {activeTab === 'vehicles' && (
              <VehicleRegistry
                vehicles={vehicles}
                onOpenNewVehicle={() => {
                  setEditingVehicle(null);
                  setIsVehicleModalOpen(true);
                }}
                onEditVehicle={(vehicle) => {
                  setEditingVehicle(vehicle);
                  setIsVehicleModalOpen(true);
                }}
                onDeleteVehicle={handleDeleteVehicle}
                onToggleStatus={handleToggleVehicleStatus}
              />
            )}

            {activeTab === 'trips' && (
              <TripDispatcher
                trips={trips}
                onOpenNewTrip={() => setIsTripModalOpen(true)}
                onDispatchTrip={handleDispatchTrip}
                onOpenCompleteModal={(trip) => setCompletingTrip(trip)}
                onCancelTrip={handleCancelTrip}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceLogs
                logs={maintenanceLogs}
                onOpenNewMaintenance={() => setIsMaintenanceModalOpen(true)}
                onCompleteMaintenance={handleCompleteMaintenance}
                onDeleteMaintenance={handleDeleteMaintenance}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpenseFuelLogging
                expenses={expenses}
                onOpenNewExpense={() => setIsExpenseModalOpen(true)}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'drivers' && (
              <DriverProfiles
                drivers={drivers}
                onOpenNewDriver={() => {
                  setEditingDriver(null);
                  setIsDriverModalOpen(true);
                }}
                onEditDriver={(driver) => {
                  setEditingDriver(driver);
                  setIsDriverModalOpen(true);
                }}
                onDeleteDriver={handleDeleteDriver}
                onToggleStatus={handleToggleDriverStatus}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsReports
                vehicles={vehicles}
                trips={trips}
                maintenanceLogs={maintenanceLogs}
                expenses={expenses}
                onOpenAuditModal={() => setIsAuditModalOpen(true)}
              />
            )}

            {activeTab === 'mern_hub' && (
              <MernHub />
            )}
          </>
        )}

      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentRole={userRole}
        currentUser={currentUser}
        onSwitchRole={(role, name) => {
          setUserRole(role);
          setUserName(name);
          showToast(`Persona switched to ${role} (${name}).`);
        }}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setUserRole(user.role);
          setUserName(user.name);
          showToast(`Logged in as ${user.name} (${user.role}) - Synced with database.`);
        }}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setEditingVehicle(null);
        }}
        vehicle={editingVehicle}
        onSaveVehicle={handleSaveVehicle}
      />

      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        vehicles={vehicles}
        drivers={drivers}
        onSaveTrip={handleSaveTrip}
      />

      <CompleteTripModal
        isOpen={!!completingTrip}
        onClose={() => setCompletingTrip(null)}
        trip={completingTrip}
        onComplete={handleCompleteTrip}
      />

      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        vehicles={vehicles}
        onSaveMaintenance={handleSaveMaintenance}
      />

      <FuelLogModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        vehicles={vehicles}
        onSaveExpense={handleSaveExpense}
      />

      <DriverModal
        isOpen={isDriverModalOpen}
        onClose={() => {
          setIsDriverModalOpen(false);
          setEditingDriver(null);
        }}
        driver={editingDriver}
        onSaveDriver={handleSaveDriver}
      />

      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        vehicles={vehicles}
        drivers={drivers}
        trips={trips}
        maintenanceLogs={maintenanceLogs}
        expenses={expenses}
      />

    </div>
  );
}
