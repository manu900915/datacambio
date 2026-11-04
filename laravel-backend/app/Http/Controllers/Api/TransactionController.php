<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Listado con filtros de transacciones
     */
    public function index(Request $request)
    {
        $query = Transaction::query()->latest('transacted_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('currency')) {
            $query->where('currency', $request->currency);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('from_date')) {
            $query->whereDate('transacted_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('transacted_at', '<=', $request->to_date);
        }
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function($q) use ($term) {
                $q->where('code', 'like', "%{$term}%")
                  ->orWhere('client_name', 'like', "%{$term}%")
                  ->orWhere('client_doc_id', 'like', "%{$term}%");
            });
        }

        return response()->json($query->paginate($request->get('per_page', 25)));
    }

    /**
     * Registro seguro con bloqueo de saldos y auditoría
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:compra,venta',
            'currency' => 'required|in:USD,EUR,MLC',
            'amount_foreign' => 'required|numeric|min:1',
            'rate_applied' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'source_account_id' => 'required|exists:accounts,id',
            'target_account_id' => 'required|exists:accounts,id',
            'client_name' => 'required|string|max:150',
            'client_doc_id' => 'nullable|string|max:20',
            'client_phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string|max:500',
        ]);

        $amountCUP = round($validated['amount_foreign'] * $validated['rate_applied'], 2);
        $user = $request->user();

        return DB::transaction(function () use ($validated, $amountCUP, $user) {
            $sourceAcc = Account::lockForUpdate()->findOrFail($validated['source_account_id']);
            $targetAcc = Account::lockForUpdate()->findOrFail($validated['target_account_id']);

            // Actualización de saldos según tipo
            if ($validated['type'] === 'compra') {
                // Compra: el negocio recibe divisa y entrega CUP
                $sourceAcc->increment('balance', $validated['amount_foreign']);
                if ($targetAcc->balance < $amountCUP) {
                    return response()->json(['error' => 'Saldo insuficiente en caja CUP para completar el pago.'], 422);
                }
                $targetAcc->decrement('balance', $amountCUP);
            } else {
                // Venta: el negocio entrega divisa y recibe CUP
                if ($targetAcc->balance < $validated['amount_foreign']) {
                    return response()->json(['error' => 'Saldo insuficiente en caja de divisas para la venta.'], 422);
                }
                $targetAcc->decrement('balance', $validated['amount_foreign']);
                $sourceAcc->increment('balance', $amountCUP);
            }

            $trxCode = 'TRX-' . date('Y') . '-' . str_pad(Transaction::count() + 1, 4, '0', STR_PAD_LEFT);

            $transaction = Transaction::create([
                'code' => $trxCode,
                'transacted_at' => Carbon::now(),
                'type' => $validated['type'],
                'currency' => $validated['currency'],
                'amount_foreign' => $validated['amount_foreign'],
                'amount_cup' => $amountCUP,
                'rate_applied' => $validated['rate_applied'],
                'spread_profit_cup' => round($validated['amount_foreign'] * 10, 2),
                'payment_method' => $validated['payment_method'],
                'source_account_id' => $sourceAcc->id,
                'target_account_id' => $targetAcc->id,
                'client_name' => $validated['client_name'],
                'client_doc_id' => $validated['client_doc_id'] ?? null,
                'client_phone' => $validated['client_phone'] ?? null,
                'status' => 'completada',
                'notes' => $validated['notes'] ?? null,
                'operator_id' => $user->id ?? 1,
                'operator_name' => $user->name ?? 'Operador Sistema',
            ]);

            // Auditoría
            AuditLog::create([
                'action' => 'NUEVA_TRANSACCION',
                'entity' => 'Transaction',
                'entity_id' => $trxCode,
                'user_id' => $user->id ?? 1,
                'user_name' => $user->name ?? 'Operador',
                'details' => "{$validated['type']} de {$validated['amount_foreign']} {$validated['currency']} por {$amountCUP} CUP.",
            ]);

            return response()->json($transaction, 201);
        });
    }

    /**
     * Anulación con reversión estricta de saldos
     */
    public function cancel(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string|max:255']);
        $user = $request->user();

        return DB::transaction(function () use ($id, $request, $user) {
            $trx = Transaction::lockForUpdate()->findOrFail($id);

            if ($trx->status === 'anulada') {
                return response()->json(['error' => 'Esta operación ya ha sido anulada anteriormente.'], 400);
            }

            // Revertir saldos
            $sourceAcc = Account::lockForUpdate()->find($trx->source_account_id);
            $targetAcc = Account::lockForUpdate()->find($trx->target_account_id);

            if ($trx->type === 'compra') {
                if ($sourceAcc) $sourceAcc->decrement('balance', $trx->amount_foreign);
                if ($targetAcc) $targetAcc->increment('balance', $trx->amount_cup);
            } else {
                if ($targetAcc) $targetAcc->increment('balance', $trx->amount_foreign);
                if ($sourceAcc) $sourceAcc->decrement('balance', $trx->amount_cup);
            }

            $trx->update([
                'status' => 'anulada',
                'cancelled_at' => Carbon::now(),
                'cancelled_by' => $user->name ?? 'Admin',
                'cancel_reason' => $request->reason,
            ]);

            AuditLog::create([
                'action' => 'ANULAR_TRANSACCION',
                'entity' => 'Transaction',
                'entity_id' => $trx->code,
                'user_id' => $user->id ?? 1,
                'user_name' => $user->name ?? 'Admin',
                'details' => "Operación {$trx->code} anulada. Motivo: {$request->reason}",
            ]);

            return response()->json(['message' => 'Transacción anulada y saldos de caja revertidos.', 'transaction' => $trx]);
        });
    }
}
