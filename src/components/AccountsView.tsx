import React, { useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  ArrowLeftRight, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  RefreshCw, 
  SlidersHorizontal,
  Plus,
  Trash2,
  X,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Account, User, CurrencyCode, AccountType } from '../types';

interface AccountsViewProps {
  accounts: Account[];
  activeUser: User;
  onUpdateAccountBalance: (accountId: string, newBalance: number, reason: string) => void;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (accountId: string) => { success: boolean; message?: string };
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  activeUser,
  onUpdateAccountBalance,
  onAddAccount,
  onDeleteAccount
}) => {
  // Arqueo State
  const [selectedArqueoAccountId, setSelectedArqueoAccountId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<string>('');
  const [arqueoNotes, setArqueoNotes] = useState<string>('');
  const [arqueoResultMsg, setArqueoResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Account Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newAccName, setNewAccName] = useState<string>('');
  const [newAccCurrency, setNewAccCurrency] = useState<'CUP' | CurrencyCode>('CUP');
  const [newAccType, setNewAccType] = useState<AccountType>('efectivo');
  const [newAccNumber, setNewAccNumber] = useState<string>('');
  const [newAccDesc, setNewAccDesc] = useState<string>('');
  const [newAccInitialBal, setNewAccInitialBal] = useState<string>('0');

  // Account to delete confirmation modal
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const selectedAccount = accounts.find(a => a.id === selectedArqueoAccountId) || accounts[0];

  const numPhysicalCount = parseFloat(physicalCount) || 0;
  const difference = selectedAccount ? numPhysicalCount - selectedAccount.balance : 0;

  const canManageAccounts = activeUser.role === 'admin' || activeUser.role === 'desarrollador';

  const handleApplyArqueo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    if (!canManageAccounts) {
      alert('Solo un Administrador o Auditor puede ajustar formalmente los saldos tras el arqueo.');
      return;
    }

    const reason = `Arqueo de caja físico: Conteo real ${numPhysicalCount} ${selectedAccount.currency} (Diferencia: ${difference >= 0 ? '+' : ''}${difference}). Nota: ${arqueoNotes || 'Cuadre ordinario'}`;
    onUpdateAccountBalance(selectedAccount.id, numPhysicalCount, reason);

    setArqueoResultMsg(`Arqueo registrado exitosamente en "${selectedAccount.name}". Saldo actualizado a $${numPhysicalCount.toLocaleString()} ${selectedAccount.currency}.`);
    setPhysicalCount('');
    setArqueoNotes('');
    setTimeout(() => setArqueoResultMsg(null), 5000);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) {
      alert('Por favor especifica el nombre de la caja o cuenta.');
      return;
    }

    const initialBal = parseFloat(newAccInitialBal) || 0;

    onAddAccount({
      name: newAccName.trim(),
      currency: newAccCurrency,
      accountType: newAccType,
      balance: initialBal,
      accountNumber: newAccType === 'banco_tarjeta' ? (newAccNumber.trim() || undefined) : undefined,
      description: newAccDesc.trim() || (newAccType === 'efectivo' ? 'Caja de efectivo físico' : 'Cuenta electrónica')
    });

    setArqueoResultMsg(`Caja o cuenta "${newAccName.trim()}" creada exitosamente.`);
    setIsAddModalOpen(false);
    setNewAccName('');
    setNewAccNumber('');
    setNewAccDesc('');
    setNewAccInitialBal('0');
    setTimeout(() => setArqueoResultMsg(null), 5000);
  };

  const handleConfirmDelete = () => {
    if (!accountToDelete) return;

    const res = onDeleteAccount(accountToDelete.id);
    if (!res.success) {
      setErrorMsg(res.message || 'No se pudo eliminar la cuenta.');
      setTimeout(() => setErrorMsg(null), 6000);
    } else {
      setArqueoResultMsg(`Cuenta "${accountToDelete.name}" eliminada correctamente.`);
      setTimeout(() => setArqueoResultMsg(null), 5000);
    }
    setAccountToDelete(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Gestión de Cajas, Cuentas Bancarias & Arqueo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra existencias físicas y electrónicas (Transfermóvil, EnZona, Bandec) y realiza cuadres de caja.
          </p>
        </div>

        {canManageAccounts && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Caja o Cuenta</span>
          </button>
        )}
      </div>

      {arqueoResultMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{arqueoResultMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const isCash = acc.accountType === 'efectivo';
          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-sans">
                    {isCash ? <Wallet className="w-4 h-4 text-emerald-400" /> : <CreditCard className="w-4 h-4 text-cyan-400" />}
                    <span>{isCash ? 'Efectivo en Caja' : 'Cuenta / Tarjeta Electrónica'}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {acc.currency}
                    </span>
                    {canManageAccounts && (
                      <button
                        type="button"
                        onClick={() => setAccountToDelete(acc)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Eliminar esta caja o cuenta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="font-bold text-white text-base">{acc.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{acc.description}</p>
                  {acc.accountNumber && (
                    <p className="text-[11px] font-mono text-slate-500 mt-1">
                      Cuenta/ID: {acc.accountNumber}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="pt-3 border-t border-slate-800/80 flex items-baseline justify-between font-mono">
                  <span className="text-xs text-slate-400 font-sans">Saldo Disponible:</span>
                  <span className={`text-xl font-black ${acc.currency === 'CUP' ? 'text-amber-300' : 'text-emerald-400'}`}>
                    ${acc.balance.toLocaleString()} {acc.currency}
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArqueoAccountId(acc.id);
                      setPhysicalCount(String(acc.balance));
                      // Desplazar suavemente hacia el formulario de arqueo
                      const arqueoForm = document.getElementById('arqueo-form-section');
                      if (arqueoForm) arqueoForm.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Realizar Arqueo / Cuadre
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arqueo de Caja Form */}
      <div id="arqueo-form-section" className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Arqueo de Caja & Cuadre Físico</h3>
          </div>
          <span className="text-xs text-slate-400">
            Cotejo del efectivo real contado frente al balance registrado en el sistema
          </span>
        </div>

        <form onSubmit={handleApplyArqueo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seleccionar Caja o Cuenta para Cuadre:
              </label>
              <select
                value={selectedArqueoAccountId}
                onChange={(e) => setSelectedArqueoAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} — Saldo en Sistema: ${a.balance.toLocaleString()} {a.currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Conteo Físico Real / Saldo en Banca Móvil ({selectedAccount?.currency}):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={physicalCount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    const clean = val === '' ? '' : (val === '0' || val.startsWith('0.')) ? val : val.replace(/^0+([1-9])/, '$1');
                    setPhysicalCount(clean);
                  }}
                  placeholder="Ingresa la cantidad real contada..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-20 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-300 pointer-events-none select-none">
                  {selectedAccount?.currency}
                </div>
              </div>
            </div>
          </div>

          {/* Live Difference Result Box */}
          {physicalCount && (
            <div className={`p-4 rounded-xl border font-mono ${
              difference === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : difference > 0
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase block">
                    {difference === 0 ? '✅ Caja Cuadrada con Éxito' : difference > 0 ? 'ℹ️ Sobrante de Efectivo' : '⚠️ Faltante de Efectivo'}
                  </span>
                  <span className="text-xs text-slate-300 font-sans mt-0.5">
                    Saldo Sistema: ${selectedAccount.balance.toLocaleString()} {selectedAccount.currency} | Conteo Físico: ${numPhysicalCount.toLocaleString()} {selectedAccount.currency}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black">
                    Diferencia: {difference >= 0 ? '+' : ''}${difference.toLocaleString()} {selectedAccount.currency}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observaciones del Conteo / Causa del Descuadre (Auditoría):
            </label>
            <input
              type="text"
              value={arqueoNotes}
              onChange={(e) => setArqueoNotes(e.target.value)}
              placeholder="Ej. Billetes de 1000 CUP contados dos veces, coincide con arqueo de medio turno..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Guardar Acta de Arqueo y Actualizar Saldo</span>
            </button>
          </div>
        </form>
      </div>

      {/* MODAL: CREAR NUEVA CAJA O CUENTA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">Crear Nueva Caja o Cuenta Bancaria</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nombre de la Caja / Cuenta: *
                </label>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="Ej. Caja Mostrador Vedado 2, Billetera EnZona CUP..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tipo de Cuenta: *
                  </label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as AccountType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="efectivo">💵 Efectivo en Caja Física</option>
                    <option value="banco_tarjeta">💳 Cuenta Bancaria / Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Moneda Operativa: *
                  </label>
                  <select
                    value={newAccCurrency}
                    onChange={(e) => setNewAccCurrency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-mono"
                  >
                    <option value="CUP">CUP (Pesos Cubanos)</option>
                    <option value="USD">USD (Dólares)</option>
                    <option value="EUR">EUR (Euros)</option>
                    <option value="MLC">MLC (Moneda Libremente Convertible)</option>
                  </select>
                </div>
              </div>

              {newAccType === 'banco_tarjeta' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Número de Cuenta / Tarjeta / ID Digital (Opcional):
                  </label>
                  <input
                    type="text"
                    value={newAccNumber}
                    onChange={(e) => setNewAccNumber(e.target.value)}
                    placeholder="Ej. 9202-xxxx-xxxx-1234 o ID-ENZONA"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Saldo Inicial en Caja:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={newAccInitialBal}
                    onChange={(e) => setNewAccInitialBal(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-16 py-2 text-white text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold pointer-events-none">
                    {newAccCurrency}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Puedes iniciar en $0.00 y registrar el capital inicial después mediante un arqueo o transferencia.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Descripción o Ubicación:
                </label>
                <input
                  type="text"
                  value={newAccDesc}
                  onChange={(e) => setNewAccDesc(e.target.value)}
                  placeholder="Ej. Gaveta de caja principal en sucursal central..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  Crear Caja / Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN DE CUENTA */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Eliminar Caja o Cuenta</h3>
                <p className="text-xs text-slate-400 font-sans">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <p className="text-slate-300">
                ¿Estás seguro de que deseas eliminar permanentemente la cuenta:
              </p>
              <div className="font-bold text-white text-sm">
                "{accountToDelete.name}" ({accountToDelete.currency})
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-mono">
                <span className="text-slate-400">Saldo actual registrado:</span>
                <span className={`font-bold ${accountToDelete.balance === 0 ? 'text-slate-300' : 'text-amber-400'}`}>
                  ${accountToDelete.balance.toLocaleString()} {accountToDelete.currency}
                </span>
              </div>
              {accountToDelete.balance !== 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-1.5 mt-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Por seguridad contable, para eliminar una cuenta primero debes dejar su saldo en $0.00 (mediante arqueo o retiro).
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={accountToDelete.balance !== 0}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 cursor-pointer"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
