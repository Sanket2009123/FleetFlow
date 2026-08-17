import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building, 
  Phone, 
  ArrowRight, 
  Key, 
  Database, 
  Sparkles,
  AlertCircle,
  Users
} from 'lucide-react';
import { UserRole, User } from '../../types';
import { api } from '../../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentUser?: User;
  onSwitchRole: (role: UserRole, name: string) => void;
  onLoginSuccess?: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentUser,
  onSwitchRole,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<'signin' | 'register' | 'team'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('marcus.vance@fleetflow.io');
  const [loginPassword, setLoginPassword] = useState('demo123');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Fleet Manager');
  const [regOrg, setRegOrg] = useState('FleetFlow Logistics Global');
  const [regPhone, setRegPhone] = useState('+1 (555) 321-7890');

  // Registered users from DB
  const [dbUsers, setDbUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTeamUsers();
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const loadTeamUsers = async () => {
    try {
      const users = await api.getUsers();
      setDbUsers(users);
    } catch (e) {
      console.warn('Could not load team users', e);
    }
  };

  if (!isOpen) return null;

  const quickRoles: { role: UserRole; name: string; email: string; desc: string; permissions: string[] }[] = [
    {
      role: 'Fleet Manager',
      name: 'Marcus Vance',
      email: 'marcus.vance@fleetflow.io',
      desc: 'Full administrative authority across all vehicles, dispatches, budgets, and compliance.',
      permissions: ['Vehicle Intake & Retirement', 'Driver Management', 'Trip Dispatch & Override', 'Budget Allocation']
    },
    {
      role: 'Dispatcher',
      name: 'Taylor Reed',
      email: 'taylor.reed@fleetflow.io',
      desc: 'Operational freight routing, driver assigning, route tracking, and load validation.',
      permissions: ['Create & Dispatch Trips', 'Driver Pairing', 'Delivery Status Sign-off', 'Route Monitoring']
    },
    {
      role: 'Safety Officer',
      name: 'Diane Foster',
      email: 'diane.foster@fleetflow.io',
      desc: 'Commercial driver compliance, license verification, safety scores, and maintenance tracking.',
      permissions: ['Driver License Auditing', 'Maintenance Logging', 'Safety Score Evaluation', 'Vehicle Health Inspections']
    },
    {
      role: 'Financial Analyst',
      name: 'Julian Sterling',
      email: 'julian.sterling@fleetflow.io',
      desc: 'Fuel telemetry, unit cost per kilometer, asset amortized ROI, and compliance export.',
      permissions: ['Fuel & Toll Logging', 'Asset Lifecycle ROI', 'Audit Exporting', 'Financial Reconciliation']
    }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(loginEmail, loginPassword);
      setSuccessMsg(`Welcome back, ${res.user.name}!`);
      onSwitchRole(res.user.role, res.user.name);
      onLoginSuccess?.(res.user);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        organization: regOrg,
        phone: regPhone
      });

      setSuccessMsg('Account registered and persisted to MongoDB database!');
      onSwitchRole(res.user.role, res.user.name);
      onLoginSuccess?.(res.user);
      await loadTeamUsers();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Authentication & Role Access
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  MongoDB Synced
                </span>
              </h2>
              <p className="text-xs text-slate-400">Secure enterprise access and team identity management</p>
            </div>
          </div>
          <button 
            id="btn-close-auth-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/30 px-5 pt-2">
          {[
            { id: 'signin', label: 'Sign In / Switch Role', icon: Key },
            { id: 'register', label: 'Create Account', icon: Sparkles },
            { id: 'team', label: `Database Users (${dbUsers.length || 4})`, icon: Users },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-auth-${t.id}`}
                onClick={() => {
                  setTab(t.id as any);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
                  isActive
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Notifications */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: SIGN IN & QUICK PERSONA SWITCH */}
          {tab === 'signin' && (
            <div className="space-y-5">
              {/* Quick Persona 1-Click Login Cards */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>1-Click Team Personas</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Instant Role Activation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {quickRoles.map((item) => {
                    const isSelected = currentRole === item.role;
                    return (
                      <div
                        key={item.role}
                        id={`btn-persona-${item.role.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => {
                          setLoginEmail(item.email);
                          setLoginPassword('demo123');
                          onSwitchRole(item.role, item.name);
                          onClose();
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500/70 ring-1 ring-emerald-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{item.name}</div>
                              <div className="text-[10px] text-emerald-400 font-semibold">{item.role}</div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-slate-400 text-[10px] line-clamp-1">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Standard Email & Password Login */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Or Sign In with Credentials
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Work Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        id="input-login-email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:border-emerald-500 outline-none"
                        placeholder="name@fleetflow.io"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        id="input-login-password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:border-emerald-500 outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-login"
                    disabled={loading}
                    className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTRATION / CREATE NEW ACCOUNT */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      id="input-reg-name"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none"
                      placeholder="Sarah Walker"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Work Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      id="input-reg-email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none"
                      placeholder="sarah.w@fleetflow.io"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Operational Role *</label>
                  <select
                    id="select-reg-role"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:border-emerald-500 outline-none"
                  >
                    <option value="Fleet Manager">Fleet Manager (Full Admin)</option>
                    <option value="Dispatcher">Dispatcher (Trips & Routing)</option>
                    <option value="Safety Officer">Safety Officer (Compliance & Health)</option>
                    <option value="Financial Analyst">Financial Analyst (Fuel & Costs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Organization / Division</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      id="input-reg-org"
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none"
                      placeholder="Pacific Freight Hub"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      id="input-reg-password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      id="input-reg-confirm-password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                <Database className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your new profile will be stored directly in MongoDB (or the active database layer) with role-based RBAC claims and live audit synchronization.
                </p>
              </div>

              <button
                type="submit"
                id="btn-submit-register"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                <span>{loading ? 'Creating Account in MongoDB...' : 'Register & Log In'}</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 3: TEAM & DATABASE DIRECTORY */}
          {tab === 'team' && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Total Active Users in Database: <strong className="text-emerald-400">{dbUsers.length}</strong></span>
                <span className="text-cyan-400 font-bold">MongoDB Mongoose</span>
              </div>

              <div className="space-y-2">
                {dbUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {u.name}
                          <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            {u.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSwitchRole(u.role, u.name);
                        onLoginSuccess?.(u);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-300 font-semibold transition"
                    >
                      Login As
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

