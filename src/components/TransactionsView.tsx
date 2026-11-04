import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Ban, 
  CheckCircle, 
  Clock, 
  FileSpreadsheet, 
  Plus, 
  Calendar,
  AlertTriangle,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { Transaction, User, CurrencyCode, TransactionStatus } from '../types';
import { hasPermission } from '../services/storage';

interface TransactionsViewProps {
  transactions: Transaction[];
  activeUser: User;
  onNewTransaction: () => void;
  onOpenReceipt: (trx: Transaction) => void;
  onCancelTransaction: (id: string, reason: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  activeUser,
  onNewTransaction,
  onOpenReceipt,
  onCancelTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'compra' | 'venta'>('todos');
  const [currencyFilter, setCurrencyFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [methodFilter, setMethodFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<'hoy' | '7dias' | 'mes' | 'todos'>('todos');

  // Cancel dialog state
  const [cancellingTrx, setCancellingTrx] = useState<Transaction | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      // Search
      const matchesSearch = 
        t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientDocId.includes(searchTerm) ||
        t.operatorName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Type
      if (typeFilter !== 'todos' && t.type !== typeFilter) return false;

      // Currency
      if (currencyFilter !== 'todos' && t.currency !== currencyFilter) return false;

      // Status
      if (statusFilter !== 'todos' && t.status !== statusFilter) return false;

      // Method
      if (methodFilter !== 'todos' && t.paymentMethod !== methodFilter) return false;

      // Date
      if (dateFilter !== 'todos') {
        const trxDate = new Date(t.date);
        const now = new Date();
        if (dateFilter === 'hoy') {
          if (trxDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === '7dias') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (trxDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'mes') {
          if (trxDate.getMonth() !== now.getMonth() || trxDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [transactions, searchTerm, typeFilter, currencyFilter, statusFilter, methodFilter, dateFilter]);

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = ['Codigo', 'Fecha', 'Tipo', 'Moneda', 'Monto Divisa', 'Monto CUP', 'Tasa', 'Ganancia Spread CUP', 'Metodo Pago', 'Cliente', 'Carnet ID', 'Estado', 'Operador'];
    const rows = filtered.map(t => [
      t.code,
      t.date,
      t.type.toUpperCase(),
      t.currency,
      t.amountForeign,
      t.amountCUP,
      t.rateApplied,
      t.spreadProfitCUP,
      t.paymentMethod,
      `"${t.clientName}"`,
      t.clientDocId,
      t.status.toUpperCase(),
      `"${t.operatorName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cambiocuba_operaciones_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmCancel = () => {
    if (!cancellingTrx) return;
    if (!cancelReason.trim()) {
      alert('Debes indicar un motivo de anulación para el registro de auditoría.');
      return;
    }
    onCancelTransaction(cancellingTrx.id, cancelReason);
    setCancellingTrx(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
            <span>Registro Central de Operaciones & Transferencias</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historial de compra y venta de divisas con auditoría de cajero, tasa y contravalor en CUP.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          {hasPermission(activeUser, 'transactions_create') ? (
            <button
              onClick={onNewTransaction}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Operación</span>
            </button>
          ) : (
            <div className="bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs px-3 py-1.5 rounded-xl font-medium">
              Modo Auditor (Solo Consulta)
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (TRX-...), nombre de cliente, CI cubano o cajero..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e: any) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="todos">Todos los tipos (Compra y Venta)</option>
              <option value="compra">Solo Compras</option>
              <option value="venta">Solo Ventas</option>
            </select>
          </div>

          {/* Currency Filter */}
          <div>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="todos">Todas las monedas</option>
              <option value="USD">USD - Dólar USA</option>
              <option value="EUR">EUR - Euro</option>
              <option value="MLC">MLC - Tarjeta / Moneda</option>
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros rápidos:</span>
          </div>

          {/* Date tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['todos', 'hoy', '7dias', 'mes'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  dateFilter === d ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 'todos' ? 'Todo' : d === 'hoy' ? 'Hoy' : d === '7dias' ? '7 Días' : 'Este Mes'}
              </button>
            ))}
          </div>

          {/* Payment Method filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="todos">Cualquier canal de pago</option>
            <option value="Efectivo">Efectivo Físico</option>
            <option value="Transfermóvil">Transfermóvil</option>
            <option value="EnZona">EnZona</option>
            <option value="Transferencia Bancaria">Transferencia Bandec/BPA</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="completada">Completada</option>
            <option value="pendiente">Pendiente</option>
            <option value="anulada">Anulada</option>
          </select>

          <span className="ml-auto text-[11px] text-slate-400">
            Mostrando <strong className="text-white">{filtered.length}</strong> de {transactions.length} registros
          </span>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Código / Ref</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Monto Divisa</th>
                <th className="py-3 px-4">Tasa Aplicada</th>
                <th className="py-3 px-4">Monto en CUP</th>
                <th className="py-3 px-4">Vía de Pago</th>
                <th className="py-3 px-4">Cliente (CI)</th>
                <th className="py-3 px-4">Cajero</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-sans">
                    No se encontraron transferencias con los criterios de búsqueda aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((trx) => {
                  const isCancelled = trx.status === 'anulada';
                  return (
                    <tr 
                      key={trx.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCancelled ? 'opacity-60 bg-red-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {trx.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {trx.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                          trx.type === 'compra'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {trx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        ${trx.amountForeign.toLocaleString()} {trx.currency}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        ${trx.rateApplied} CUP
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-300 whitespace-nowrap">
                        ${trx.amountCUP.toLocaleString()} CUP
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300 whitespace-nowrap">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                          {trx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-200">
                        <div className="font-medium">{trx.clientName}</div>
                        {trx.clientDocId && (
                          <div className="text-[10px] text-slate-500 font-mono">CI: {trx.clientDocId}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                        {trx.operatorName}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          trx.status === 'completada'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : trx.status === 'anulada'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {trx.status === 'completada' && <CheckCircle className="w-3 h-3" />}
                          {trx.status === 'anulada' && <Ban className="w-3 h-3" />}
                          {trx.status}
                        </span>
                        {isCancelled && trx.cancelReason && (
                          <div className="text-[10px] text-red-400 mt-0.5 italic">
                            Motivo: {trx.cancelReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          <button
                            onClick={() => onOpenReceipt(trx)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Imprimir Comprobante Térmico"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Botón anular (solo si está completada y tiene permiso) */}
                          {!isCancelled && hasPermission(activeUser, 'transactions_cancel') && (
                            <button
                              onClick={() => setCancellingTrx(trx)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Anular Transacción y Reversar Fondos"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Anular Transacción {cancellingTrx.code}</h3>
                <p className="text-xs text-slate-400">Esta acción reversará los saldos en las cajas.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
              <div>Tipo: <strong className="text-white uppercase">{cancellingTrx.type}</strong></div>
              <div>Monto: <strong className="text-white">${cancellingTrx.amountForeign} {cancellingTrx.currency}</strong></div>
              <div>CUP entregado/recibido: <strong className="text-amber-300">${cancellingTrx.amountCUP.toLocaleString()} CUP</strong></div>
              <div>Cliente: <span className="text-slate-300 font-sans">{cancellingTrx.clientName}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo de la anulación (Requerido para Auditoría):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej. Error en conteo de billetes, solicitud del cliente, o billete deteriorado rechazado..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingTrx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirmar Anulación y Reversar Saldo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
