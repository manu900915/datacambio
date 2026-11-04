import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Check, 
  X, 
  ExternalLink, 
  Key, 
  Sliders, 
  TrendingUp, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CurrencyCode, ExchangeRate, User } from '../types';
import { eltoqueService, ElToqueRatesResponse, FALLBACK_TRMI_RATES } from '../services/eltoqueService';

interface ElToqueSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: ExchangeRate[];
  activeUser: User;
  onApplyRates: (
    updates: { currency: CurrencyCode; buyRate: number; sellRate: number; marketReference?: number }[],
    note: string
  ) => void;
}

export const ElToqueSyncModal: React.FC<ElToqueSyncModalProps> = ({
  isOpen,
  onClose,
  rates,
  activeUser,
  onApplyRates
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ElToqueRatesResponse | null>(null);
  const [spreadCup, setSpreadCup] = useState<number>(5);
  const [customToken, setCustomToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sync' | 'token_info'>('sync');
  const [savedTokenMsg, setSavedTokenMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomToken(eltoqueService.getToken());
      handleFetch();
    }
  }, [isOpen]);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await eltoqueService.fetchRates();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    eltoqueService.setToken(customToken);
    setSavedTokenMsg('Token guardado exitosamente. Probando conexión...');
    setTimeout(() => setSavedTokenMsg(null), 3000);
    handleFetch();
  };

  if (!isOpen) return null;

  const currentUSD = data?.rates.USD || FALLBACK_TRMI_RATES.USD;
  const currentEUR = data?.rates.EUR || FALLBACK_TRMI_RATES.EUR;
  const currentMLC = data?.rates.MLC || FALLBACK_TRMI_RATES.MLC;

  const previewUSD = eltoqueService.calculateRatesWithMargin(currentUSD, spreadCup);
  const previewEUR = eltoqueService.calculateRatesWithMargin(currentEUR, spreadCup);
  const previewMLC = eltoqueService.calculateRatesWithMargin(currentMLC, spreadCup);

  const handleApplyAll = () => {
    const updates = [
      {
        currency: 'USD' as CurrencyCode,
        buyRate: previewUSD.buyRate,
        sellRate: previewUSD.sellRate,
        marketReference: currentUSD
      },
      {
        currency: 'EUR' as CurrencyCode,
        buyRate: previewEUR.buyRate,
        sellRate: previewEUR.sellRate,
        marketReference: currentEUR
      },
      {
        currency: 'MLC' as CurrencyCode,
        buyRate: previewMLC.buyRate,
        sellRate: previewMLC.sellRate,
        marketReference: currentMLC
      }
    ];

    onApplyRates(updates, `Sincronización automatizada con elTOQUE (TRMI) - Margen ±${spreadCup} CUP`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg">
              <TrendingUp className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Sincronización elTOQUE (TRMI)</h3>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Mercado Informal Cuba
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tasa Representativa del Mercado Informal de Divisas (TRMI)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs de navegación */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Cotizaciones & Aplicar Margen</span>
          </button>
          <button
            onClick={() => setActiveTab('token_info')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'token_info'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Token & Diagnóstico Scraping</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === 'sync' ? (
            <>
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {data?.source === 'api_oficial' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Info className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">
                      {data?.source === 'api_oficial' ? 'API Oficial elTOQUE Conectada' : 'Referencia TRMI de elTOQUE Activa'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {data?.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFetch}
                  disabled={loading}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                  title="Volver a consultar cotizaciones"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>{loading ? 'Consultando...' : 'Actualizar'}</span>
                </button>
              </div>

              {/* Selector de Margen Comercial (Spread de la casa) */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Margen Comercial de la Mesa (Spread CUP):</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ±{spreadCup} CUP
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={spreadCup}
                    onChange={(e) => setSpreadCup(parseInt(e.target.value) || 5)}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    {[3, 5, 8, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSpreadCup(val)}
                        className={`px-2 py-0.5 text-[11px] rounded font-mono font-medium border transition-colors cursor-pointer ${
                          spreadCup === val
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ±{val}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Fórmula: <strong className="text-slate-300">Compra</strong> = TRMI - {spreadCup} CUP | <strong className="text-slate-300">Venta</strong> = TRMI + {spreadCup} CUP. Spread total: {spreadCup * 2} CUP por unidad.
                </p>
              </div>

              {/* Grid de Cotizaciones Calculadas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Cotizaciones Sugeridas para la Mesa de Cambio:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* USD */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-white">USD</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        TRMI: ${currentUSD}
                      </span>
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Compra:</span>
                        <span className="font-bold text-emerald-400 text-sm">${previewUSD.buyRate} CUP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Venta:</span>
                        <span className="font-bold text-blue-400 text-sm">${previewUSD.sellRate} CUP</span>
                      </div>
                    </div>
                  </div>

                  {/* EUR */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-white">EUR</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        TRMI: ${currentEUR}
                      </span>
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Compra:</span>
                        <span className="font-bold text-emerald-400 text-sm">${previewEUR.buyRate} CUP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Venta:</span>
                        <span className="font-bold text-blue-400 text-sm">${previewEUR.sellRate} CUP</span>
                      </div>
                    </div>
                  </div>

                  {/* MLC */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-white">MLC</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        TRMI: ${currentMLC}
                      </span>
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Compra:</span>
                        <span className="font-bold text-emerald-400 text-sm">${previewMLC.buyRate} CUP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Venta:</span>
                        <span className="font-bold text-blue-400 text-sm">${previewMLC.sellRate} CUP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Tab de Información Técnica & Token */
            <div className="space-y-4 text-xs">
              {/* Diagnóstico técnico de Scraping */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>¿Por qué no se puede hacer web scraping directo con curl/scripts a eltoque.com?</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  1. <strong>Cloudflare Bot Protection (JavaScript Challenge):</strong> elTOQUE protege sus servidores con Cloudflare. Cualquier intento de descarga HTML directa mediante <code className="text-emerald-400 font-mono bg-slate-900 px-1 py-0.5 rounded">curl</code>, <code className="text-emerald-400 font-mono bg-slate-900 px-1 py-0.5 rounded">cheerio</code> o <code className="text-emerald-400 font-mono bg-slate-900 px-1 py-0.5 rounded">axios</code> es interceptado por un desafío interactivo de Cloudflare (error 403 con pantalla <em>"Just a moment... Enable JavaScript"</em>).
                </p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  2. <strong>CORS en Navegadores:</strong> Las llamadas <code className="text-emerald-400 font-mono bg-slate-900 px-1 py-0.5 rounded">fetch()</code> directas desde el navegador del cliente son bloqueadas por políticas de seguridad cruzada del navegador.
                </p>
                <p className="text-emerald-400 leading-relaxed text-[11px] font-medium">
                  3. <strong>Solución Oficial de elTOQUE:</strong> Para resolver esto, elTOQUE provee su <strong>API Oficial de Tasas</strong> (<code className="text-emerald-300 font-mono">https://api.eltoque.com/v1/trmi</code>), la cual admite autorización mediante Token sin bloqueos de Cloudflare.
                </p>
              </div>

              {/* Formulario de Token de elTOQUE */}
              <form onSubmit={handleSaveToken} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tu Token de la API Oficial de elTOQUE:</span>
                  </label>
                  <a
                    href="https://tasas-token.eltoque.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Solicitar Token Gratis en elTOQUE</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="Pega aquí tu Token Bearer (ej. eyJhbGciOi...)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>

                {savedTokenMsg && (
                  <p className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{savedTokenMsg}</span>
                  </p>
                )}

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  El token se almacena de forma segura en tu navegador y se enviará en la cabecera <code className="text-slate-300 font-mono bg-slate-900 px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> al consultar <code className="text-slate-300 font-mono bg-slate-900 px-1 py-0.5 rounded">api.eltoque.com</code>.
                </p>
              </form>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {activeTab === 'sync' && (
            <button
              type="button"
              onClick={handleApplyAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Tasas a la Mesa de Cambio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
