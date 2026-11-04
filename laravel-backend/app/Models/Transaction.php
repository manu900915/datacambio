<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'transacted_at',
        'type',
        'currency',
        'amount_foreign',
        'amount_cup',
        'rate_applied',
        'spread_profit_cup',
        'payment_method',
        'source_account_id',
        'target_account_id',
        'client_name',
        'client_doc_id',
        'client_phone',
        'status',
        'notes',
        'operator_id',
        'operator_name',
        'cancelled_at',
        'cancelled_by',
        'cancel_reason',
    ];

    protected $casts = [
        'transacted_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'amount_foreign' => 'decimal:2',
        'amount_cup' => 'decimal:2',
        'rate_applied' => 'decimal:2',
        'spread_profit_cup' => 'decimal:2',
    ];

    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function sourceAccount()
    {
        return $this->belongsTo(Account::class, 'source_account_id');
    }

    public function targetAccount()
    {
        return $this->belongsTo(Account::class, 'target_account_id');
    }
}
