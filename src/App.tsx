/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService, canAccessTab } from './services/storage';
import { 
  User, 
  Role,
  ExchangeRate, 
  Account, 
  Transaction, 
  LoginLog, 
  AuditLog, 
  BackupSnapshot,
  RateHistoryItem,
  CurrencyCode
} from './types';
import { ShieldAlert } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { RatesManagerView } from './components/RatesManagerView';
import { ReportsView } from './components/ReportsView';
import { AccountsView } from './components/AccountsView';
import { UsersRolesView } from './components/UsersRolesView';
import { AuditView } from './components/AuditView';
import { BackupsView } from './components/BackupsView';
import { LaravelDeployView } from './components/LaravelDeployView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeUser, setActiveUser] = useState<User | null>(() => storageService.getActiveUser());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [roles, setRoles] = useState<Role[]>(() => storageService.getRoles());
  const [rates, setRates] = useState<ExchangeRate[]>(() => storageService.getRates());
  const [rateHistory, setRateHistory] = useState<RateHistoryItem[]>(() => storageService.getRateHistory());
  const [accounts, setAccounts] = useState<Account[]>(() => storageService.getAccounts());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions());
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>(() => storageService.getLoginLogs());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [backups, setBackups] = useState<BackupSnapshot[]>(() => storageService.getBackups());

  // Modals state
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  // Theme state (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('datacambio_theme');
      const activeTheme = saved === 'light' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        if (activeTheme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
      }
      return activeTheme;
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('datacambio_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch {
      // Ignorar restricciones locales
    }
  }, [theme]);

  // Quick stats for navbar
  const totalUSD = accounts.filter(a => a.currency === 'USD').reduce((s, a) => s + a.balance, 0);
  const totalCUP = accounts.filter(a => a.currency === 'CUP').reduce((s, a) => s + a.balance, 0);
  const totalMLC = accounts.filter(a => a.currency === 'MLC').reduce((s, a) => s + a.balance, 0);

  // Auth Handlers
  const handleLoginSubmit = (username: string, pass: string, customIp?: string) => {
    const res = storageService.login(username, pass, customIp);
    setLoginLogs(storageService.getLoginLogs());
    setAuditLogs(storageService.getAuditLogs());
    if (res.success && res.user) {
      setActiveUser(res.user);
      setActiveTab('dashboard');
    }
    return res;
  };

  const handleLogout = () => {
    if (activeUser) {
      storageService.logout(activeUser);
    }
    setActiveUser(null);
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleChangePassword = (currentPass: string, newPass: string) => {
    if (!activeUser) return { success: false, error: 'No hay sesión activa.' };
    const res = storageService.changePassword(activeUser.id, currentPass, newPass, activeUser);
    if (res.success) {
      setUsers(storageService.getUsers());
      setActiveUser(storageService.getActiveUser());
      setAuditLogs(storageService.getAuditLogs());
    }
    return res;
  };

  // Transaction Handlers
  const handleNewTransactionSuccess = (txData: any, openReceipt: boolean) => {
    if (!activeUser) return;
    const createdTx = storageService.addTransaction(txData, activeUser);
    setTransactions(storageService.getTransactions());
    setAccounts(storageService.getAccounts());
    setAuditLogs(storageService.getAuditLogs());

    if (openReceipt) {
      setReceiptTx(createdTx);
    }
  };

  const handleCancelTransaction = (txId: string, reason: string) => {
    if (!activeUser) return;
    const ok = storageService.cancelTransaction(txId, reason, activeUser);
    if (ok) {
      setTransactions(storageService.getTransactions());
      setAccounts(storageService.getAccounts());
      setAuditLogs(storageService.getAuditLogs());
    }
  };

  const handleUpdateRates = (currency: CurrencyCode, buyRate: number, sellRate: number, note: string) => {
    if (!activeUser) return;
    storageService.updateRates(currency, buyRate, sellRate, note, activeUser);
    setRates(storageService.getRates());
    setRateHistory(storageService.getRateHistory());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleSyncElToqueRates = (
    updates: { currency: CurrencyCode; buyRate: number; sellRate: number; marketReference?: number }[],
    note: string
  ) => {
    if (!activeUser) return;
    storageService.syncElToqueRates(updates, note, activeUser);
    setRates(storageService.getRates());
    setRateHistory(storageService.getRateHistory());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleUpdateAccountBalance = (accountId: string, newBalance: number, reason: string) => {
    if (!activeUser) return;
    storageService.updateAccountBalance(accountId, newBalance, activeUser, reason);
    setAccounts(storageService.getAccounts());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleAddAccount = (data: Omit<Account, 'id'>) => {
    if (!activeUser) return;
    storageService.addAccount(data, activeUser);
    setAccounts(storageService.getAccounts());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleDeleteAccount = (accountId: string) => {
    if (!activeUser) return { success: false, message: 'Usuario no autenticado' };
    const res = storageService.deleteAccount(accountId, activeUser);
    if (res.success) {
      setAccounts(storageService.getAccounts());
      setAuditLogs(storageService.getAuditLogs());
    }
    return res;
  };

  const handleCreateBackup = (type: 'Automático Diario' | 'Manual') => {
    if (!activeUser) return;
    storageService.createBackup(type, activeUser);
    setBackups(storageService.getBackups());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleExportFullJSON = () => {
    const jsonStr = storageService.exportFullDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datacambio_full_database_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreJSON = (jsonStr: string): boolean => {
    if (!activeUser) return false;
    const ok = storageService.restoreFromJSON(jsonStr, activeUser);
    if (ok) {
      setRates(storageService.getRates());
      setRateHistory(storageService.getRateHistory());
      setAccounts(storageService.getAccounts());
      setTransactions(storageService.getTransactions());
      setLoginLogs(storageService.getLoginLogs());
      setAuditLogs(storageService.getAuditLogs());
    }
    return ok;
  };

  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!activeUser) return;
    storageService.addUser(userData, activeUser);
    setUsers(storageService.getUsers());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleUpdateUser = (id: string, userData: Partial<User>) => {
    if (!activeUser) return;
    storageService.updateUser(id, userData, activeUser);
    setUsers(storageService.getUsers());
    setAuditLogs(storageService.getAuditLogs());
    const currentActive = storageService.getActiveUser();
    if (currentActive && currentActive.id === id) {
      setActiveUser(currentActive);
    }
  };

  const handleDeleteUser = (id: string): boolean => {
    if (!activeUser) return false;
    const ok = storageService.deleteUser(id, activeUser);
    if (ok) {
      setUsers(storageService.getUsers());
      setAuditLogs(storageService.getAuditLogs());
    }
    return ok;
  };

  const handleAddRole = (roleData: Omit<Role, 'id'>) => {
    if (!activeUser) return;
    storageService.addRole(roleData, activeUser);
    setRoles(storageService.getRoles());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleUpdateRole = (id: string, roleData: Partial<Role>) => {
    if (!activeUser) return;
    storageService.updateRole(id, roleData, activeUser);
    setRoles(storageService.getRoles());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleDeleteRole = (id: string): boolean => {
    if (!activeUser) return false;
    const ok = storageService.deleteRole(id, activeUser);
    if (ok) {
      setRoles(storageService.getRoles());
      setAuditLogs(storageService.getAuditLogs());
    }
    return ok;
  };

  const handleResetAllData = () => {
    if (!activeUser) return;
    if (confirm('¿Deseas reiniciar todas las cajas a $0.00 y limpiar los datos de prueba?')) {
      storageService.resetAllData(activeUser);
      setUsers(storageService.getUsers());
      setRoles(storageService.getRoles());
      setRates(storageService.getRates());
      setAccounts(storageService.getAccounts());
      setTransactions(storageService.getTransactions());
      setLoginLogs(storageService.getLoginLogs());
      setAuditLogs(storageService.getAuditLogs());
      setBackups(storageService.getBackups());
      alert('Se han reseteado todas las cajas a $0.00 y se reinició la base de datos limpia.');
    }
  };

  // Si no hay usuario autenticado, renderizar la pantalla completa de login seguro
  if (!activeUser) {
    return (
      <LoginModal
        isOpen={true}
        isStandaloneScreen={true}
        users={users}
        onLogin={handleLoginSubmit}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col selection:bg-emerald-500 selection:text-slate-950 ${theme === 'light' ? 'light bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeUser={activeUser}
        roles={roles}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onResetAllData={handleResetAllData}
        rates={rates}
        onNewTransaction={() => setIsNewTxModalOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        quickStats={{ totalUSD, totalCUP, totalMLC }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!canAccessTab(activeTab, activeUser, roles) ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-lg mx-auto my-12 space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Módulo No Accesible para este Rol</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              El rol actual asignado a <strong className="text-slate-200">{activeUser.name}</strong> (<span className="text-emerald-400 font-mono">{activeUser.role}</span>) no tiene privilegios para acceder al módulo <span className="text-slate-200 font-semibold">{activeTab}</span>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                Volver al Panel Principal (Dashboard)
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                transactions={transactions}
                rates={rates}
                accounts={accounts}
                activeUser={activeUser}
                onNewTransaction={() => setIsNewTxModalOpen(true)}
                onOpenReceipt={(tx) => setReceiptTx(tx)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView
                transactions={transactions}
                activeUser={activeUser}
                onNewTransaction={() => setIsNewTxModalOpen(true)}
                onOpenReceipt={(tx) => setReceiptTx(tx)}
                onCancelTransaction={handleCancelTransaction}
              />
            )}

            {activeTab === 'rates' && (
              <RatesManagerView
                rates={rates}
                rateHistory={rateHistory}
                activeUser={activeUser}
                onUpdateRate={handleUpdateRates}
                onSyncElToqueRates={handleSyncElToqueRates}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                transactions={transactions}
                rates={rates}
                activeUser={activeUser}
              />
            )}

            {activeTab === 'accounts' && (
              <AccountsView
                accounts={accounts}
                activeUser={activeUser}
                onUpdateAccountBalance={handleUpdateAccountBalance}
                onAddAccount={handleAddAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activeTab === 'users' && (
              <UsersRolesView
                users={users}
                roles={roles}
                activeUser={activeUser}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onAddRole={handleAddRole}
                onUpdateRole={handleUpdateRole}
                onDeleteRole={handleDeleteRole}
              />
            )}

            {activeTab === 'audit' && (
              <AuditView
                loginLogs={loginLogs}
                auditLogs={auditLogs}
                activeUser={activeUser}
              />
            )}

            {activeTab === 'backups' && (
              <BackupsView
                backups={backups}
                activeUser={activeUser}
                onCreateBackup={handleCreateBackup}
                onExportFullJSON={handleExportFullJSON}
                onRestoreJSON={handleRestoreJSON}
              />
            )}

            {activeTab === 'laravel-deploy' && (
              <LaravelDeployView />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            DataCambio Pro © {new Date().getFullYear()} • Sistema de Gestión de Divisas y Cajas para Cuba
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400">● Sesión Autenticada: @{activeUser.username}</span>
            <span>Laravel 11 Backend Ready</span>
            <span>Base de Datos Local Segura</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        rates={rates}
        accounts={accounts}
        activeUser={activeUser}
        onSuccess={handleNewTransactionSuccess}
      />

      <ReceiptModal
        transaction={receiptTx}
        onClose={() => setReceiptTx(null)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        activeUser={activeUser}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
}
