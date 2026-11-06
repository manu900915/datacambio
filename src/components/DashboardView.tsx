import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  Coins, 
  Wallet, 
  Clock, 
  Printer, 
  AlertCircle, 
  Plus, 
  Calculator,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Building2,
  CheckCircle2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { 
  Transaction, 
  ExchangeRate, 
  Account, 
  User, 
  CurrencyCode 
} from '../types';
import { hasPermission } from '../services/storage';

interface DashboardViewProps {
  transactions: Transaction[];
  rates: ExchangeRate[];
  accounts: Account[];
  activeUser: User;
  onNewTransaction: () => void;
  onOpenReceipt: (trx: Transaction) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  rates,
  accounts,
  activeUser,
  onNewTransaction,
  onOpenReceipt,
  onNavigateTab
}) => {
  // Quick Calculator state
  const [calcAmount, setCalcAmount] = useState<string>('100');
  const [calcCurrency, setCalcCurrency] = useState<CurrencyCode>('USD');
  const [calcType, setCalcType] = useState<'compra' | 'venta'>('compra');

  // Filter today's transactions (in Cuba, transactions for the current day)
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr) && t.status !== 'anulada');

  const todayBuys = todayTransactions.filter(t => t.type === 'compra');
  const todaySells = todayTransactions.filter(t => t.type === 'venta');

  const todayBuyTotalUSD = todayBuys.filter(t => t.currency === 'USD').reduce((sum, t) => sum + t.amountForeign, 0);
  const todaySellTotalUSD = todaySells.filter(t => t.currency === 'USD').reduce((sum, t) => sum + t.amountForeign, 0);

  const todayTotalCUPPaid = todayBuys.reduce((sum, t) => sum + t.amountCUP, 0);
  const todayTotalCUPReceived = todaySells.reduce((sum, t) => sum + t.amountCUP, 0);

  const todayProfitCUP = todayTransactions.reduce((sum, t) => sum + (t.spreadProfitCUP || 0), 0);

  // Total liquidity across accounts
  const totalUSDInAccounts = accounts.filter(a => a.currency === 'USD').reduce((sum, a) => sum + a.balance, 0);
  const totalCUPInAccounts = accounts.filter(a => a.currency === 'CUP').reduce((sum, a) => sum + a.balance, 0);
  const totalMLCInAccounts = accounts.filter(a => a.currency === 'MLC').reduce((sum, a) => sum + a.balance, 0);
  const totalEURInAccounts = accounts.filter(a => a.currency === 'EUR').reduce((sum, a) => sum + a.balance, 0);

  // Approximate valuation in CUP
  const usdRate = rates.find(r => r.currency === 'USD')?.buyRate || 925;
  const eurRate = rates.find(r => r.currency === 'EUR')?.buyRate || 1010;
  const mlcRate = rates.find(r => r.currency === 'MLC')?.buyRate || 702;
  const totalValuationCUP = totalCUPInAccounts + (totalUSDInAccounts * usdRate) + (totalEURInAccounts * eurRate) + (totalMLCInAccounts * mlcRate);

  // Calculator computation
  const activeRate = rates.find(r => r.currency === calcCurrency);
  const appliedCalcRate = activeRate ? (calcType === 'compra' ? activeRate.buyRate : activeRate.sellRate) : 925;
  const calcResultCUP = Math.round((parseFloat(calcAmount) || 0) * appliedCalcRate);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Control de Divisas & Caja en Tiempo Real
            </h1>
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              En Vivo
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Sesión activa: <span className="text-slate-200 font-semibold">{activeUser.name}</span> • Terminal Mostrador
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasPermission(activeUser, 'rates_edit') && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('rates')}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Ajustar Tasas del Día</span>
              </button>
              <button
                onClick={() => onNavigateTab('rates')}
                className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                title="Sincronizar cotizaciones con elTOQUE (TRMI) mediante API oficial"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">elTOQUE API</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            </div>
          )}

          {hasPermission(activeUser, 'transactions_create') ? (
            <button
              onClick={onNewTransaction}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Operación</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-medium px-4 py-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Modo Auditor (Solo Lectura)</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Compras de Hoy */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compras Hoy</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${todayBuyTotalUSD.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>CUP entregado:</span>
            <span className="font-mono text-slate-300 font-medium">${todayTotalCUPPaid.toLocaleString()} CUP</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            {todayBuys.length} operaciones registradas
          </div>
        </div>

        {/* Total Ventas de Hoy */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventas Hoy</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${todaySellTotalUSD.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>CUP ingresado:</span>
            <span className="font-mono text-slate-300 font-medium">${todayTotalCUPReceived.toLocaleString()} CUP</span>
          </div>
          <div className="text-[11px] text-blue-400 font-semibold mt-1">
            {todaySells.length} operaciones registradas
          </div>
        </div>

        {/* Margen / Spread Neto */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ganancia Spread</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            +${todayProfitCUP.toLocaleString()} <span className="text-xs text-slate-400 font-normal">CUP</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Equiv. en USD:</span>
            <span className="font-mono text-slate-300 font-medium">~${(todayProfitCUP / usdRate).toFixed(2)} USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Margen de intermediación cambiaria
          </div>
        </div>

        {/* Patrimonio Consolidado en Caja */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activos en Caja</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            ${Math.round(totalValuationCUP).toLocaleString()} <span className="text-xs text-slate-400 font-normal">CUP</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>En Divisas Físicas:</span>
            <span className="font-mono text-slate-300 font-medium">${totalUSDInAccounts.toLocaleString()} USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Valoración total consolidada
          </div>
        </div>
      </div>

      {/* Main Grid: Live Rates & Fast Calculator + Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasas del Mercado Cubano */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjetas de Tasas Actuales */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Pizarra de Tasas de Cambio Vigentes</h3>
              </div>
              <button
                onClick={() => onNavigateTab('rates')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Historial & Ajustes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rates.map((rate) => {
                const spread = rate.sellRate - rate.buyRate;
                const spreadPercent = ((spread / rate.buyRate) * 100).toFixed(1);
                return (
                  <div
                    key={rate.currency}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-lg text-white">{rate.currency}</span>
                      <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        Ref: {rate.marketReference || rate.sellRate} CUP
                      </span>
                    </div>

                    <div className="space-y-2 mt-3 font-mono">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Compra (C):</span>
                        <span className="font-bold text-emerald-400 text-sm">${rate.buyRate} CUP</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Venta (V):</span>
                        <span className="font-bold text-blue-400 text-sm">${rate.sellRate} CUP</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Spread:</span>
                        <span className="text-amber-400 font-semibold">+{spread} CUP ({spreadPercent}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Operations Table Preview */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-white text-base">Últimas Operaciones en Tiempo Real</h3>
              </div>
              <button
                onClick={() => onNavigateTab('transactions')}
                className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas ({transactions.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Monto Divisa</th>
                    <th className="py-2.5 px-3">Tasa</th>
                    <th className="py-2.5 px-3">Total CUP</th>
                    <th className="py-2.5 px-3">Vía</th>
                    <th className="py-2.5 px-3 text-right">Recibo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {transactions.slice(0, 5).map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-300">{trx.code}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                          trx.type === 'compra' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {trx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-200">{trx.clientName}</td>
                      <td className="py-3 px-3 font-bold text-white">
                        ${trx.amountForeign.toLocaleString()} {trx.currency}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{trx.rateApplied} CUP</td>
                      <td className="py-3 px-3 font-bold text-amber-300">
                        ${trx.amountCUP.toLocaleString()} CUP
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-400">{trx.paymentMethod}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenReceipt(trx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Imprimir ticket térmico"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Calculadora Rápida & Estado de Cajas */}
        <div className="space-y-6">
          {/* Calculadora Rápida de Mostrador */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Calculadora de Mostrador</h3>
            </div>

            <div className="space-y-4">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCalcType('compra')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    calcType === 'compra' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Comprar (Cliente entrega)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcType('venta')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    calcType === 'venta' ? 'bg-blue-500 text-white' : 'text-slate-400'
                  }`}
                >
                  Vender (Cliente compra)
                </button>
              </div>

              {/* Currency Selector */}
              <div className="grid grid-cols-3 gap-2">
                {(['USD', 'EUR', 'MLC'] as CurrencyCode[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCalcCurrency(c)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      calcCurrency === c
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Monto en {calcCurrency}:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcAmount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const clean = val === '' ? '' : (val === '0' || val.startsWith('0.')) ? val : val.replace(/^0+([1-9])/, '$1');
                      setCalcAmount(clean);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-16 py-2 text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-300 pointer-events-none select-none">
                    {calcCurrency}
                  </div>
                </div>
              </div>

              {/* Rate & Result Card */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Tasa actual aplicada:</span>
                  <span className="font-mono text-slate-200">1 {calcCurrency} = {appliedCalcRate} CUP</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300">
                    {calcType === 'compra' ? 'Pagar al cliente:' : 'Cobrar al cliente:'}
                  </span>
                  <span className="text-xl font-black text-amber-300 font-mono">
                    ${calcResultCUP.toLocaleString()} CUP
                  </span>
                </div>
              </div>

              {hasPermission(activeUser, 'transactions_create') ? (
                <button
                  onClick={onNewTransaction}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Transferir este cálculo a operación</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="w-full py-2 bg-slate-950 border border-slate-800 text-slate-500 text-xs text-center rounded-xl font-medium">
                  Modo Auditor: Operaciones deshabilitadas (Solo cálculo)
                </div>
              )}
            </div>
          </div>

          {/* Cajas y Cuentas Balances */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Disponibilidad en Cajas</h3>
              </div>
              <button
                onClick={() => onNavigateTab('accounts')}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Arqueo
              </button>
            </div>

            <div className="space-y-3 font-mono">
              {accounts.slice(0, 4).map(acc => (
                <div key={acc.id} className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-sans font-medium text-xs text-slate-200">{acc.name}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{acc.description}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${acc.currency === 'CUP' ? 'text-amber-300' : 'text-emerald-400'}`}>
                      ${acc.balance.toLocaleString()} {acc.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
