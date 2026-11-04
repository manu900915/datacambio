import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Download, 
  Printer, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Users, 
  CreditCard,
  CheckCircle,
  PieChart,
  BarChart3
} from 'lucide-react';
import { Transaction, User, ExchangeRate } from '../types';

interface ReportsViewProps {
  transactions: Transaction[];
  rates: ExchangeRate[];
  activeUser: User;
}

type PeriodType = 'diario' | 'semanal' | 'mensual' | 'personalizado';

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  rates,
  activeUser
}) => {
  const [period, setPeriod] = useState<PeriodType>('diario');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showClosingSheet, setShowClosingSheet] = useState<boolean>(false);

  // Filter transactions according to period
  const reportTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    return transactions.filter(t => {
      if (t.status === 'anulada') return false; // exclude cancelled transactions from financial reports

      const tDate = new Date(t.date);

      if (period === 'diario') {
        return t.date.startsWith(todayStr);
      } else if (period === 'semanal') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tDate >= weekAgo;
      } else if (period === 'mensual') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      } else if (period === 'personalizado') {
        if (customStartDate && t.date < customStartDate) return false;
        if (customEndDate && t.date > customEndDate + ' 23:59:59') return false;
        return true;
      }
      return true;
    });
  }, [transactions, period, customStartDate, customEndDate]);

  // Aggregate stats
  const totalOperations = reportTransactions.length;
  const buys = reportTransactions.filter(t => t.type === 'compra');
  const sells = reportTransactions.filter(t => t.type === 'venta');

  const buyVolumeUSD = buys.filter(t => t.currency === 'USD').reduce((s, t) => s + t.amountForeign, 0);
  const sellVolumeUSD = sells.filter(t => t.currency === 'USD').reduce((s, t) => s + t.amountForeign, 0);

  const buyVolumeEUR = buys.filter(t => t.currency === 'EUR').reduce((s, t) => s + t.amountForeign, 0);
  const sellVolumeEUR = sells.filter(t => t.currency === 'EUR').reduce((s, t) => s + t.amountForeign, 0);

  const buyVolumeMLC = buys.filter(t => t.currency === 'MLC').reduce((s, t) => s + t.amountForeign, 0);
  const sellVolumeMLC = sells.filter(t => t.currency === 'MLC').reduce((s, t) => s + t.amountForeign, 0);

  const totalCUPPaidOut = buys.reduce((s, t) => s + t.amountCUP, 0);
  const totalCUPReceived = sells.reduce((s, t) => s + t.amountCUP, 0);
  const totalCUPTurnover = totalCUPPaidOut + totalCUPReceived;

  const totalSpreadProfitCUP = reportTransactions.reduce((s, t) => s + (t.spreadProfitCUP || 0), 0);

  const avgTicketCUP = totalOperations > 0 ? Math.round(totalCUPTurnover / totalOperations) : 0;

  // Breakdown by payment method
  const methodStats = useMemo(() => {
    const map: Record<string, { count: number; totalCUP: number }> = {};
    reportTransactions.forEach(t => {
      if (!map[t.paymentMethod]) map[t.paymentMethod] = { count: 0, totalCUP: 0 };
      map[t.paymentMethod].count += 1;
      map[t.paymentMethod].totalCUP += t.amountCUP;
    });
    return Object.entries(map);
  }, [reportTransactions]);

  // Breakdown by operator
  const operatorStats = useMemo(() => {
    const map: Record<string, { count: number; totalCUP: number; profit: number }> = {};
    reportTransactions.forEach(t => {
      if (!map[t.operatorName]) map[t.operatorName] = { count: 0, totalCUP: 0, profit: 0 };
      map[t.operatorName].count += 1;
      map[t.operatorName].totalCUP += t.amountCUP;
      map[t.operatorName].profit += (t.spreadProfitCUP || 0);
    });
    return Object.entries(map);
  }, [reportTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'diario': return 'Reporte Diario (Cierre de Hoy)';
      case 'semanal': return 'Reporte Semanal (Últimos 7 Días)';
      case 'mensual': return 'Reporte Mensual (Mes en Curso)';
      case 'personalizado': return 'Reporte de Período Personalizado';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Módulo de Reportes & Cierre Financiero</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generación de balances diarios, semanales y mensuales con análisis de utilidades por spread.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowClosingSheet(!showClosingSheet)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{showClosingSheet ? 'Ocultar Acta de Cierre' : 'Generar Acta de Cierre'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Imprimir / Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs (no-print) */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg no-print flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['diario', 'semanal', 'mensual', 'personalizado'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                period === p
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'diario' ? 'Diario (Hoy)' : p === 'semanal' ? 'Semanal' : p === 'mensual' ? 'Mensual' : 'Personalizado'}
            </button>
          ))}
        </div>

        {period === 'personalizado' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Desde:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
            />
            <span className="text-slate-400">Hasta:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
            />
          </div>
        )}

        <div className="text-xs text-slate-400">
          Mostrando datos de: <strong className="text-emerald-400">{getPeriodLabel()}</strong>
        </div>
      </div>

      {/* Printable Cash Closing Sheet (Acta Oficial de Arqueo y Cierre) */}
      {showClosingSheet && (
        <div className="p-8 bg-white text-slate-900 rounded-2xl border border-slate-300 shadow-2xl font-mono text-xs space-y-6">
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <h1 className="text-xl font-black tracking-tight text-slate-900">CAMBIOCUBA PRO</h1>
            <p className="text-sm font-semibold text-slate-700 uppercase">Acta Oficial de Cierre y Liquidación de Operaciones</p>
            <p className="text-xs text-slate-500">Período: {getPeriodLabel()} • Generado el {new Date().toLocaleString('es-CU')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-300 pb-4">
            <div>
              <p><strong>Cajero / Responsable:</strong> {activeUser.name}</p>
              <p><strong>Rol en Sistema:</strong> {activeUser.role.toUpperCase()}</p>
              <p><strong>Total Operaciones Válidas:</strong> {totalOperations}</p>
            </div>
            <div className="text-right">
              <p><strong>Estado:</strong> <span className="text-emerald-700 font-bold">CUADRADO Y VERIFICADO</span></p>
              <p><strong>Utilidad Neta por Spread:</strong> ${totalSpreadProfitCUP.toLocaleString()} CUP</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase mb-2 border-b border-slate-300 pb-1">
              Resumen de Movimiento de Divisas Extranjeras
            </h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-400">
                  <th className="py-1">Moneda</th>
                  <th className="py-1">Comprado (Ingreso a Caja)</th>
                  <th className="py-1">Vendido (Salida de Caja)</th>
                  <th className="py-1">Flujo Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-1 font-bold">USD (Dólares)</td>
                  <td className="py-1 text-emerald-700">+${buyVolumeUSD.toLocaleString()} USD</td>
                  <td className="py-1 text-blue-700">-${sellVolumeUSD.toLocaleString()} USD</td>
                  <td className="py-1 font-bold">${(buyVolumeUSD - sellVolumeUSD).toLocaleString()} USD</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">EUR (Euros)</td>
                  <td className="py-1 text-emerald-700">+€{buyVolumeEUR.toLocaleString()} EUR</td>
                  <td className="py-1 text-blue-700">-€{sellVolumeEUR.toLocaleString()} EUR</td>
                  <td className="py-1 font-bold">€{(buyVolumeEUR - sellVolumeEUR).toLocaleString()} EUR</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">MLC (Tarjetas)</td>
                  <td className="py-1 text-emerald-700">+${buyVolumeMLC.toLocaleString()} MLC</td>
                  <td className="py-1 text-blue-700">-${sellVolumeMLC.toLocaleString()} MLC</td>
                  <td className="py-1 font-bold">${(buyVolumeMLC - sellVolumeMLC).toLocaleString()} MLC</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase mb-2 border-b border-slate-300 pb-1">
              Flujo Financiero en Moneda Nacional (CUP)
            </h3>
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block">Total CUP Pagado en Compras:</span>
                <span className="text-base font-bold text-slate-800">${totalCUPPaidOut.toLocaleString()} CUP</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total CUP Cobrado en Ventas:</span>
                <span className="text-base font-bold text-slate-800">${totalCUPReceived.toLocaleString()} CUP</span>
              </div>
              <div>
                <span className="text-slate-500 block">Spread Bruto Generado:</span>
                <span className="text-base font-black text-emerald-800">+${totalSpreadProfitCUP.toLocaleString()} CUP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-12 text-center text-xs">
            <div>
              <div className="border-b border-slate-600 h-10 mb-2"></div>
              <p className="font-bold">{activeUser.name}</p>
              <p className="text-slate-500">Firma del Cajero Responsable</p>
            </div>
            <div>
              <div className="border-b border-slate-600 h-10 mb-2"></div>
              <p className="font-bold">Administrador General</p>
              <p className="text-slate-500">Firma de Conformidad y Auditoría</p>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Operaciones */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Operaciones</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalOperations}</div>
          <div className="text-xs text-slate-400 mt-2 flex justify-between">
            <span>Compras: <strong className="text-emerald-400">{buys.length}</strong></span>
            <span>Ventas: <strong className="text-blue-400">{sells.length}</strong></span>
          </div>
        </div>

        {/* Volumen Total CUP */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Volumen en CUP</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            ${totalCUPTurnover.toLocaleString()} <span className="text-xs text-slate-400 font-normal">CUP</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Ticket promedio: <span className="font-mono text-slate-200">${avgTicketCUP.toLocaleString()} CUP</span>
          </div>
        </div>

        {/* Divisas Compradas */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Divisas Captadas (Compras)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            ${buyVolumeUSD.toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            +€{buyVolumeEUR.toLocaleString()} EUR • +${buyVolumeMLC.toLocaleString()} MLC
          </div>
        </div>

        {/* Ganancia Neta por Spread */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Ganancia Neta (Spread)</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            +${totalSpreadProfitCUP.toLocaleString()} <span className="text-xs text-slate-400 font-normal">CUP</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Utilidad comercial neta del período
          </div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Canales y Métodos de Pago */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Volumen por Método de Pago & Canal</span>
          </h3>

          <div className="space-y-3 font-mono">
            {methodStats.map(([method, data]) => {
              const percent = totalCUPTurnover > 0 ? Math.round((data.totalCUP / totalCUPTurnover) * 100) : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-sans text-slate-300 font-medium">{method} ({data.count} ops)</span>
                    <span className="text-amber-300 font-bold">${data.totalCUP.toLocaleString()} CUP ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rendimiento por Cajero / Operador */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Rendimiento & Cuadre por Cajero Operador</span>
          </h3>

          <div className="space-y-3 font-mono">
            {operatorStats.map(([operator, data]) => (
              <div key={operator} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="font-sans font-bold text-xs text-slate-200">{operator}</div>
                  <div className="text-[11px] text-slate-500 font-sans">{data.count} operaciones procesadas</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-300 font-bold">${data.totalCUP.toLocaleString()} CUP</div>
                  <div className="text-[10px] text-emerald-400">Spread: +${data.profit.toLocaleString()} CUP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
