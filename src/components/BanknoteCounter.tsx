import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  RotateCcw, 
  Plus, 
  Minus, 
  Check, 
  Copy, 
  Layers, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Banknote,
  ArrowUpDown,
  X
} from 'lucide-react';
import { CurrencyCode } from '../types';

export interface BanknoteDenomination {
  value: number;
  label: string;
  portrait: string;
  badgeColor: string;
}

// 1. Moneda Nacional CUP: 1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000 y 20000
export const CUP_DENOMINATIONS: BanknoteDenomination[] = [
  { value: 1, label: '1 CUP', portrait: 'José Martí', badgeColor: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' },
  { value: 5, label: '5 CUP', portrait: 'Antonio Maceo', badgeColor: 'bg-teal-600/30 text-teal-300 border-teal-500/40' },
  { value: 10, label: '10 CUP', portrait: 'Máximo Gómez', badgeColor: 'bg-amber-600/30 text-amber-300 border-amber-500/40' },
  { value: 20, label: '20 CUP', portrait: 'Camilo Cienfuegos', badgeColor: 'bg-sky-600/30 text-sky-300 border-sky-500/40' },
  { value: 50, label: '50 CUP', portrait: 'Calixto García', badgeColor: 'bg-purple-600/30 text-purple-300 border-purple-500/40' },
  { value: 100, label: '100 CUP', portrait: 'Carlos M. de Céspedes', badgeColor: 'bg-rose-600/30 text-rose-300 border-rose-500/40' },
  { value: 200, label: '200 CUP', portrait: 'Frank País', badgeColor: 'bg-orange-600/30 text-orange-300 border-orange-500/40' },
  { value: 500, label: '500 CUP', portrait: 'Ignacio Agramonte', badgeColor: 'bg-green-600/30 text-green-300 border-green-500/40' },
  { value: 1000, label: '1000 CUP', portrait: 'Julio Antonio Mella', badgeColor: 'bg-fuchsia-600/30 text-fuchsia-300 border-fuchsia-500/40' },
  { value: 2000, label: '2000 CUP', portrait: 'Serie Especial 2K', badgeColor: 'bg-blue-600/30 text-blue-300 border-blue-500/40' },
  { value: 5000, label: '5000 CUP', portrait: 'Serie Alta 5K', badgeColor: 'bg-teal-700/30 text-teal-200 border-teal-400/40' },
  { value: 10000, label: '10000 CUP', portrait: 'Serie Alta 10K', badgeColor: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' },
  { value: 20000, label: '20000 CUP', portrait: 'Serie Especial 20K', badgeColor: 'bg-yellow-600/30 text-yellow-300 border-yellow-500/40' },
];

// 2. Dólares USD: 1, 5, 10, 20, 50, 100
export const USD_DENOMINATIONS: BanknoteDenomination[] = [
  { value: 1, label: '1 USD', portrait: 'George Washington', badgeColor: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' },
  { value: 5, label: '5 USD', portrait: 'Abraham Lincoln', badgeColor: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' },
  { value: 10, label: '10 USD', portrait: 'Alexander Hamilton', badgeColor: 'bg-amber-600/30 text-amber-300 border-amber-500/40' },
  { value: 20, label: '20 USD', portrait: 'Andrew Jackson', badgeColor: 'bg-teal-600/30 text-teal-300 border-teal-500/40' },
  { value: 50, label: '50 USD', portrait: 'Ulysses S. Grant', badgeColor: 'bg-rose-600/30 text-rose-300 border-blue-500/40' },
  { value: 100, label: '100 USD', portrait: 'Benjamin Franklin', badgeColor: 'bg-cyan-600/30 text-cyan-300 border-cyan-400/40' },
];

// 3. Euros EUR
export const EUR_DENOMINATIONS: BanknoteDenomination[] = [
  { value: 5, label: '5 EUR', portrait: 'Clásico / Gris', badgeColor: 'bg-slate-600/30 text-slate-300 border-slate-500/40' },
  { value: 10, label: '10 EUR', portrait: 'Románico / Rojo', badgeColor: 'bg-rose-600/30 text-rose-300 border-rose-500/40' },
  { value: 20, label: '20 EUR', portrait: 'Gótico / Azul', badgeColor: 'bg-blue-600/30 text-blue-300 border-blue-500/40' },
  { value: 50, label: '50 EUR', portrait: 'Renacimiento / Naranja', badgeColor: 'bg-orange-600/30 text-orange-300 border-orange-500/40' },
  { value: 100, label: '100 EUR', portrait: 'Barroco / Verde', badgeColor: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' },
  { value: 200, label: '200 EUR', portrait: 'Hierro / Amarillo', badgeColor: 'bg-yellow-600/30 text-yellow-300 border-yellow-500/40' },
  { value: 500, label: '500 EUR', portrait: 'Moderno / Violeta', badgeColor: 'bg-purple-600/30 text-purple-300 border-purple-500/40' },
];

interface BanknoteCounterProps {
  currency: CurrencyCode | string;
  onTotalChange: (totalAmount: number, detailsText: string) => void;
  initialCounts?: Record<number, number>;
}

export const BanknoteCounter: React.FC<BanknoteCounterProps> = ({
  currency,
  onTotalChange,
  initialCounts = {}
}) => {
  // Determinar denominaciones según la moneda seleccionada
  const baseDenominations: BanknoteDenomination[] = 
    currency === 'CUP' ? CUP_DENOMINATIONS :
    currency === 'USD' ? USD_DENOMINATIONS :
    currency === 'EUR' ? EUR_DENOMINATIONS :
    CUP_DENOMINATIONS;

  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const [counts, setCounts] = useState<Record<number, number>>(initialCounts);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Ordenar según preferencia (Ascendente o Descendente)
  const denominations = [...baseDenominations].sort((a, b) => 
    sortAscending ? a.value - b.value : b.value - a.value
  );

  // Reiniciar conteo si cambia la moneda de la cuenta
  useEffect(() => {
    setCounts({});
  }, [currency]);

  // Actualizar totales hacia el componente padre
  useEffect(() => {
    let total = 0;
    const parts: string[] = [];

    // Ordenar de mayor a menor para el resumen formal
    const sortedForReport = [...baseDenominations].sort((a, b) => b.value - a.value);
    sortedForReport.forEach((d) => {
      const q = counts[d.value] || 0;
      if (q > 0) {
        const sub = q * d.value;
        total += sub;
        parts.push(`${q}x$${d.value.toLocaleString()}`);
      }
    });

    const breakdownText = parts.length > 0 
      ? `Desglose de billetes: ${parts.join(', ')} (Total: $${total.toLocaleString()} ${currency})`
      : '';

    onTotalChange(total, breakdownText);
  }, [counts, currency]);

  const handleSetCount = (value: number, amount: number) => {
    setCounts(prev => ({
      ...prev,
      [value]: Math.max(0, amount)
    }));
  };

  const handleStepCount = (value: number, delta: number) => {
    setCounts(prev => {
      const current = prev[value] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [value]: next };
    });
  };

  const handleClearAll = () => {
    setCounts({});
  };

  // Cálculos resumen
  const totalPieces = baseDenominations.reduce((acc, d) => acc + (counts[d.value] || 0), 0);
  const totalAmount = baseDenominations.reduce((acc, d) => acc + ((counts[d.value] || 0) * d.value), 0);

  const breakdownString = baseDenominations
    .filter(d => (counts[d.value] || 0) > 0)
    .sort((a, b) => b.value - a.value)
    .map(d => `${counts[d.value]}x$${d.value.toLocaleString()} ${currency}`)
    .join(', ');

  const handleCopyBreakdown = () => {
    if (!breakdownString) return;
    navigator.clipboard.writeText(`Desglose de Billetes en Caja: ${breakdownString}. Total Contado: $${totalAmount.toLocaleString()} ${currency}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const flag = currency === 'CUP' ? '🇨🇺' : currency === 'USD' ? '🇺🇸' : '🇪🇺';

  return (
    <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-lg transition-all">
      {/* Header del Conteo por Billetes en Lista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm" role="img" aria-label="Bandera">{flag}</span>
              <h4 className="text-sm font-bold text-white">
                Lista de Conteo por Billetes ({currency})
              </h4>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {denominations.length} denominaciones
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currency === 'CUP' 
                ? 'Moneda Nacional: 1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000 y 20000 CUP'
                : currency === 'USD'
                ? 'Dólares Americanos: 1, 5, 10, 20, 50 y 100 USD'
                : 'Euros: 5, 10, 20, 50, 100, 200 y 500 EUR'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSortAscending(!sortAscending)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            title="Invertir orden de denominaciones"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortAscending ? '1 ➔ 20.000' : '20.000 ➔ 1'}</span>
          </button>

          {totalPieces > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
              title="Reiniciar todos los billetes contados a 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar Conteo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Contraer' : 'Expandir'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Cabecera de la Lista / Tabla */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <div className="sm:col-span-4">Billete / Denominación</div>
            <div className="sm:col-span-5 text-center">Cantidad de Billetes</div>
            <div className="sm:col-span-3 text-right">Subtotal Contado</div>
          </div>

          {/* Filas de la Lista de Denominaciones */}
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {denominations.map((denom) => {
              const currentQty = counts[denom.value] || 0;
              const subtotal = currentQty * denom.value;

              return (
                <div
                  key={denom.value}
                  className={`p-2.5 rounded-xl border transition-all flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2.5 ${
                    currentQty > 0
                      ? 'bg-slate-900/95 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  {/* Columna 1: Icono y Nombre de la Denominación */}
                  <div className="sm:col-span-4 flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${denom.badgeColor}`}>
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-white text-sm">
                          ${denom.value.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {currency}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {denom.portrait}
                      </span>
                    </div>
                  </div>

                  {/* Columna 2: Controles de Cantidad (+1, -1, +10, +100) */}
                  <div className="sm:col-span-5 flex items-center justify-start sm:justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStepCount(denom.value, -1)}
                      disabled={currentQty <= 0}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-700 text-xs font-bold transition-all disabled:opacity-30 cursor-pointer"
                      title="Restar 1 billete"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={currentQty === 0 ? '' : currentQty}
                      placeholder="0"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        handleSetCount(denom.value, isNaN(val) ? 0 : val);
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg py-1 px-1.5 text-center text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => handleStepCount(denom.value, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                      title="Sumar 1 billete"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* Botón rápido +10 (Medio fajo) */}
                    <button
                      type="button"
                      onClick={() => handleStepCount(denom.value, 10)}
                      className="px-2 py-1 text-[11px] rounded font-mono font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
                      title="Sumar 10 billetes"
                    >
                      +10
                    </button>

                    {/* Botón rápido +100 (Fajo bancario estándar) */}
                    <button
                      type="button"
                      onClick={() => handleStepCount(denom.value, 100)}
                      className="px-2 py-1 text-[11px] rounded font-mono font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                      title="Sumar fajo bancario de 100 billetes"
                    >
                      +100
                    </button>

                    {currentQty > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCount(denom.value, 0)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Poner a 0 esta denominación"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Columna 3: Subtotal Calculado */}
                  <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 text-right">
                    <span className="sm:hidden text-xs text-slate-400">Subtotal:</span>
                    <div>
                      <span className={`font-mono font-black text-sm block ${
                        currentQty > 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        ${subtotal.toLocaleString()} {currency}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentQty} {currentQty === 1 ? 'billete' : 'billetes'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra Resumen Total del Arqueo por Billetes */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Total Billetes:</span>
                <span className="font-bold text-white text-sm">
                  {totalPieces.toLocaleString()} piezas
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400">Total Contado:</span>
                <span className="font-black text-emerald-400 text-base">
                  ${totalAmount.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {breakdownString && (
                <button
                  type="button"
                  onClick={handleCopyBreakdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  title="Copiar texto con el desglose al portapapeles"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar Desglose'}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
