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
  ShieldCheck,
  Zap,
  Eye,
  EyeOff
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
  rates: _rates,
  activeUser: _activeUser,
  onApplyRates
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ElToqueRatesResponse | null>(null);
  const [spreadCup, setSpreadCup] = useState<number>(5);
  const [customToken, setCustomToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'token_info'>('sync');
  const [savedTokenMsg, setSavedTokenMsg] = useState<string | null>(null);

  // Editable TRMI medians
  const [trmiUSD, setTrmiUSD] = useState<number>(FALLBACK_TRMI_RATES.USD);
  const [trmiEUR, setTrmiEUR] = useState<number>(FALLBACK_TRMI_RATES.EUR);
  const [trmiMLC, setTrmiMLC] = useState<number>(FALLBACK_TRMI_RATES.MLC);

  useEffect(() => {
    if (isOpen) {
      const currentToken = eltoqueService.getToken();
      setCustomToken(currentToken);
      handleFetch();
    }
  }, [isOpen]);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await eltoqueService.fetchRates();
      setData(res);
      if (res.rates) {
        setTrmiUSD(res.rates.USD);
        setTrmiEUR(res.rates.EUR);
        setTrmiMLC(res.rates.MLC);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    eltoqueService.setToken(customToken);
    setSavedTokenMsg('Token guardado exitosamente. Sincronizando con api.eltoque.com...');
    setTimeout(() => setSavedTokenMsg(null), 3500);
    handleFetch();
  };

  if (!isOpen) return null;

  const previewUSD = eltoqueService.calculateRatesWithMargin(trmiUSD, spreadCup);
  const previewEUR = eltoqueService.calculateRatesWithMargin(trmiEUR, spreadCup);
  const previewMLC = eltoqueService.calculateRatesWithMargin(trmiMLC, spreadCup);

  const handleApplyAll = () => {
    const updates = [
      {
        currency: 'USD' as CurrencyCode,
        buyRate: previewUSD.buyRate,
        sellRate: previewUSD.sellRate,
        marketReference: trmiUSD
      },
      {
        currency: 'EUR' as CurrencyCode,
        buyRate: previewEUR.buyRate,
        sellRate: previewEUR.sellRate,
        marketReference: trmiEUR
      },
      {
        currency: 'MLC' as CurrencyCode,
        buyRate: previewMLC.buyRate,
        sellRate: previewMLC.sellRate,
        marketReference: trmiMLC
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
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  API Conectada
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tasa Representativa del Mercado Informal de Divisas en Cuba
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
            <span>API Token & Diagnóstico Oficial</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === 'sync' ? (
            <>
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {data?.source === 'api_oficial' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-200">
                        {data?.source === 'api_oficial' ? 'API Oficial elTOQUE Conectada' : 'Token Oficial de elTOQUE Activo'}
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Key className="w-3 h-3 text-emerald-400" />
                        <span>API-Key: {customToken ? `${customToken.slice(0, 10)}...${customToken.slice(-8)}` : 'Activa'}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {data?.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleFetch}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                    title="Consultar API oficial de elTOQUE"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>{loading ? 'Consultando...' : 'Sincronizar API'}</span>
                  </button>
                </div>
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
                    max="25"
                    step="1"
                    value={spreadCup}
                    onChange={(e) => setSpreadCup(parseInt(e.target.value) || 5)}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    {[2, 3, 5, 8, 10].map((val) => (
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
                  Fórmula: <strong className="text-slate-300">Compra</strong> = TRMI - {spreadCup} CUP | <strong className="text-slate-300">Venta</strong> = TRMI + {spreadCup} CUP. Spread total: {spreadCup * 2} CUP por unidad negociada.
                </p>
              </div>

              {/* Grid de Cotizaciones Calculadas con edición opcional de TRMI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cotizaciones Sugeridas para la Mesa de Cambio:
                  </h4>
                  <span className="text-[11px] text-slate-500">Puedes editar la mediana TRMI si deseas afinar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* USD */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-white">USD</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-mono">TRMI: $</span>
                        <input
                          type="number"
                          value={trmiUSD}
                          onChange={(e) => setTrmiUSD(parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-emerald-400 text-right focus:outline-none focus:border-emerald-500"
                        />
                      </div>
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
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-mono">TRMI: $</span>
                        <input
                          type="number"
                          value={trmiEUR}
                          onChange={(e) => setTrmiEUR(parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-emerald-400 text-right focus:outline-none focus:border-emerald-500"
                        />
                      </div>
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
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-mono">TRMI: $</span>
                        <input
                          type="number"
                          value={trmiMLC}
                          onChange={(e) => setTrmiMLC(parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-emerald-400 text-right focus:outline-none focus:border-emerald-500"
                        />
                      </div>
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
                  <div className="relative flex-1">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={customToken}
                      onChange={(e) => setCustomToken(e.target.value)}
                      placeholder="Pega aquí tu Token Bearer (ej. eyJhbGciOi...)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      title={showToken ? 'Ocultar token' : 'Ver token completo'}
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1 font-mono">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>API-Key Cargada y Lista en Memoria</span>
                  </div>
                  <p className="text-slate-400 text-[10px] truncate">
                    Token: {customToken ? `${customToken.slice(0, 20)}...${customToken.slice(-15)}` : 'Sin configurar'}
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  El token se almacena de forma segura en tu navegador y se enviará en la cabecera <code className="text-slate-300 font-mono bg-slate-900 px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> al consultar <code className="text-slate-300 font-mono bg-slate-900 px-1 py-0.5 rounded">api.eltoque.com/v1/trmi</code>.
                </p>
              </form>

              {/* Diagnóstico técnico */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Información Técnica de la API Oficial</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  • <strong>Endpoint oficial:</strong> <code className="text-emerald-300 font-mono">https://api.eltoque.com/v1/trmi</code>
                </p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  • <strong>Autenticación:</strong> Tu clave API personal autoriza consultas automáticas directamente contra los servidores de elTOQUE.
                </p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  • <strong>Seguridad:</strong> El sistema aplica tu margen comercial personalizado (spread) para que nunca vendas a pérdida y mantengas la rentabilidad de cada caja.
                </p>
              </div>
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
