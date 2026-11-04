import React from 'react';
import { X, Printer, CheckCircle, Download, Share2 } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Action Bar (no print) */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200 no-print">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Comprobante de Canje / Operación
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Ticket Content */}
        <div id="thermal-receipt" className="p-6 font-mono text-xs space-y-4 bg-white">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-400 pb-3">
            <div className="font-extrabold text-base tracking-tight text-slate-900">
              DATACAMBIO PRO
            </div>
            <div className="text-[11px] text-slate-600">
              Gestión Integral de Divisas y Cajas
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              La Habana, Cuba • Terminal POS
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Comprobante No:</span>
              <span className="font-bold text-slate-800">{transaction.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha y Hora:</span>
              <span className="text-slate-800">{transaction.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Operador:</span>
              <span className="text-slate-800">{transaction.operatorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tipo de Operación:</span>
              <span className="font-bold uppercase text-slate-900">
                {transaction.type === 'compra' ? 'COMPRA DE DIVISAS' : 'VENTA DE DIVISAS'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Canal / Pago:</span>
              <span className="text-slate-800">{transaction.paymentMethod}</span>
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-semibold text-slate-800">{transaction.clientName}</span>
            </div>
            {transaction.clientDocId && (
              <div className="flex justify-between">
                <span className="text-slate-500">Carnet Identidad (CI):</span>
                <span className="text-slate-800">{transaction.clientDocId}</span>
              </div>
            )}
            {transaction.clientPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span className="text-slate-800">{transaction.clientPhone}</span>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>Monto en {transaction.currency}:</span>
              <span className="font-mono text-base font-bold text-slate-900">
                ${transaction.amountForeign.toLocaleString()} {transaction.currency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Tasa aplicada:</span>
              <span>1 {transaction.currency} = {transaction.rateApplied} CUP</span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm">
              <span className="font-bold">
                {transaction.type === 'compra' ? 'Total Entregado CUP:' : 'Total Recibido CUP:'}
              </span>
              <span className="font-mono text-lg font-black text-emerald-800">
                ${transaction.amountCUP.toLocaleString()} CUP
              </span>
            </div>
          </div>

          {transaction.notes && (
            <div className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded">
              Nota: {transaction.notes}
            </div>
          )}

          {/* QR Code and Signatures */}
          <div className="pt-2 text-center space-y-4">
            <div className="flex justify-center">
              {/* Clean QR representation for verification */}
              <div className="w-24 h-24 border-2 border-slate-800 p-1 rounded flex items-center justify-center bg-white">
                <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-slate-900">
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                </div>
              </div>
            </div>
            <div className="text-[9px] text-slate-500">
              Escanea para verificar autenticidad en red local o VPN
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-300 text-[10px]">
              <div>
                <div className="border-b border-slate-400 h-8"></div>
                <div className="mt-1 text-slate-500">Firma Cajero</div>
              </div>
              <div>
                <div className="border-b border-slate-400 h-8"></div>
                <div className="mt-1 text-slate-500">Firma Cliente</div>
              </div>
            </div>

            <div className="text-[9px] text-slate-400 pt-1">
              Gracias por su preferencia • Guarde este recibo para cualquier aclaración
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
