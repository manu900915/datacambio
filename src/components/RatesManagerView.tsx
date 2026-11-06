import React, { useState } from 'react';
import { 
  TrendingUp, 
  Coins, 
  History, 
  Save, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  RefreshCw,
  ExternalLink,
  Zap
} from 'lucide-react';
import { ExchangeRate, RateHistoryItem, User, CurrencyCode } from '../types';
import { hasPermission } from '../services/storage';
import { ElToqueSyncModal } from './ElToqueSyncModal';

interface RatesManagerViewProps {
  rates: ExchangeRate[];
  rateHistory: RateHistoryItem[];
  activeUser: User;
  onUpdateRate: (currency: CurrencyCode, buyRate: number, sellRate: number, note: string) => void;
  onSyncElToqueRates?: (
    updates: { currency: CurrencyCode; buyRate: number; sellRate: number; marketReference?: number }[],
    note: string
  ) => void;
}

export const RatesManagerView: React.FC<RatesManagerViewProps> = ({
  rates,
  rateHistory,
  activeUser,
  onUpdateRate,
  onSyncElToqueRates
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [isElToqueModalOpen, setIsElToqueModalOpen] = useState<boolean>(false);
  const [buyRateStr, setBuyRateStr] = useState<string>('325');
  const [sellRateStr, setSellRateStr] = useState<string>('335');
  const [note, setNote] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentSelectedRate = rates.find(r => r.currency === selectedCurrency) || rates[0];

  // Helper para limpiar ceros a la izquierda molestos (ej: '0850' -> '850')
  const cleanNumberInput = (val: string) => {
    if (val === '') return '';
    // Permitir decimales como 0.5 o 0.
    if (val === '0' || val.startsWith('0.')) return val;
    // Si escribe números tras un cero como 0850, eliminar el cero sobrante
    return val.replace(/^0+([1-9])/, '$1');
  };

  // Sync inputs when currency changes
  const handleSelectCurrency = (cur: CurrencyCode) => {
    setSelectedCurrency(cur);
    const r = rates.find(rate => rate.currency === cur);
    if (r) {
      setBuyRateStr(String(r.buyRate));
      setSellRateStr(String(r.sellRate));
    }
  };

  const handlePreset = (buy: number, sell: number, presetName: string) => {
    setBuyRateStr(String(buy));
    setSellRateStr(String(sell));
    setNote(`Ajuste según ${presetName}`);
  };

  const numBuyRate = parseFloat(buyRateStr) || 0;
  const numSellRate = parseFloat(sellRateStr) || 0;

  const handleStepBuy = (delta: number) => {
    const current = parseFloat(buyRateStr) || 0;
    const next = Math.max(1, +(current + delta).toFixed(1));
    setBuyRateStr(String(next));
  };

  const handleStepSell = (delta: number) => {
    const current = parseFloat(sellRateStr) || 0;
    const next = Math.max(1, +(current + delta).toFixed(1));
    setSellRateStr(String(next));
  };

  const canEditRates = hasPermission(activeUser, 'rates_edit');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRates) {
      alert('Tu rol actual no tiene permisos para modificar las tasas de cambio de la mesa.');
      return;
    }

    if (numBuyRate <= 0 || numSellRate <= 0) {
      alert('Las tasas de cambio deben ser valores numéricos válidos mayores a cero.');
      return;
    }

    if (numBuyRate >= numSellRate) {
      if (!confirm('Advertencia: La tasa de compra es mayor o igual a la de venta. Esto generará pérdida en el spread. ¿Deseas continuar?')) {
        return;
      }
    }

    onUpdateRate(selectedCurrency, numBuyRate, numSellRate, note || 'Ajuste de tasa');
    setSuccessMsg(`Tasa de ${selectedCurrency} actualizada exitosamente a Compra: ${numBuyRate} CUP | Venta: ${numSellRate} CUP.`);
    setNote('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const currentSpread = numSellRate - numBuyRate;
  const spreadMargin = numBuyRate > 0 ? ((currentSpread / numBuyRate) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Mesa de Tasas de Cambio & Spread Comercial</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configura la cotización de compra y venta de divisas en CUP con registro de auditoría.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsElToqueModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-lg shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Sincronizar con elTOQUE (TRMI)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {!canEditRates && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Modo sólo lectura</span>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          {/* Select Currency Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Seleccionar Divisa a Modificar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['USD', 'EUR', 'MLC'] as CurrencyCode[]).map((cur) => {
                const r = rates.find(rate => rate.currency === cur);
                const isSelected = selectedCurrency === cur;
                return (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => handleSelectCurrency(cur)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-lg text-white">{cur}</span>
                      <span className="text-xs font-mono text-emerald-400">
                        {r?.buyRate}/{r?.sellRate}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Spread actual: +{(r ? r.sellRate - r.buyRate : 0)} CUP
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit Rates Inputs */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tasa Compra */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>TASA DE COMPRA (CUP)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Pagamos al cliente</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    disabled={!canEditRates}
                    onClick={() => handleStepBuy(-1)}
                    className="w-10 h-11 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    title="Disminuir tasa en 1 CUP"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      disabled={!canEditRates}
                      value={buyRateStr}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setBuyRateStr(cleanNumberInput(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-28 py-2 text-2xl font-mono font-black text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-300 pointer-events-none select-none">
                      CUP / {selectedCurrency}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canEditRates}
                    onClick={() => handleStepBuy(1)}
                    className="w-10 h-11 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    title="Aumentar tasa en 1 CUP"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Botones de ajuste rápido ±5 */}
                {canEditRates && (
                  <div className="flex items-center gap-1.5 mt-2 justify-end text-[10px] text-slate-400">
                    <span>Ajuste rápido:</span>
                    <button
                      type="button"
                      onClick={() => handleStepBuy(-5)}
                      className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepBuy(5)}
                      className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                    >
                      +5
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 mt-2">
                  Si un cliente te entrega 100 {selectedCurrency}, le entregas ${(100 * numBuyRate).toLocaleString()} CUP.
                </p>
              </div>

              {/* Tasa Venta */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>TASA DE VENTA (CUP)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Cobramos al cliente</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    disabled={!canEditRates}
                    onClick={() => handleStepSell(-1)}
                    className="w-10 h-11 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    title="Disminuir tasa en 1 CUP"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      disabled={!canEditRates}
                      value={sellRateStr}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setSellRateStr(cleanNumberInput(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-28 py-2 text-2xl font-mono font-black text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-300 pointer-events-none select-none">
                      CUP / {selectedCurrency}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canEditRates}
                    onClick={() => handleStepSell(1)}
                    className="w-10 h-11 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    title="Aumentar tasa en 1 CUP"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Botones de ajuste rápido ±5 */}
                {canEditRates && (
                  <div className="flex items-center gap-1.5 mt-2 justify-end text-[10px] text-slate-400">
                    <span>Ajuste rápido:</span>
                    <button
                      type="button"
                      onClick={() => handleStepSell(-5)}
                      className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepSell(5)}
                      className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                    >
                      +5
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 mt-2">
                  Si un cliente quiere comprarte 100 {selectedCurrency}, te debe entregar ${(100 * numSellRate).toLocaleString()} CUP.
                </p>
              </div>
            </div>

            {/* Plantillas de Mercado y Motivo de Auditoría */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Plantillas & Referencias Rápidas del Mercado:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedCurrency === 'USD' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePreset(925, 935, 'elTOQUE TRMI Informal')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      elTOQUE Hoy (925 / 935 CUP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(920, 930, 'Habana Centro Mayorista')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      Habana Centro (920 / 930 CUP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(120, 125, 'CADECA Oficial')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      CADECA Estatal (120 / 125 CUP)
                    </button>
                  </>
                )}
                {selectedCurrency === 'EUR' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePreset(1010, 1020, 'elTOQUE Euro TRMI')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      elTOQUE Euro (1010 / 1020 CUP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(1005, 1015, 'Remesas España / Europa')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      Remesas Europa (1005 / 1015 CUP)
                    </button>
                  </>
                )}
                {selectedCurrency === 'MLC' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePreset(702, 712, 'elTOQUE MLC TRMI')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      elTOQUE MLC (702 / 712 CUP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(700, 710, 'Transferencias Bandec')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      Bandec Tarjeta (700 / 710 CUP)
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo / Justificación del Cambio (Auditoría):
              </label>
              <input
                type="text"
                disabled={!canEditRates}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Ajuste según elTOQUE Promedio Informal..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>

            {/* Action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Última modificación: <strong className="text-slate-200">{currentSelectedRate.lastUpdated}</strong> por {currentSelectedRate.updatedBy}
              </div>

              <button
                type="submit"
                disabled={!canEditRates}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  canEditRates
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Guardar y Aplicar Nueva Tasa</span>
              </button>
            </div>
          </form>
        </div>

        {/* Spread Analysis & Metrics Widget */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Análisis de Margen Comercial</span>
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Spread Bruto por unidad:</span>
                <span className="font-bold text-amber-300 text-base">+{currentSpread} CUP</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Margen porcentual:</span>
                <span className="font-bold text-emerald-400 text-base">{spreadMargin}%</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-sans">
                Por cada <strong>1,000 {selectedCurrency}</strong> comprados y posteriormente vendidos con este spread, la ganancia bruta proyectada es de:
                <div className="text-lg font-bold font-mono text-emerald-300 mt-1">
                  ${(1000 * currentSpread).toLocaleString()} CUP
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Regla de Negocio:</div>
              <p>
                Al modificar una tasa, todos los cajeros conectados recibirán la nueva cotización inmediatamente en sus terminales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Change Audit History Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-white text-base">Historial de Modificaciones de Tasas (Auditoría)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-sans">
              <tr>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Moneda</th>
                <th className="py-2.5 px-3">Tasa Compra Anterior</th>
                <th className="py-2.5 px-3">Nueva Tasa Compra</th>
                <th className="py-2.5 px-3">Tasa Venta Anterior</th>
                <th className="py-2.5 px-3">Nueva Tasa Venta</th>
                <th className="py-2.5 px-3 font-sans">Responsable</th>
                <th className="py-2.5 px-3 font-sans">Motivo / Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rateHistory.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">{h.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{h.currency}</td>
                  <td className="py-2.5 px-3 text-slate-500">${h.oldBuy}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">${h.newBuy}</td>
                  <td className="py-2.5 px-3 text-slate-500">${h.oldSell}</td>
                  <td className="py-2.5 px-3 text-blue-400 font-bold">${h.newSell}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">{h.updatedBy}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 italic">{h.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Sincronización elTOQUE */}
      <ElToqueSyncModal
        isOpen={isElToqueModalOpen}
        onClose={() => setIsElToqueModalOpen(false)}
        rates={rates}
        activeUser={activeUser}
        onApplyRates={(updates, noteMsg) => {
          if (onSyncElToqueRates) {
            onSyncElToqueRates(updates, noteMsg);
          } else {
            updates.forEach(u => onUpdateRate(u.currency, u.buyRate, u.sellRate, noteMsg));
          }
          setSuccessMsg('Cotizaciones de elTOQUE (TRMI) aplicadas exitosamente a la mesa de cambio.');
          setTimeout(() => setSuccessMsg(null), 4000);
        }}
      />
    </div>
  );
};
