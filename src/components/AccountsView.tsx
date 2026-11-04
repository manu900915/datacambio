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
  Plus
} from 'lucide-react';
import { Account, User } from '../types';

interface AccountsViewProps {
  accounts: Account[];
  activeUser: User;
  onUpdateAccountBalance: (accountId: string, newBalance: number, reason: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  activeUser,
  onUpdateAccountBalance
}) => {
  // Arqueo State
  const [selectedArqueoAccountId, setSelectedArqueoAccountId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<string>('');
  const [arqueoNotes, setArqueoNotes] = useState<string>('');
  const [arqueoResultMsg, setArqueoResultMsg] = useState<string | null>(null);

  const selectedAccount = accounts.find(a => a.id === selectedArqueoAccountId) || accounts[0];

  const numPhysicalCount = parseFloat(physicalCount) || 0;
  const difference = selectedAccount ? numPhysicalCount - selectedAccount.balance : 0;

  const handleApplyArqueo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    if (activeUser.role !== 'admin') {
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <span>Gestión de Cajas, Cuentas Bancarias & Arqueo</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Control de existencias físicas y electrónicas (Transfermóvil, EnZona, Bandec) con detección de faltantes o sobrantes.
        </p>
      </div>

      {arqueoResultMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{arqueoResultMsg}</span>
        </div>
      )}

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const isCash = acc.accountType === 'efectivo';
          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-sans">
                  {isCash ? <Wallet className="w-4 h-4 text-emerald-400" /> : <CreditCard className="w-4 h-4 text-cyan-400" />}
                  <span>{isCash ? 'Efectivo en Caja' : 'Cuenta / Tarjeta Electrónica'}</span>
                </span>
                <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  {acc.currency}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base">{acc.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{acc.description}</p>
                {acc.accountNumber && (
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Cuenta: {acc.accountNumber}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-baseline justify-between font-mono">
                <span className="text-xs text-slate-400">Saldo Disponible:</span>
                <span className={`text-xl font-black ${acc.currency === 'CUP' ? 'text-amber-300' : 'text-emerald-400'}`}>
                  ${acc.balance.toLocaleString()} {acc.currency}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArqueoAccountId(acc.id);
                    setPhysicalCount(String(acc.balance));
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Realizar Arqueo / Conteo Físico
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arqueo de Caja Form */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
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
    </div>
  );
};
