import React, { useState } from 'react';
import { 
  Terminal, 
  GitBranch, 
  ShieldCheck, 
  Server, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Lock, 
  Globe, 
  Cpu, 
  FolderGit2, 
  Database,
  Code2,
  FileText
} from 'lucide-react';

export const LaravelDeployView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFileTab, setSelectedFileTab] = useState<'migration' | 'routes' | 'controller' | 'docker' | 'cicd' | 'cron'>('cicd');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filesCode = {
    cicd: `name: CI/CD Despliegue Automático en PC Local (VPN / Tailscale / SSH)

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  test_and_build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build

  deploy_to_client_pc:
    needs: test_and_build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # 1. Conexión segura a la VPN privada (Tailscale)
      - name: Conectar a Tailscale VPN
        uses: tailscale/github-action@v2
        env:
          TAILSCALE_AUTHKEY: \${{ secrets.TAILSCALE_AUTH_KEY }}

      # 2. Despliegue en la IP privada de la PC cliente
      - name: Desplegar en la PC del Cliente vía SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.CLIENT_PC_HOST }} # ej. 100.85.12.34
          username: \${{ secrets.CLIENT_PC_USER }} # ej. servidor
          key: \${{ secrets.CLIENT_PC_SSH_KEY }}
          script: |
            cd /opt/cambiocuba
            git pull origin main
            docker compose down
            docker compose up -d --build
            docker compose exec -T laravel_app php artisan migrate --force
            docker compose exec -T laravel_app php artisan config:cache
            docker compose exec -T laravel_app php artisan route:cache
            echo "✅ Despliegue automático completado con éxito"`,

    docker: `services:
  # Servidor Web Nginx
  nginx:
    image: nginx:alpine
    container_name: cambiocuba_nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ../laravel-backend:/var/www/html
      - ../dist:/var/www/html/public/spa
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - laravel_app
    networks:
      - cambiocuba_network

  # Backend Laravel 11 (PHP 8.3-FPM)
  laravel_app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: cambiocuba_backend
    restart: unless-stopped
    volumes:
      - ../laravel-backend:/var/www/html
      - ../backups:/var/www/html/storage/app/backups
    environment:
      APP_ENV: production
      DB_HOST: db_mysql
      DB_DATABASE: cambiocuba_db
      DB_USERNAME: cambiocuba_user
      DB_PASSWORD: \${DB_PASSWORD:-CambioCubaSecure2026!}
    depends_on:
      - db_mysql
    networks:
      - cambiocuba_network

  # Base de Datos MySQL 8.0
  db_mysql:
    image: mysql:8.0
    container_name: cambiocuba_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD:-RootMasterSecure2026!}
      MYSQL_DATABASE: cambiocuba_db
      MYSQL_USER: cambiocuba_user
      MYSQL_PASSWORD: \${DB_PASSWORD:-CambioCubaSecure2026!}
    volumes:
      - mysql_data:/var/lib/mysql
      - ../backups:/backups
    networks:
      - cambiocuba_network

networks:
  cambiocuba_network:
    driver: bridge

volumes:
  mysql_data:`,

    migration: `// database/migrations/2026_01_01_000001_create_cambiocuba_tables.php
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
    $table->string('payment_method'); // Efectivo, Transfermóvil, EnZona
    $table->foreignId('source_account_id')->constrained('accounts');
    $table->foreignId('target_account_id')->constrained('accounts');
    $table->string('client_name');
    $table->string('client_doc_id', 20)->nullable(); // Carnet de Identidad Cubano
    $table->string('client_phone', 30)->nullable();
    $table->enum('status', ['completada', 'pendiente', 'anulada'])->default('completada');
    $table->foreignId('operator_id')->constrained('users');
    $table->string('operator_name');
    $table->timestamps();

    $table->index(['transacted_at', 'type', 'status']);
});`,

    routes: `// routes/api.php
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login-logs', [AuthController::class, 'getLoginLogs']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    
    // Tasas
    Route::get('/rates', [ExchangeRateController::class, 'index']);
    Route::post('/rates', [ExchangeRateController::class, 'update'])->middleware('role:admin');
    
    // Transacciones y Cajas
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::post('/transactions/{id}/cancel', [TransactionController::class, 'cancel']);
    
    // Reportes Diarios, Semanales y Mensuales
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/weekly', [ReportController::class, 'weekly']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    
    // Backups
    Route::get('/backups', [BackupController::class, 'index']);
    Route::post('/backups/create', [BackupController::class, 'create']);
});`,

    controller: `// app/Http/Controllers/Api/TransactionController.php
public function store(Request $request)
{
    return DB::transaction(function () use ($request) {
        // Bloqueo de saldos ACID para evitar inconsistencias de caja
        $sourceAcc = Account::lockForUpdate()->findOrFail($request->source_account_id);
        $targetAcc = Account::lockForUpdate()->findOrFail($request->target_account_id);

        if ($request->type === 'compra') {
            $sourceAcc->increment('balance', $request->amount_foreign);
            $targetAcc->decrement('balance', $request->amount_cup);
        } else {
            $targetAcc->decrement('balance', $request->amount_foreign);
            $sourceAcc->increment('balance', $request->amount_cup);
        }

        $trx = Transaction::create([...]);
        
        // Pista de auditoría obligatoria
        AuditLog::create([...]);

        return response()->json($trx, 201);
    });
}`,

    cron: `#!/bin/bash
# /opt/cambiocuba/scripts/daily_backup.sh
# Cron diario configurado a las 23:59:00:
# 59 23 * * * /opt/cambiocuba/scripts/daily_backup.sh >> /var/log/cambiocuba_backups.log 2>&1

set -e
BACKUP_DIR="/opt/cambiocuba/backups"
DATE_STR=$(date +"%Y_%m_%d_%H%M%S")
BACKUP_FILE="\${BACKUP_DIR}/cambiocuba_backup_\${DATE_STR}.sql.gz"

mkdir -p "\${BACKUP_DIR}"

# 1. Volcado MySQL comprimido
docker exec -e MYSQL_PWD="CambioCubaSecure2026!" cambiocuba_mysql \\
    mysqldump -u cambiocuba_user --single-transaction cambiocuba_db | gzip > "\${BACKUP_FILE}"

# 2. Purgar respaldos mayores a 30 días
find "\${BACKUP_DIR}" -type f -name "cambiocuba_backup_*.sql.gz" -mtime +30 -exec rm -f {} \\;

echo "✅ Backup diario generado: \${BACKUP_FILE}"`
  };

  const gitCommands = `# 1. Inicializar repositorio git local y guardar archivos
git init
git add .
git commit -m "feat: CambioCuba Pro con Laravel 11, React, Docker y CI/CD"

# 2. Conectar a tu cuenta de GitHub
git remote add origin https://github.com/TU_USUARIO/cambiocuba-pro.git
git branch -M main
git push -u origin main`;

  const vpnSteps = `# Paso A: Instalar Tailscale en la PC del Cliente (Linux Ubuntu/Debian o Windows)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Paso B: En tu laptop o móvil de administración, instala Tailscale y conéctate con la misma cuenta.
# ¡Listo! Obtendrás una IP privada fija como: 100.85.20.10
# Podrás ingresar a la app en el navegador: http://100.85.20.10:80`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">
              Centro de Despliegue Local, Laravel & Automatización CI/CD
            </h2>
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
              DevOps Pack
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Guía técnica completa y archivos para sincronizar con GitHub, desplegar en la PC del cliente por VPN privada y ejecutar respaldos diarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/datacambio.zip"
            download="datacambio.zip"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Proyecto (.ZIP Completo)</span>
          </a>
        </div>
      </div>

      {/* 4 Steps Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">1</span>
            <FolderGit2 className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="font-bold text-white text-sm">Subir a GitHub</h4>
          <p className="text-xs text-slate-400">
            Crea tu repositorio y sube todo el código fuente generado.
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">2</span>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="font-bold text-white text-sm">VPN Privada (Tailscale)</h4>
          <p className="text-xs text-slate-400">
            Conexión por IP local (100.x.y.z) sin abrir puertos en el módem de Cuba.
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">3</span>
            <Server className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="font-bold text-white text-sm">Docker en PC Cliente</h4>
          <p className="text-xs text-slate-400">
            Laravel 11 + Nginx + MySQL 8.0 en contenedores aislados.
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">4</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="font-bold text-white text-sm">CI/CD & Backups</h4>
          <p className="text-xs text-slate-400">
            Auto-deploy con cada git push y copias diarias a las 23:59.
          </p>
        </div>
      </div>

      {/* Quick Setup Guides Accordion / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: GitHub & CI/CD */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Comandos Git para subir a GitHub</h3>
            </div>
            <button
              onClick={() => copyToClipboard(gitCommands, 'git')}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer"
            >
              {copiedId === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'git' ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
            {gitCommands}
          </pre>

          <div className="text-xs text-slate-400 space-y-1">
            <strong className="text-slate-200">Secretos a configurar en tu repositorio de GitHub:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
              <li><code className="text-cyan-400 font-mono">CLIENT_PC_HOST</code>: IP de Tailscale de la PC (ej: 100.85.12.34)</li>
              <li><code className="text-cyan-400 font-mono">CLIENT_PC_USER</code>: Usuario SSH de la PC (ej: usuario o root)</li>
              <li><code className="text-cyan-400 font-mono">CLIENT_PC_SSH_KEY</code>: Clave privada SSH para login sin contraseña</li>
              <li><code className="text-cyan-400 font-mono">TAILSCALE_AUTH_KEY</code>: Token de autenticación de Tailscale</li>
            </ul>
          </div>
        </div>

        {/* Card: VPN & Local Access */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Acceso Remoto Seguro por VPN (Tailscale)</h3>
            </div>
            <button
              onClick={() => copyToClipboard(vpnSteps, 'vpn')}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer"
            >
              {copiedId === 'vpn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'vpn' ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
            {vpnSteps}
          </pre>

          <div className="text-xs text-slate-400 space-y-1">
            <strong className="text-slate-200">¿Por qué Tailscale en Cuba?</strong>
            <p className="text-[11px]">
              En Cuba los routers de ETECSA (Nauta Hogar) tienen NAT simétrica o IPs dinámicas que bloquean el reenvío de puertos estándar. Con una VPN Mesh como Tailscale o WireGuard, se crea un túnel seguro cifrado punto a punto para acceder a la PC cliente desde cualquier lugar con latencia mínima.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer: View actual production files */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white text-sm">Explorador de Código Backend & DevOps Generado</span>
          </div>

          <button
            onClick={() => copyToClipboard(filesCode[selectedFileTab], 'tabCode')}
            className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-colors"
          >
            {copiedId === 'tabCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'tabCode' ? '¡Archivo Copiado!' : 'Copiar Archivo Actual'}</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-1 bg-slate-950 px-4 pt-3 border-b border-slate-800 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'cicd', label: '.github/workflows/deploy.yml', desc: 'Pipeline CI/CD' },
            { id: 'docker', label: 'docker/docker-compose.yml', desc: 'Docker Stack' },
            { id: 'migration', label: 'database/migrations/...tables.php', desc: 'Esquema MySQL' },
            { id: 'routes', label: 'routes/api.php', desc: 'Rutas API Laravel' },
            { id: 'controller', label: 'TransactionController.php', desc: 'Lógica ACID' },
            { id: 'cron', label: 'scripts/daily_backup.sh', desc: 'Respaldo Diario' }
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFileTab(tab.id)}
              className={`px-3 py-2 rounded-t-lg font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer border-t border-x ${
                selectedFileTab === tab.id
                  ? 'bg-slate-900 text-cyan-300 border-slate-700 font-bold'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto text-slate-200 max-h-96">
          <pre>{filesCode[selectedFileTab]}</pre>
        </div>
      </div>
    </div>
  );
};
