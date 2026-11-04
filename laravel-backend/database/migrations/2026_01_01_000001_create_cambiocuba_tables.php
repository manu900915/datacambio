<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Roles y Usuarios
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'cajero', 'auditor'])->default('cajero');
            $table->string('avatar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. Registro de Inicios de Sesión y Auditoría de Acceso
        Schema::create('login_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('user_name');
            $table->string('role');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->enum('status', ['exito', 'fallido']);
            $table->string('location_note')->nullable();
            $table->timestamp('logged_at');
            $table->timestamps();

            $table->index(['logged_at', 'status']);
        });

        // 3. Tasas de Cambio (USD, EUR, MLC)
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('currency', 10)->unique(); // USD, EUR, MLC
            $table->string('name');
            $table->decimal('buy_rate', 12, 2); // Tasa Compra en CUP
            $table->decimal('sell_rate', 12, 2); // Tasa Venta en CUP
            $table->decimal('market_reference', 12, 2)->nullable(); // Ref informal
            $table->foreignId('updated_by_id')->nullable()->constrained('users');
            $table->string('updated_by_name');
            $table->timestamps();
        });

        // 4. Historial de Cambios de Tasas
        Schema::create('rate_histories', function (Blueprint $table) {
            $table->id();
            $table->string('currency', 10);
            $table->decimal('old_buy', 12, 2);
            $table->decimal('new_buy', 12, 2);
            $table->decimal('old_sell', 12, 2);
            $table->decimal('new_sell', 12, 2);
            $table->string('updated_by');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('created_at');
        });

        // 5. Cuentas y Cajas (Efectivo y Bancarias)
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('currency', 10); // CUP, USD, EUR, MLC
            $table->decimal('balance', 16, 2)->default(0);
            $table->enum('account_type', ['efectivo', 'banco_tarjeta']);
            $table->string('account_number')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 6. Transacciones de Compra/Venta de Divisas
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // TRX-2026-XXXX
            $table->dateTime('transacted_at');
            $table->enum('type', ['compra', 'venta']);
            $table->string('currency', 10); // USD, EUR, MLC
            $table->decimal('amount_foreign', 14, 2);
            $table->decimal('amount_cup', 16, 2);
            $table->decimal('rate_applied', 12, 2);
            $table->decimal('spread_profit_cup', 14, 2)->default(0);
            $table->string('payment_method'); // Efectivo, Transfermóvil, EnZona, Transferencia
            
            $table->foreignId('source_account_id')->nullable()->constrained('accounts');
            $table->foreignId('target_account_id')->nullable()->constrained('accounts');
            
            $table->string('client_name');
            $table->string('client_doc_id', 20)->nullable(); // Carnet de Identidad
            $table->string('client_phone', 30)->nullable();
            
            $table->enum('status', ['completada', 'pendiente', 'anulada'])->default('completada');
            $table->text('notes')->nullable();
            
            $table->foreignId('operator_id')->constrained('users');
            $table->string('operator_name');
            
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancelled_by')->nullable();
            $table->text('cancel_reason')->nullable();
            
            $table->timestamps();

            // Índices para reportes de alto rendimiento
            $table->index(['transacted_at', 'type', 'status']);
            $table->index('currency');
            $table->index('operator_id');
        });

        // 7. Registro de Auditoría General
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->string('entity');
            $table->string('entity_id');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('user_name');
            $table->text('details');
            $table->timestamps();

            $table->index(['created_at', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('rate_histories');
        Schema::dropIfExists('exchange_rates');
        Schema::dropIfExists('login_logs');
        Schema::dropIfExists('users');
    }
};
