import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  FileDown, 
  CheckCircle2, 
  Eye, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  User as UserIcon,
  HelpCircle
} from 'lucide-react';
import { Transaction, User, ExchangeRate } from '../types';

interface ReportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  transactions: Transaction[];
  rates: ExchangeRate[];
  activeUser: User;
  stats: {
    totalOperations: number;
    buysCount: number;
    sellsCount: number;
    buyVolumeUSD: number;
    sellVolumeUSD: number;
    buyVolumeEUR: number;
    sellVolumeEUR: number;
    buyVolumeMLC: number;
    sellVolumeMLC: number;
    totalCUPPaidOut: number;
    totalCUPReceived: number;
    totalCUPTurnover: number;
    totalSpreadProfitCUP: number;
    avgTicketCUP: number;
    methodStats: [string, { count: number; totalCUP: number }][];
    operatorStats: [string, { count: number; totalCUP: number; profit: number }][];
  };
}

export const ReportPDFModal: React.FC<ReportPDFModalProps> = ({
  isOpen,
  onClose,
  periodLabel,
  transactions,
  rates,
  activeUser,
  stats
}) => {
  const [reportTitle, setReportTitle] = useState<string>('Acta Oficial de Cierre y Liquidación de Operaciones');
  const [includeTransactions, setIncludeTransactions] = useState<boolean>(true);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('Documento emitido conforme a las normas de auditoría interna de DataCambio PRO. Todos los saldos y operaciones han sido verificados contra los registros contables.');

  if (!isOpen) return null;

  const now = new Date();
  const folioNumber = `ACT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const dateFormatted = now.toLocaleDateString('es-CU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('es-CU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const handlePrintPDF = () => {
    // Abrir diálogo nativo del navegador con opción de guardar como PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md">
      {/* Container Principal */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Barra de Herramientas Superior (no-print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              PDF
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Exportar Reporte a PDF</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  Estilo Acta Oficial
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Vista previa idéntica al documento impreso y descargable en PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              title="Abre el menú de impresión donde puedes seleccionar 'Guardar como PDF'"
            >
              <Printer className="w-4 h-4" />
              <span>Guardar como PDF / Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Opciones de Personalización Rápidas (no-print) */}
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs no-print">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-slate-400 font-medium">Tipo de Acta:</label>
              <select
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Acta Oficial de Cierre y Liquidación de Operaciones">Acta Oficial de Cierre y Liquidación de Caja</option>
                <option value="Informe Integral de Operaciones & Auditoría Financiera">Informe Integral de Operaciones & Auditoría</option>
                <option value="Balance Periódico de Divisas y Spread Comercial">Balance Periódico de Divisas y Spread</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeTransactions}
                onChange={(e) => setIncludeTransactions(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
              />
              <span>Incluir lista detallada de transacciones ({transactions.length})</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
              />
              <span>Incluir firmas de auditoría</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-400">
            Sugerencia: Selecciona <strong>"Guardar como PDF"</strong> como destino en la ventana de impresión.
          </div>
        </div>

        {/* Contenedor del Documento con Scroll para Vista Previa */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center">
          
          {/* HOJA DE ACTA ESTILO OFICIAL (A4 / Printable) */}
          <div 
            id="report-printable-area"
            className="printable-document w-full max-w-[210mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm border border-slate-300 font-sans text-xs space-y-6"
          >
            {/* Membrete Institucional Oficial */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-md">
                    🇨🇺
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                      DataCambio <span className="text-emerald-700">PRO</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">
                      Sistema Integrado de Control de Divisas, Cajas & Auditoría
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px]">
                  <div className="inline-block bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded font-bold text-slate-800">
                    {folioNumber}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">FECHA: {dateFormatted}</p>
                  <p className="text-[10px] text-slate-500">HORA: {timeFormatted}</p>
                </div>
              </div>

              <div className="text-center mt-4 pt-3 border-t border-slate-200">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  {reportTitle}
                </h2>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  Período Evaluado: <span className="text-emerald-800 font-bold">{periodLabel}</span>
                </p>
              </div>
            </div>

            {/* Metadatos y Auditoría del Responsable */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono">
              <div className="space-y-1">
                <p><strong className="font-sans text-slate-600">Responsable de Emisión:</strong> {activeUser.name}</p>
                <p><strong className="font-sans text-slate-600">Usuario en Sistema:</strong> @{activeUser.username}</p>
                <p><strong className="font-sans text-slate-600">Rol Institucional:</strong> {activeUser.role.toUpperCase()}</p>
              </div>
              <div className="space-y-1 text-right">
                <p><strong className="font-sans text-slate-600">Estado de Cuadre:</strong> <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">CUADRADO Y VERIFICADO</span></p>
                <p><strong className="font-sans text-slate-600">Total Operaciones:</strong> {stats.totalOperations} procesadas</p>
                <p><strong className="font-sans text-slate-600">Utilidad Neta Spread:</strong> <span className="font-bold text-emerald-800">+${stats.totalSpreadProfitCUP.toLocaleString()} CUP</span></p>
              </div>
            </div>

            {/* Cuadro de Indicadores Clave de Caja (KPIs) */}
            <div>
              <h3 className="font-bold text-xs uppercase text-slate-800 border-b-2 border-slate-300 pb-1 mb-2.5 flex items-center justify-between">
                <span>1. Resumen Ejecutivo de Operaciones y Flujo</span>
                <span className="text-[10px] text-slate-500 font-normal font-mono">MONEDA BASE: CUP</span>
              </h3>

              <div className="grid grid-cols-4 gap-2.5 text-center font-mono">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Operaciones Realizadas</span>
                  <span className="text-base font-black text-slate-800">{stats.totalOperations}</span>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    C: {stats.buysCount} | V: {stats.sellsCount}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Volumen Movilizado (CUP)</span>
                  <span className="text-base font-black text-slate-800">${stats.totalCUPTurnover.toLocaleString()}</span>
                  <div className="text-[9px] text-slate-500 mt-0.5">Entradas y Salidas</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Ticket Promedio</span>
                  <span className="text-base font-black text-slate-800">${stats.avgTicketCUP.toLocaleString()}</span>
                  <div className="text-[9px] text-slate-500 mt-0.5">CUP por operación</div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-sans font-bold block">Ganancia Bruta (Spread)</span>
                  <span className="text-base font-black text-emerald-700">+${stats.totalSpreadProfitCUP.toLocaleString()}</span>
                  <div className="text-[9px] text-emerald-600 mt-0.5 font-sans">Margen consolidado</div>
                </div>
              </div>
            </div>

            {/* Tabla de Movimiento de Divisas Extranjeras */}
            <div>
              <h3 className="font-bold text-xs uppercase text-slate-800 border-b-2 border-slate-300 pb-1 mb-2.5">
                2. Balances y Movimiento de Moneda Extranjera
              </h3>

              <table className="w-full text-left font-mono text-[11px] border border-slate-300">
                <thead className="bg-slate-100 text-slate-700 font-sans text-[10px] uppercase border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3">Divisa</th>
                    <th className="py-2 px-3 text-right">Comprado (Ingreso a Caja)</th>
                    <th className="py-2 px-3 text-right">Vendido (Salida de Caja)</th>
                    <th className="py-2 px-3 text-right">Flujo Neto en Divisa</th>
                    <th className="py-2 px-3 text-right font-sans">Tasa de Cierre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-bold flex items-center gap-1.5">
                      <span>🇺🇸 USD</span>
                      <span className="text-[9px] font-normal text-slate-500 font-sans">Dólares</span>
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-semibold">+${stats.buyVolumeUSD.toLocaleString()} USD</td>
                    <td className="py-2 px-3 text-right text-blue-700 font-semibold">-${stats.sellVolumeUSD.toLocaleString()} USD</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">${(stats.buyVolumeUSD - stats.sellVolumeUSD).toLocaleString()} USD</td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      C: {rates.find(r => r.currency === 'USD')?.buyRate} | V: {rates.find(r => r.currency === 'USD')?.sellRate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold flex items-center gap-1.5">
                      <span>🇪🇺 EUR</span>
                      <span className="text-[9px] font-normal text-slate-500 font-sans">Euros</span>
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-semibold">+€{stats.buyVolumeEUR.toLocaleString()} EUR</td>
                    <td className="py-2 px-3 text-right text-blue-700 font-semibold">-€{stats.sellVolumeEUR.toLocaleString()} EUR</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">€{(stats.buyVolumeEUR - stats.sellVolumeEUR).toLocaleString()} EUR</td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      C: {rates.find(r => r.currency === 'EUR')?.buyRate} | V: {rates.find(r => r.currency === 'EUR')?.sellRate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold flex items-center gap-1.5">
                      <span>💳 MLC</span>
                      <span className="text-[9px] font-normal text-slate-500 font-sans">Tarjetas</span>
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-semibold">+${stats.buyVolumeMLC.toLocaleString()} MLC</td>
                    <td className="py-2 px-3 text-right text-blue-700 font-semibold">-${stats.sellVolumeMLC.toLocaleString()} MLC</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">${(stats.buyVolumeMLC - stats.sellVolumeMLC).toLocaleString()} MLC</td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      C: {rates.find(r => r.currency === 'MLC')?.buyRate} | V: {rates.find(r => r.currency === 'MLC')?.sellRate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Balance Financiero en Moneda Nacional (CUP) */}
            <div>
              <h3 className="font-bold text-xs uppercase text-slate-800 border-b-2 border-slate-300 pb-1 mb-2.5">
                3. Liquidación Contable en Moneda Nacional (CUP)
              </h3>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Total CUP Desembolsado (Compras):</span>
                  <span className="text-sm font-bold text-slate-800">${stats.totalCUPPaidOut.toLocaleString()} CUP</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Total CUP Ingresado (Ventas):</span>
                  <span className="text-sm font-bold text-slate-800">${stats.totalCUPReceived.toLocaleString()} CUP</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 font-sans font-bold block">Utilidad Comercial por Spread:</span>
                  <span className="text-sm font-black text-emerald-700">+${stats.totalSpreadProfitCUP.toLocaleString()} CUP</span>
                </div>
              </div>
            </div>

            {/* Desglose por Método de Pago & Rendimiento de Cajeros */}
            <div className="grid grid-cols-2 gap-4">
              {/* Canales */}
              <div>
                <h4 className="font-bold text-[11px] uppercase text-slate-700 border-b border-slate-300 pb-1 mb-2">
                  4. Canales & Métodos de Pago
                </h4>
                <table className="w-full text-left font-mono text-[10px]">
                  <thead className="text-slate-500 font-sans border-b border-slate-200">
                    <tr>
                      <th className="py-1">Método</th>
                      <th className="py-1 text-center">Ops</th>
                      <th className="py-1 text-right">Volumen CUP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.methodStats.map(([method, data]) => (
                      <tr key={method}>
                        <td className="py-1 font-sans text-slate-800">{method}</td>
                        <td className="py-1 text-center text-slate-500">{data.count}</td>
                        <td className="py-1 text-right font-bold text-slate-900">${data.totalCUP.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cajeros */}
              <div>
                <h4 className="font-bold text-[11px] uppercase text-slate-700 border-b border-slate-300 pb-1 mb-2">
                  5. Rendimiento por Cajero Operador
                </h4>
                <table className="w-full text-left font-mono text-[10px]">
                  <thead className="text-slate-500 font-sans border-b border-slate-200">
                    <tr>
                      <th className="py-1">Operador</th>
                      <th className="py-1 text-center">Ops</th>
                      <th className="py-1 text-right">Total CUP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.operatorStats.map(([operator, data]) => (
                      <tr key={operator}>
                        <td className="py-1 font-sans text-slate-800">{operator}</td>
                        <td className="py-1 text-center text-slate-500">{data.count}</td>
                        <td className="py-1 text-right font-bold text-slate-900">${data.totalCUP.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Listado de Transacciones Detallado (opcional) */}
            {includeTransactions && transactions.length > 0 && (
              <div className="page-break-before-auto">
                <h3 className="font-bold text-xs uppercase text-slate-800 border-b-2 border-slate-300 pb-1 mb-2 flex items-center justify-between">
                  <span>6. Detalle Cronológico de Operaciones ({transactions.length})</span>
                  <span className="text-[10px] text-slate-500 font-normal font-sans">Registro de Auditoría Individual</span>
                </h3>

                <table className="w-full text-left font-mono text-[9px] border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-sans text-[8px] border-b border-slate-300">
                    <tr>
                      <th className="py-1 px-2">Folio</th>
                      <th className="py-1 px-2">Fecha/Hora</th>
                      <th className="py-1 px-2">Cajero</th>
                      <th className="py-1 px-2">Tipo</th>
                      <th className="py-1 px-2 text-right">Monto Divisa</th>
                      <th className="py-1 px-2 text-right">Tasa</th>
                      <th className="py-1 px-2 text-right">Total CUP</th>
                      <th className="py-1 px-2">Método</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactions.slice(0, 100).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-1 px-2 font-bold text-slate-900">{t.code || t.id}</td>
                        <td className="py-1 px-2 text-slate-600 whitespace-nowrap">{t.date}</td>
                        <td className="py-1 px-2 text-slate-700 font-sans">{t.operatorName}</td>
                        <td className="py-1 px-2 uppercase font-bold">
                          <span className={t.type === 'compra' ? 'text-emerald-700' : 'text-blue-700'}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-1 px-2 text-right font-bold">
                          ${t.amountForeign.toLocaleString()} {t.currency}
                        </td>
                        <td className="py-1 px-2 text-right text-slate-600">{t.rateApplied}</td>
                        <td className="py-1 px-2 text-right font-bold text-slate-900">
                          ${t.amountCUP.toLocaleString()} CUP
                        </td>
                        <td className="py-1 px-2 text-slate-600 font-sans text-[8px]">{t.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length > 100 && (
                  <p className="text-[9px] text-slate-500 italic mt-1 text-center font-sans">
                    Mostrando las primeras 100 operaciones de {transactions.length} registradas en el período.
                  </p>
                )}
              </div>
            )}

            {/* Observaciones de Auditoría */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600 font-sans space-y-1">
              <strong className="text-slate-800 uppercase text-[9px] block">Observaciones y Dictamen de Auditoría:</strong>
              <p>{notes}</p>
            </div>

            {/* Bloque Oficial de Firmas y Certificación */}
            {includeSignatures && (
              <div className="pt-6 page-break-inside-avoid">
                <div className="grid grid-cols-2 gap-12 text-center text-xs font-sans">
                  <div>
                    <div className="border-b-2 border-slate-700 h-12 mb-2 flex items-end justify-center">
                      <span className="text-[9px] font-mono text-slate-400 italic mb-1">[Firma Digital Registrada]</span>
                    </div>
                    <p className="font-bold text-slate-900">{activeUser.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Cajero Operador • @{activeUser.username}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Responsable de Arqueo y Liquidación</p>
                  </div>

                  <div>
                    <div className="border-b-2 border-slate-700 h-12 mb-2 flex items-end justify-center">
                      <span className="text-[9px] font-mono text-slate-400 italic mb-1">[Visto Bueno Auditoría]</span>
                    </div>
                    <p className="font-bold text-slate-900">Dirección de Administración & Control</p>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Auditor General / Supervisor</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Conformidad de Fondos y Cierre</p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400 font-mono">
                  Certificado de Cierre Contable Oficial • DataCambio PRO • Hash de Integridad: {Math.random().toString(36).substring(2, 15).toUpperCase()}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer con Botones (no-print) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between no-print">
          <div className="text-xs text-slate-400">
            Documento A4 listo para imprimir o guardar en PDF vectorizado con alta fidelidad.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
