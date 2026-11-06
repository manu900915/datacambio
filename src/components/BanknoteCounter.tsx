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
  FileText,
  Banknote,
  Landmark,
  ShieldCheck,
  BadgeCheck
} from 'lucide-react';
import { CurrencyCode } from '../types';

export interface BanknoteDenomination {
  value: number;
  label: string;
  portrait: string;
  issuerCode: string;
  badgeBg: string;
  iconBg: string;
  borderColor: string;
  textColor: string;
}

// 1. Moneda Nacional CUP: 1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000
export const CUP_DENOMINATIONS: BanknoteDenomination[] = [
  {
    value: 1,
    label: '1 CUP',
    portrait: 'José Martí',
    issuerCode: 'BCC',
    badgeBg: 'bg-emerald-900/90',
    iconBg: 'bg-emerald-600',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-200'
  },
  {
    value: 5,
    label: '5 CUP',
    portrait: 'Antonio Maceo',
    issuerCode: 'BCC',
    badgeBg: 'bg-teal-900/90',
    iconBg: 'bg-teal-600',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-200'
  },
  {
    value: 10,
    label: '10 CUP',
    portrait: 'Máximo Gómez',
    issuerCode: 'BCC',
    badgeBg: 'bg-amber-900/90',
    iconBg: 'bg-amber-600',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-200'
  },
  {
    value: 20,
    label: '20 CUP',
    portrait: 'Camilo Cienfuegos',
    issuerCode: 'BCC',
    badgeBg: 'bg-sky-900/90',
    iconBg: 'bg-sky-600',
    borderColor: 'border-sky-400',
    textColor: 'text-sky-200'
  },
  {
    value: 50,
    label: '50 CUP',
    portrait: 'Calixto García',
    issuerCode: 'BCC',
    badgeBg: 'bg-purple-900/90',
    iconBg: 'bg-purple-600',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-200'
  },
  {
    value: 100,
    label: '100 CUP',
    portrait: 'Carlos M. de Céspedes',
    issuerCode: 'BCC',
    badgeBg: 'bg-red-900/90',
    iconBg: 'bg-rose-600',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-200'
  },
  {
    value: 200,
    label: '200 CUP',
    portrait: 'Frank País',
    issuerCode: 'BCC',
    badgeBg: 'bg-orange-900/90',
    iconBg: 'bg-orange-600',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-200'
  },
  {
    value: 500,
    label: '500 CUP',
    portrait: 'Ignacio Agramonte',
    issuerCode: 'BCC',
    badgeBg: 'bg-green-900/90',
    iconBg: 'bg-green-600',
    borderColor: 'border-green-400',
    textColor: 'text-green-200'
  },
  {
    value: 1000,
    label: '1000 CUP',
    portrait: 'Julio Antonio Mella',
    issuerCode: 'BCC',
    badgeBg: 'bg-fuchsia-900/90',
    iconBg: 'bg-fuchsia-600',
    borderColor: 'border-fuchsia-400',
    textColor: 'text-fuchsia-200'
  },
  {
    value: 2000,
    label: '2000 CUP',
    portrait: 'Serie Especial 2K',
    issuerCode: 'BCC',
    badgeBg: 'bg-blue-900/90',
    iconBg: 'bg-blue-600',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-200'
  },
  {
    value: 5000,
    label: '5000 CUP',
    portrait: 'Serie Alta 5K',
    issuerCode: 'BCC',
    badgeBg: 'bg-teal-950/90',
    iconBg: 'bg-emerald-600',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-100'
  },
  {
    value: 10000,
    label: '10000 CUP',
    portrait: 'Serie Alta 10K',
    issuerCode: 'BCC',
    badgeBg: 'bg-indigo-900/90',
    iconBg: 'bg-indigo-600',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-200'
  },
  {
    value: 20000,
    label: '20000 CUP',
    portrait: 'Serie Oro 20K',
    issuerCode: 'BCC',
    badgeBg: 'bg-yellow-900/90',
    iconBg: 'bg-amber-600',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-200'
  }
];

// 2. Dólares USD: 1, 5, 10, 20, 50, 100
export const USD_DENOMINATIONS: BanknoteDenomination[] = [
  {
    value: 1,
    label: '1 USD',
    portrait: 'George Washington',
    issuerCode: 'USA FED',
    badgeBg: 'bg-emerald-900/90',
    iconBg: 'bg-emerald-600',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-200'
  },
  {
    value: 5,
    label: '5 USD',
    portrait: 'Abraham Lincoln',
    issuerCode: 'USA FED',
    badgeBg: 'bg-slate-900/90',
    iconBg: 'bg-indigo-600',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-200'
  },
  {
    value: 10,
    label: '10 USD',
    portrait: 'Alexander Hamilton',
    issuerCode: 'USA FED',
    badgeBg: 'bg-amber-900/90',
    iconBg: 'bg-amber-600',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-200'
  },
  {
    value: 20,
    label: '20 USD',
    portrait: 'Andrew Jackson',
    issuerCode: 'USA FED',
    badgeBg: 'bg-teal-900/90',
    iconBg: 'bg-teal-600',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-200'
  },
  {
    value: 50,
    label: '50 USD',
    portrait: 'Ulysses S. Grant',
    issuerCode: 'USA FED',
    badgeBg: 'bg-rose-900/90',
    iconBg: 'bg-rose-600',
    borderColor: 'border-blue-400',
    textColor: 'text-rose-200'
  },
  {
    value: 100,
    label: '100 USD',
    portrait: 'Benjamin Franklin',
    issuerCode: 'USA FED',
    badgeBg: 'bg-cyan-900/90',
    iconBg: 'bg-cyan-600',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-100'
  }
];

// 3. Euros EUR (Soporte complementario)
export const EUR_DENOMINATIONS: BanknoteDenomination[] = [
  { value: 5, label: '5 EUR', portrait: 'Clásico / Gris', issuerCode: 'BCE', badgeBg: 'bg-slate-800/90', iconBg: 'bg-slate-600', borderColor: 'border-slate-400', textColor: 'text-slate-200' },
  { value: 10, label: '10 EUR', portrait: 'Románico / Rojo', issuerCode: 'BCE', badgeBg: 'bg-rose-900/90', iconBg: 'bg-rose-600', borderColor: 'border-rose-400', textColor: 'text-rose-200' },
  { value: 20, label: '20 EUR', portrait: 'Gótico / Azul', issuerCode: 'BCE', badgeBg: 'bg-blue-900/90', iconBg: 'bg-blue-600', borderColor: 'border-blue-400', textColor: 'text-blue-200' },
  { value: 50, label: '50 EUR', portrait: 'Renacimiento / Naranja', issuerCode: 'BCE', badgeBg: 'bg-orange-900/90', iconBg: 'bg-orange-600', borderColor: 'border-orange-400', textColor: 'text-orange-200' },
  { value: 100, label: '100 EUR', portrait: 'Barroco / Verde', issuerCode: 'BCE', badgeBg: 'bg-emerald-900/90', iconBg: 'bg-emerald-600', borderColor: 'border-emerald-400', textColor: 'text-emerald-200' },
  { value: 200, label: '200 EUR', portrait: 'Hierro / Amarillo', issuerCode: 'BCE', badgeBg: 'bg-yellow-900/90', iconBg: 'bg-yellow-600', borderColor: 'border-yellow-400', textColor: 'text-yellow-200' },
  { value: 500, label: '500 EUR', portrait: 'Moderno / Violeta', issuerCode: 'BCE', badgeBg: 'bg-purple-900/90', iconBg: 'bg-purple-600', borderColor: 'border-purple-400', textColor: 'text-purple-200' },
];

/**
 * Componente visual de Icono & Ficha de Billete de Referencia
 */
export const BanknoteMiniCard: React.FC<{
  denom: BanknoteDenomination;
  currency: string;
  count: number;
}> = ({ denom, currency, count }) => {
  const isUSD = currency === 'USD';
  const isCUP = currency === 'CUP';
  const flag = isCUP ? '🇨🇺' : isUSD ? '🇺🇸' : '🇪🇺';

  return (
    <div 
      className={`relative w-36 h-20 rounded-xl p-2 flex flex-col justify-between overflow-hidden shadow-lg border-2 ${denom.borderColor} ${denom.badgeBg} select-none shrink-0 transition-transform hover:scale-105`}
    >
      {/* Cabecera del billete: Bandera + Emisor + Valor */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">{flag}</span>
          <span className="text-[9px] font-mono font-black text-white/90 uppercase tracking-wider">
            {denom.issuerCode}
          </span>
        </div>
        <span className={`text-xs font-black font-mono px-1.5 py-0.5 rounded shadow-sm bg-black/50 border border-white/20 ${denom.textColor}`}>
          ${denom.value.toLocaleString()}
        </span>
      </div>

      {/* Centro: Icono de Billete Grande + Nombre de Referencia */}
      <div className="flex items-center gap-2 z-10 my-0.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-md ${denom.iconBg} text-white border border-white/30`}>
          <Banknote className="w-5 h-5 drop-shadow" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-black text-white leading-tight truncate drop-shadow-sm">
            {denom.portrait}
          </span>
          <span className="text-[9px] text-white/80 font-mono font-bold">
            Billete {denom.value.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      {/* Pie del billete: Indicador de unidades contadas */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-white/20 text-[9px] font-mono">
        <span className="text-white/80 font-bold">
          {denom.label}
        </span>
        {count > 0 ? (
          <span className="bg-emerald-300 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded shadow font-mono">
            {count} uds
          </span>
        ) : (
          <span className="text-white/50 text-[8px]">0 uds</span>
        )}
      </div>
    </div>
  );
};

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
  const denominations: BanknoteDenomination[] = 
    currency === 'CUP' ? CUP_DENOMINATIONS :
    currency === 'USD' ? USD_DENOMINATIONS :
    currency === 'EUR' ? EUR_DENOMINATIONS :
    CUP_DENOMINATIONS;

  const [counts, setCounts] = useState<Record<number, number>>(initialCounts);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Reiniciar conteo si cambia la moneda de la cuenta
  useEffect(() => {
    setCounts({});
  }, [currency]);

  // Actualizar totales hacia el padre cuando cambia el conteo
  useEffect(() => {
    let total = 0;
    const parts: string[] = [];

    denominations.forEach((d) => {
      const q = counts[d.value] || 0;
      if (q > 0) {
        const sub = q * d.value;
        total += sub;
        parts.push(`${q}x$${d.value}`);
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
  const totalPieces = denominations.reduce((acc, d) => acc + (counts[d.value] || 0), 0);
  const totalAmount = denominations.reduce((acc, d) => acc + ((counts[d.value] || 0) * d.value), 0);

  const breakdownString = denominations
    .filter(d => (counts[d.value] || 0) > 0)
    .map(d => `${counts[d.value]}x$${d.value} ${currency}`)
    .join(', ');

  const handleCopyBreakdown = () => {
    if (!breakdownString) return;
    navigator.clipboard.writeText(`Desglose de Billetes en Caja: ${breakdownString}. Total Contado: $${totalAmount.toLocaleString()} ${currency}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-lg transition-all">
      {/* Header del Conteo por Billetes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Conteo Físico por Denominaciones de Billetes ({currency})
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

        <div className="flex items-center gap-2">
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
          {/* Grid de Denominaciones con Tarjeta Miniatura de Billete y Controles */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {denominations.map((denom) => {
              const currentQty = counts[denom.value] || 0;
              const subtotal = currentQty * denom.value;

              return (
                <div 
                  key={denom.value}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    currentQty > 0 
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/5' 
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  {/* Tarjeta Visual Miniatura del Billete */}
                  <BanknoteMiniCard 
                    denom={denom} 
                    currency={currency} 
                    count={currentQty} 
                  />

                  {/* Controles de Conteo y Subtotal */}
                  <div className="flex-1 flex flex-col justify-between h-full pl-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Cantidad:
                      </span>
                      <span className="text-xs font-mono font-black text-slate-200">
                        ${subtotal.toLocaleString()} {currency}
                      </span>
                    </div>

                    {/* Fila de Input y botones rápidos */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStepCount(denom.value, -1)}
                        disabled={currentQty <= 0}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-700 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
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
                        className="px-1.5 py-1 text-[10px] rounded font-mono font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 cursor-pointer"
                        title="Sumar fajo pequeño de 10 billetes"
                      >
                        +10
                      </button>

                      {/* Botón rápido +100 (Fajo estándar bancario) */}
                      <button
                        type="button"
                        onClick={() => handleStepCount(denom.value, 100)}
                        className="px-1.5 py-1 text-[10px] rounded font-mono font-bold bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                        title="Sumar fajo bancario completo de 100 billetes"
                      >
                        +100
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{denom.value} × {currentQty} uds</span>
                      {currentQty > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCount(denom.value, 0)}
                          className="text-slate-500 hover:text-rose-400 text-[10px] cursor-pointer"
                        >
                          quitar
                        </button>
                      )}
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
