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
  FileText
} from 'lucide-react';
import { CurrencyCode } from '../types';

export interface BanknoteDenomination {
  value: number;
  label: string;
  portrait: string;
  theme: {
    bgGradient: string;
    border: string;
    text: string;
    accent: string;
    ribbonColor?: string;
  };
  issuer: string;
}

// 1. Moneda Nacional CUP: 1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000
export const CUP_DENOMINATIONS: BanknoteDenomination[] = [
  {
    value: 1,
    label: '1 CUP',
    portrait: 'José Martí',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-emerald-950 via-slate-900 to-emerald-900',
      border: 'border-emerald-700/60',
      text: 'text-emerald-300',
      accent: 'bg-emerald-500/20 text-emerald-300'
    }
  },
  {
    value: 5,
    label: '5 CUP',
    portrait: 'Antonio Maceo',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-teal-950 via-slate-900 to-teal-900',
      border: 'border-teal-700/60',
      text: 'text-teal-300',
      accent: 'bg-teal-500/20 text-teal-300'
    }
  },
  {
    value: 10,
    label: '10 CUP',
    portrait: 'Máximo Gómez',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-amber-950 via-slate-900 to-amber-900',
      border: 'border-amber-700/60',
      text: 'text-amber-300',
      accent: 'bg-amber-500/20 text-amber-300'
    }
  },
  {
    value: 20,
    label: '20 CUP',
    portrait: 'Camilo Cienfuegos',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-sky-950 via-slate-900 to-blue-900',
      border: 'border-sky-700/60',
      text: 'text-sky-300',
      accent: 'bg-sky-500/20 text-sky-300'
    }
  },
  {
    value: 50,
    label: '50 CUP',
    portrait: 'Calixto García',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-purple-950 via-slate-900 to-indigo-900',
      border: 'border-purple-700/60',
      text: 'text-purple-300',
      accent: 'bg-purple-500/20 text-purple-300'
    }
  },
  {
    value: 100,
    label: '100 CUP',
    portrait: 'Carlos M. de Céspedes',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-rose-950 via-slate-900 to-red-900',
      border: 'border-rose-700/60',
      text: 'text-rose-300',
      accent: 'bg-rose-500/20 text-rose-300'
    }
  },
  {
    value: 200,
    label: '200 CUP',
    portrait: 'Frank País',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-orange-950 via-slate-900 to-amber-900',
      border: 'border-orange-600/60',
      text: 'text-orange-300',
      accent: 'bg-orange-500/20 text-orange-300'
    }
  },
  {
    value: 500,
    label: '500 CUP',
    portrait: 'Ignacio Agramonte',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-emerald-950 via-slate-900 to-green-900',
      border: 'border-emerald-500/70',
      text: 'text-emerald-200',
      accent: 'bg-emerald-500/25 text-emerald-200'
    }
  },
  {
    value: 1000,
    label: '1000 CUP',
    portrait: 'Julio Antonio Mella',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-violet-950 via-slate-900 to-fuchsia-900',
      border: 'border-violet-500/70',
      text: 'text-violet-200',
      accent: 'bg-violet-500/25 text-violet-200'
    }
  },
  {
    value: 2000,
    label: '2000 CUP',
    portrait: 'Emisión Especial 2K',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-cyan-950 via-slate-900 to-blue-900',
      border: 'border-cyan-500/70',
      text: 'text-cyan-200',
      accent: 'bg-cyan-500/25 text-cyan-200'
    }
  },
  {
    value: 5000,
    label: '5000 CUP',
    portrait: 'Serie Alta Denom 5K',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-teal-950 via-slate-900 to-emerald-900',
      border: 'border-teal-400/70',
      text: 'text-teal-200',
      accent: 'bg-teal-500/25 text-teal-200'
    }
  },
  {
    value: 10000,
    label: '10000 CUP',
    portrait: 'Serie Alta Denom 10K',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-indigo-950 via-slate-900 to-purple-900',
      border: 'border-indigo-400/70',
      text: 'text-indigo-200',
      accent: 'bg-indigo-500/25 text-indigo-200'
    }
  },
  {
    value: 20000,
    label: '20000 CUP',
    portrait: 'Serie Especial 20K',
    issuer: 'BANCO CENTRAL DE CUBA',
    theme: {
      bgGradient: 'from-yellow-950 via-slate-900 to-amber-900',
      border: 'border-yellow-400/70',
      text: 'text-yellow-200',
      accent: 'bg-yellow-500/25 text-yellow-200'
    }
  }
];

// 2. Dólares USD: 1, 5, 10, 20, 50, 100
export const USD_DENOMINATIONS: BanknoteDenomination[] = [
  {
    value: 1,
    label: '1 USD',
    portrait: 'George Washington',
    issuer: 'FEDERAL RESERVE NOTE',
    theme: {
      bgGradient: 'from-emerald-950 via-slate-900 to-emerald-900',
      border: 'border-emerald-700/60',
      text: 'text-emerald-300',
      accent: 'bg-emerald-500/20 text-emerald-300'
    }
  },
  {
    value: 5,
    label: '5 USD',
    portrait: 'Abraham Lincoln',
    issuer: 'FEDERAL RESERVE NOTE',
    theme: {
      bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
      border: 'border-indigo-600/50',
      text: 'text-indigo-200',
      accent: 'bg-indigo-500/20 text-indigo-200'
    }
  },
  {
    value: 10,
    label: '10 USD',
    portrait: 'Alexander Hamilton',
    issuer: 'FEDERAL RESERVE NOTE',
    theme: {
      bgGradient: 'from-amber-950 via-slate-900 to-yellow-950',
      border: 'border-amber-600/50',
      text: 'text-amber-200',
      accent: 'bg-amber-500/20 text-amber-200'
    }
  },
  {
    value: 20,
    label: '20 USD',
    portrait: 'Andrew Jackson',
    issuer: 'FEDERAL RESERVE NOTE',
    theme: {
      bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
      border: 'border-teal-600/50',
      text: 'text-teal-200',
      accent: 'bg-teal-500/20 text-teal-200'
    }
  },
  {
    value: 50,
    label: '50 USD',
    portrait: 'Ulysses S. Grant',
    issuer: 'FEDERAL RESERVE NOTE',
    theme: {
      bgGradient: 'from-rose-950 via-slate-900 to-blue-950',
      border: 'border-blue-500/50',
      text: 'text-rose-200',
      accent: 'bg-blue-500/20 text-rose-200'
    }
  },
  {
    value: 100,
    label: '100 USD',
    portrait: 'Benjamin Franklin',
    issuer: 'FEDERAL RESERVE NOTE',
    theme: {
      bgGradient: 'from-cyan-950 via-slate-900 to-blue-900',
      border: 'border-cyan-400/70',
      text: 'text-cyan-200',
      accent: 'bg-cyan-500/25 text-cyan-200',
      ribbonColor: '#06b6d4'
    }
  }
];

// 3. Euros EUR (Soporte complementario para caja en Euros)
export const EUR_DENOMINATIONS: BanknoteDenomination[] = [
  { value: 5, label: '5 EUR', portrait: 'Clásico / Gris', issuer: 'EUROPEAN CENTRAL BANK', theme: { bgGradient: 'from-slate-950 to-slate-900', border: 'border-slate-600/50', text: 'text-slate-300', accent: 'bg-slate-700/40 text-slate-300' } },
  { value: 10, label: '10 EUR', portrait: 'Románico / Rojo', issuer: 'EUROPEAN CENTRAL BANK', theme: { bgGradient: 'from-rose-950 to-slate-900', border: 'border-rose-600/50', text: 'text-rose-300', accent: 'bg-rose-500/20 text-rose-300' } },
  { value: 20, label: '20 EUR', portrait: 'Gótico / Azul', issuer: 'EUROPEAN CENTRAL BANK', theme: { bgGradient: 'from-blue-950 to-slate-900', border: 'border-blue-600/50', text: 'text-blue-300', accent: 'bg-blue-500/20 text-blue-300' } },
  { value: 50, label: '50 EUR', portrait: 'Renacimiento / Naranja', issuer: 'EUROPEAN CENTRAL BANK', theme: { bgGradient: 'from-orange-950 to-slate-900', border: 'border-orange-600/50', text: 'text-orange-300', accent: 'bg-orange-500/20 text-orange-300' } },
  { value: 100, label: '100 EUR', portrait: 'Barroco / Verde', issuer: 'EUROPEAN CENTRAL BANK', theme: { bgGradient: 'from-emerald-950 to-slate-900', border: 'border-emerald-600/50', text: 'text-emerald-300', accent: 'bg-emerald-500/20 text-emerald-300' } },
  { value: 200, label: '200 EUR', portrait: 'Hierro y Cristal / Amarillo', issuer: 'EUROPEAN CENTRAL BANK', theme: { bgGradient: 'from-yellow-950 to-slate-900', border: 'border-yellow-600/50', text: 'text-yellow-300', accent: 'bg-yellow-500/20 text-yellow-300' } },
  { value: 500, label: '500 EUR', portrait: 'Moderno / Violeta', issuer: 'EUROPEAN CENTRAL BANK', theme: { bgGradient: 'from-purple-950 to-slate-900', border: 'border-purple-600/50', text: 'text-purple-300', accent: 'bg-purple-500/20 text-purple-300' } },
];

/**
 * Componente visual de Billete Miniatura Vectorial Estilizado
 */
export const BanknoteMiniCard: React.FC<{
  denom: BanknoteDenomination;
  currency: string;
  count: number;
}> = ({ denom, currency, count }) => {
  const isUSD = currency === 'USD';
  const isCUP = currency === 'CUP';

  return (
    <div 
      className={`relative w-28 h-16 sm:w-32 sm:h-18 rounded-lg p-1.5 flex flex-col justify-between overflow-hidden shadow-md border ${denom.theme.border} bg-gradient-to-br ${denom.theme.bgGradient} select-none shrink-0 transition-transform hover:scale-105`}
    >
      {/* Guilloche / Security Pattern Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)',
          backgroundSize: '6px 6px'
        }}
      />

      {/* Banda de Seguridad / 3D Ribbon para billetes especiales (ej. 100 USD) */}
      {denom.theme.ribbonColor && (
        <div 
          className="absolute left-8 top-0 bottom-0 w-2 opacity-60 pointer-events-none shadow-sm"
          style={{ backgroundColor: denom.theme.ribbonColor }}
        />
      )}

      {/* Marco de Seguridad Delantero */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-0.5">
        <span className="text-[7px] tracking-wider uppercase font-bold text-slate-300 font-mono truncate max-w-[70px]">
          {isCUP ? 'BCC' : isUSD ? 'USA FED' : 'BCE'}
        </span>
        <span className={`text-[9px] font-black font-mono ${denom.theme.text}`}>
          ${denom.value}
        </span>
      </div>

      {/* Centro: Personaje Histórico o Sello */}
      <div className="relative z-10 flex items-center justify-between px-0.5 my-auto">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-white/90 leading-tight truncate max-w-[80px]">
            {denom.portrait}
          </span>
          <span className="text-[6.5px] text-slate-400 font-mono">
            {currency}
          </span>
        </div>

        {/* Emblema o Escudo Simulado */}
        <div className="w-5 h-5 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[7px] font-black text-amber-300">
          ★
        </div>
      </div>

      {/* Pie del billete: Denominación y contador activo */}
      <div className="relative z-10 flex items-center justify-between pt-0.5 border-t border-white/10">
        <span className={`text-[8px] font-black font-mono ${denom.theme.text}`}>
          {denom.label}
        </span>
        {count > 0 && (
          <span className="bg-emerald-400 text-slate-950 font-black text-[8px] px-1 rounded-sm shadow-sm">
            {count} uds
          </span>
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
