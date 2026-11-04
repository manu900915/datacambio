import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  DollarSign, 
  Coins, 
  CreditCard, 
  User as UserIcon, 
  Phone, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  TrendingUp,
  Wallet
} from 'lucide-react';
import { 
  ExchangeRate, 
  Account, 
  Transaction, 
  User, 
  CurrencyCode, 
  TransactionType, 
  PaymentMethod 
} from '../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: ExchangeRate[];
  accounts: Account[];
  activeUser: User;
  onSuccess: (transaction: Transaction, openReceipt: boolean) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  rates,
  accounts,
  activeUser,
  onSuccess
}) => {
  const [type, setType] = useState<TransactionType>('compra');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [amountForeign, setAmountForeign] = useState<string>('100');
  const [customRate, setCustomRate] = useState<number>(325);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  
  // Accounts
  const [foreignAccountId, setForeignAccountId] = useState<string>('');
  const [cupAccountId, setCupAccountId] = useState<string>('');

  // Client info
  const [clientName, setClientName] = useState<string>('');
  const [clientDocId, setClientDocId] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [printReceipt, setPrintReceipt] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Current active rate for selected currency
  const activeRateObj = rates.find(r => r.currency === currency) || rates[0];

  useEffect(() => {
    if (!isCustomRate && activeRateObj) {
      setCustomRate(type === 'compra' ? activeRateObj.buyRate : activeRateObj.sellRate);
    }
  }, [currency, type, rates, isCustomRate, activeRateObj]);

  // Set default accounts based on currency and payment method
  useEffect(() => {
    const defaultForeignAcc = accounts.find(a => a.currency === currency && a.accountType === (paymentMethod === 'Efectivo' ? 'efectivo' : 'banco_tarjeta'))
      || accounts.find(a => a.currency === currency)
      || accounts[0];

    const defaultCupAcc = accounts.find(a => a.currency === 'CUP' && (
      paymentMethod === 'Efectivo' ? a.accountType === 'efectivo' :
      paymentMethod === 'EnZona' ? a.name.toLowerCase().includes('enzona') :
      a.accountType === 'banco_tarjeta'
    )) || accounts.find(a => a.currency === 'CUP') || accounts[0];

    if (defaultForeignAcc) setForeignAccountId(defaultForeignAcc.id);
    if (defaultCupAcc) setCupAccountId(defaultCupAcc.id);
  }, [currency, paymentMethod, accounts]);

  if (!isOpen) return null;

  const numAmountForeign = parseFloat(amountForeign) || 0;
  const totalAmountCUP = Math.round(numAmountForeign * customRate);

  // Selected accounts objects
  const foreignAcc = accounts.find(a => a.id === foreignAccountId);
  const cupAcc = accounts.find(a => a.id === cupAccountId);

  // Check funds
  let fundWarning: string | null = null;
  if (type === 'compra' && cupAcc && cupAcc.balance < totalAmountCUP) {
    fundWarning = `Atención: El saldo en "${cupAcc.name}" (${cupAcc.balance.toLocaleString()} CUP) es inferior a los ${totalAmountCUP.toLocaleString()} CUP a entregar.`;
  } else if (type === 'venta' && foreignAcc && foreignAcc.balance < numAmountForeign) {
    fundWarning = `Atención: El saldo en "${foreignAcc.name}" (${foreignAcc.balance.toLocaleString()} ${currency}) es inferior a los ${numAmountForeign.toLocaleString()} ${currency} a entregar.`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmountForeign <= 0) {
      setError('Por favor ingresa un monto válido mayor a cero.');
      return;
    }

    if (!clientName.trim()) {
      setError('Por favor indica el nombre del cliente para el registro de auditoría.');
      return;
    }

    if (!foreignAccountId || !cupAccountId) {
      setError('Debes seleccionar las cuentas de origen y destino.');
      return;
    }

    const newTrxData: any = {
      type,
      currency,
      amountForeign: numAmountForeign,
      amountCUP: totalAmountCUP,
      rateApplied: customRate,
      paymentMethod,
      sourceAccountId: type === 'compra' ? foreignAccountId : cupAccountId,
      targetAccountId: type === 'compra' ? cupAccountId : foreignAccountId,
      clientName: clientName.trim(),
      clientDocId: clientDocId.trim(),
      clientPhone: clientPhone.trim(),
      status: 'completada',
      notes: notes.trim(),
      operatorId: activeUser.id,
      operatorName: activeUser.name
    };

    onSuccess(newTrxData, printReceipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${type === 'compra' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {type === 'compra' ? 'Comprar Divisas (Entran divisas, entregas CUP)' : 'Vender Divisas (Entregas divisas, recibes CUP)'}
              </h2>
              <p className="text-xs text-slate-400">
                Operador responsable: <strong className="text-slate-200">{activeUser.name}</strong> ({activeUser.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle Compra vs Venta */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setType('compra'); setIsCustomRate(false); }}
              className={`py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'compra'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>COMPRA (Entra Divisa)</span>
            </button>
            <button
              type="button"
              onClick={() => { setType('venta'); setIsCustomRate(false); }}
              className={`py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'venta'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>VENTA (Sale Divisa)</span>
            </button>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Moneda Extranjera
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['USD', 'EUR', 'MLC'] as CurrencyCode[]).map((cur) => {
                const curRate = rates.find(r => r.currency === cur);
                const isSelected = currency === cur;
                return (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => { setCurrency(cur); setIsCustomRate(false); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-500/10 text-white ring-1 ring-emerald-500/50'
                        : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base">{cur}</span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        {type === 'compra' ? `Compra: ${curRate?.buyRate}` : `Venta: ${curRate?.sellRate}`}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {cur === 'USD' ? 'Dólar USA' : cur === 'EUR' ? 'Euro' : 'Moneda MLC'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amounts & Conversion Box */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Foreign Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Monto a transaccionar ({currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amountForeign}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const clean = val === '' ? '' : (val === '0' || val.startsWith('0.')) ? val : val.replace(/^0+([1-9])/, '$1');
                      setAmountForeign(clean);
                    }}
                    placeholder="100"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-20 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-xs font-bold text-slate-300 pointer-events-none select-none">
                    {currency}
                  </div>
                </div>
              </div>

              {/* Tasa Aplicada (editable) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">
                    Tasa de cambio (CUP por 1 {currency})
                  </label>
                  {!isCustomRate ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomRate(true)}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Ajustar tasa para esta op.
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomRate(false);
                        setCustomRate(type === 'compra' ? activeRateObj.buyRate : activeRateObj.sellRate);
                      }}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Restablecer tasa del día
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    disabled={!isCustomRate}
                    value={customRate}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+([1-9])/, '$1');
                      setCustomRate(parseFloat(val) || 0);
                    }}
                    className={`w-full border rounded-lg pl-3 pr-20 py-2.5 text-lg font-mono font-bold ${
                      isCustomRate
                        ? 'bg-amber-950/20 border-amber-500/50 text-amber-300 focus:outline-none'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 cursor-not-allowed'
                    }`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-xs font-bold text-slate-300 pointer-events-none select-none">
                    CUP
                  </div>
                </div>
              </div>
            </div>

            {/* Total CUP Result Banner */}
            <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-850 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  {type === 'compra' ? 'Total en CUP a entregar al cliente:' : 'Total en CUP a cobrar al cliente:'}
                </span>
                <span className="text-2xl font-black text-amber-300 font-mono">
                  ${totalAmountCUP.toLocaleString('es-CU')} CUP
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Fórmula de cálculo:</span>
                <span className="text-xs font-mono text-slate-300">
                  {numAmountForeign} {currency} × {customRate} CUP
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vía de Pago / Canal
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Efectivo">Efectivo Físico</option>
                <option value="Transfermóvil">Transfermóvil (BPA / Metropolitano)</option>
                <option value="EnZona">EnZona (Billetera QR)</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria (Bandec)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {type === 'compra' ? 'Caja CUP de donde sale el dinero' : 'Caja CUP donde entra el dinero'}
              </label>
              <select
                value={cupAccountId}
                onChange={(e) => setCupAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {accounts.filter(a => a.currency === 'CUP').map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Disp: ${acc.balance.toLocaleString()} CUP)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Foreign Account Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {type === 'compra' ? `Caja donde ingresa el ${currency}` : `Caja de donde sale el ${currency}`}
            </label>
            <select
              value={foreignAccountId}
              onChange={(e) => setForeignAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {accounts.filter(a => a.currency === currency).map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Disp: ${acc.balance.toLocaleString()} {currency})
                </option>
              ))}
            </select>
          </div>

          {/* Warning banner if funds insufficient */}
          {fundWarning && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{fundWarning}</span>
            </div>
          )}

          {/* Client Details for Cuban Identity & Audit */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Identificación del Cliente (Auditoría)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Roberto Díaz Fernández"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Carnet Identidad (CI)</label>
                <input
                  type="text"
                  maxLength={11}
                  value={clientDocId}
                  onChange={(e) => setClientDocId(e.target.value)}
                  placeholder="Ej. 88102409821"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Teléfono / Móvil</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+53 5xxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Notas / Denominación de Billetes / Referencia</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Billetes de 100 USD limpios, serie azul / Ref Transfermóvil #12345"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="printReceipt"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="printReceipt" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Emitir comprobante de canje térmico para el cliente al guardar</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Registrar Operación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
