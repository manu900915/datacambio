<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ExchangeRateController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\BackupController;

/*
|--------------------------------------------------------------------------
| Rutas API - CambioCuba Pro (Laravel 11)
|--------------------------------------------------------------------------
*/

// Autenticación pública y registro de accesos
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/login-logs', [AuthController::class, 'getLoginLogs']);

// Rutas protegidas por Sanctum / Roles
Route::middleware(['auth:sanctum'])->group(function () {
    // Usuario autenticado
    Route::get('/user', [AuthController::class, 'me']);

    // Gestión de Tasas de Cambio
    Route::get('/rates', [ExchangeRateController::class, 'index']);
    Route::post('/rates', [ExchangeRateController::class, 'update'])->middleware('role:admin');
    Route::get('/rates/history', [ExchangeRateController::class, 'history']);

    // Transacciones y Operaciones de Divisas
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::post('/transactions/{id}/cancel', [TransactionController::class, 'cancel'])->middleware('role:admin,auditor');

    // Cuentas y Cajas
    Route::get('/accounts', [TransactionController::class, 'getAccounts']);
    Route::post('/accounts/{id}/adjust', [TransactionController::class, 'adjustAccount'])->middleware('role:admin');

    // Reportes (Diarios, Semanales, Mensuales)
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/weekly', [ReportController::class, 'weekly']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/custom', [ReportController::class, 'customRange']);

    // Copias de Seguridad y Auditoría
    Route::get('/backups', [BackupController::class, 'index']);
    Route::post('/backups/create', [BackupController::class, 'create'])->middleware('role:admin');
    Route::get('/backups/{id}/download', [BackupController::class, 'download'])->middleware('role:admin');
    Route::get('/audit-logs', [BackupController::class, 'auditLogs'])->middleware('role:admin,auditor');
});
