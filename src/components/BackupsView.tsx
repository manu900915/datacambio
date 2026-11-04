import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HardDrive, 
  AlertCircle,
  FileCode,
  RefreshCw,
  Plus,
  Settings,
  X,
  Save,
  Check,
  Folder,
  Calendar
} from 'lucide-react';
import { BackupSnapshot, User, BackupConfig } from '../types';
import { storageService } from '../services/storage';

interface BackupsViewProps {
  backups: BackupSnapshot[];
  activeUser: User;
  onCreateBackup: (type: 'Automático Diario' | 'Manual') => void;
  onExportFullJSON: () => void;
  onRestoreJSON: (jsonStr: string) => boolean;
}

export const BackupsView: React.FC<BackupsViewProps> = ({
  backups,
  activeUser,
  onCreateBackup,
  onExportFullJSON,
  onRestoreJSON
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  // Backup Configuration State
  const [config, setConfig] = useState<BackupConfig>(() => storageService.getBackupConfig());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Form State for Editing Config
  const [formCronEnabled, setFormCronEnabled] = useState<boolean>(config.cronEnabled);
  const [formCronTime, setFormCronTime] = useState<string>(config.cronTime || '23:59');
  const [formCronFrequency, setFormCronFrequency] = useState<'diario' | 'cada_12h' | 'semanal'>(config.cronFrequency || 'diario');
  const [formStoragePath, setFormStoragePath] = useState<string>(config.storagePath || '/opt/datacambio/backups/');
  const [formStorageLabel, setFormStorageLabel] = useState<string>(config.storageLabel || 'Disco Local de la PC del Cliente');
  const [formRetentionDays, setFormRetentionDays] = useState<number>(config.retentionDays || 30);
  const [formCompressionType, setFormCompressionType] = useState<'gzip .sql.gz' | 'zip' | 'json'>(config.compressionType || 'gzip .sql.gz');

  const canManageBackups = activeUser.role === 'admin' || activeUser.role === 'desarrollador';

  const handleManualBackup = () => {
    onCreateBackup('Manual');
    setSuccessMsg('Copia de seguridad manual generada y verificada exitosamente.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleOpenConfigModal = () => {
    // Sincronizar form con estado actual
    setFormCronEnabled(config.cronEnabled);
    setFormCronTime(config.cronTime || '23:59');
    setFormCronFrequency(config.cronFrequency || 'diario');
    setFormStoragePath(config.storagePath || '/opt/datacambio/backups/');
    setFormStorageLabel(config.storageLabel || 'Disco Local de la PC del Cliente');
    setFormRetentionDays(config.retentionDays || 30);
    setFormCompressionType(config.compressionType || 'gzip .sql.gz');
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageBackups) {
      alert('Solo un Administrador o Desarrollador puede modificar los parámetros de copia de seguridad.');
      return;
    }

    const updated: BackupConfig = {
      cronEnabled: formCronEnabled,
      cronTime: formCronTime.trim() || '23:59',
      cronFrequency: formCronFrequency,
      storagePath: formStoragePath.trim() || '/opt/datacambio/backups/',
      storageLabel: formStorageLabel.trim() || 'Disco Local de la PC del Cliente',
      retentionDays: Number(formRetentionDays) || 30,
      compressionType: formCompressionType
    };

    const saved = storageService.saveBackupConfig(updated, activeUser);
    setConfig(saved);
    setIsConfigModalOpen(false);
    setSuccessMsg('Parámetros de backup y retención actualizados exitosamente.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRestoreFile(e.target.files[0]);
    }
  };

  const handleExecuteRestore = () => {
    if (!restoreFile) return;

    if (!canManageBackups) {
      alert('Solo el Administrador puede restaurar copias de seguridad de la base de datos.');
      return;
    }

    if (!confirm('ADVERTENCIA: Esta acción sobrescribirá las tablas actuales con los datos del respaldo seleccionado. ¿Deseas proceder?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = onRestoreJSON(text);
      if (success) {
        setSuccessMsg('Base de datos restaurada correctamente desde el archivo.');
        setRestoreFile(null);
      } else {
        alert('Error: El archivo no contiene un formato de respaldo JSON válido.');
      }
    };
    reader.readAsText(restoreFile);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Copias de Seguridad Automatizadas Diarias (Backups)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Respaldos programados a las {config.cronTime || '23:59'} con retención de {config.retentionDays} días y almacenamiento local configurable.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportFullJSON}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Volcado Completo (.JSON)</span>
          </button>
          <button
            onClick={handleManualBackup}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generar Backup Ahora</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Backup Status Banner (DINÁMICO Y EDITABLE) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span>Parámetros del Servicio de Respaldo</span>
            {config.lastModified && (
              <span className="text-[10px] text-slate-500 font-normal font-mono">
                • Modificado el {config.lastModified} {config.modifiedBy ? `por ${config.modifiedBy}` : ''}
              </span>
            )}
          </div>

          {canManageBackups && (
            <button
              type="button"
              onClick={handleOpenConfigModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Modificar hora del cron, ruta de almacenamiento y días de retención"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Modificar Opciones</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta 1: Cron Automatizado */}
          <div 
            onClick={canManageBackups ? handleOpenConfigModal : undefined}
            className={`flex items-start gap-3 p-3 rounded-xl border border-transparent transition-all ${
              canManageBackups ? 'hover:bg-slate-800/40 hover:border-slate-800 cursor-pointer' : ''
            }`}
          >
            <div className={`p-2.5 rounded-xl border ${
              config.cronEnabled 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Cron Automatizado</h3>
                {canManageBackups && (
                  <span className="text-[10px] text-slate-500 hover:text-emerald-400">(Editar)</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Programado a las {config.cronTime || '23:59:00'} (Hora Cuba)
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                  config.cronEnabled 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' 
                    : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                }`}>
                  {config.cronEnabled ? '● Servicio Activo' : '○ En Pausa'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono capitalize">
                  {config.cronFrequency === 'diario' ? 'Diario' : config.cronFrequency === 'cada_12h' ? 'Cada 12h' : 'Semanal'}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Destino de Almacenamiento */}
          <div 
            onClick={canManageBackups ? handleOpenConfigModal : undefined}
            className={`flex items-start gap-3 p-3 rounded-xl border border-transparent transition-all ${
              canManageBackups ? 'hover:bg-slate-800/40 hover:border-slate-800 cursor-pointer' : ''
            }`}
          >
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Destino de Almacenamiento</h3>
                {canManageBackups && (
                  <span className="text-[10px] text-slate-500 hover:text-blue-400">(Editar)</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{config.storageLabel || 'Disco Local de la PC del Cliente'}</p>
              <span className="inline-block mt-2 text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 truncate max-w-full" title={config.storagePath}>
                {config.storagePath || '/opt/datacambio/backups/'}
              </span>
            </div>
          </div>

          {/* Tarjeta 3: Política de Retención */}
          <div 
            onClick={canManageBackups ? handleOpenConfigModal : undefined}
            className={`flex items-start gap-3 p-3 rounded-xl border border-transparent transition-all ${
              canManageBackups ? 'hover:bg-slate-800/40 hover:border-slate-800 cursor-pointer' : ''
            }`}
          >
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Política de Retención</h3>
                {canManageBackups && (
                  <span className="text-[10px] text-slate-500 hover:text-purple-400">(Editar)</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Rotación automática de {config.retentionDays} días
              </p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                Compresión {config.compressionType || 'gzip .sql.gz'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Backups List Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Instantáneas de Base de Datos Disponibles ({backups.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Destino configurado: <strong className="font-mono text-slate-200">{config.storagePath}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-sans">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Nombre del Archivo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Registros</th>
                <th className="py-3 px-4">Tamaño</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Verificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No hay copias de seguridad registradas aún. Haz clic en "Generar Backup Ahora" para crear la primera instantánea.
                  </td>
                </tr>
              ) : (
                backups.map(b => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-300 font-bold whitespace-nowrap">{b.timestamp}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{b.filename}</td>
                    <td className="py-3 px-4 font-sans text-slate-300">{b.type}</td>
                    <td className="py-3 px-4 text-slate-300">{b.recordsCount} entidades</td>
                    <td className="py-3 px-4 text-slate-400">{b.sizeKb} KB</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-[10px]">{b.checksum}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restauración de Base de Datos */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Restauración de Base de Datos desde Respaldo (.JSON)</h3>
        </div>
        <p className="text-xs text-slate-400">
          Carga un archivo de respaldo previo para restaurar la totalidad de usuarios, cuentas, tasas y transacciones históricas.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="w-full sm:w-auto text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
          />

          <button
            onClick={handleExecuteRestore}
            disabled={!restoreFile}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Ejecutar Restauración Completa</span>
          </button>
        </div>
      </div>

      {/* MODAL: MODIFICAR CONFIGURACIÓN DE BACKUPS & RETENCIÓN */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Modificar Parámetros de Backup</h3>
                  <p className="text-[11px] text-slate-400">Configuración del Cron, Ruta y Retención</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-5 text-xs">
              {/* Sección 1: Cron Automatizado */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Cron y Programación Automática</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formCronEnabled}
                      onChange={(e) => setFormCronEnabled(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
                    />
                    <span className={`text-[11px] font-bold ${formCronEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {formCronEnabled ? 'Habilitado' : 'Pausado'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Hora de Ejecución (Cuba):
                    </label>
                    <input
                      type="time"
                      value={formCronTime}
                      onChange={(e) => setFormCronTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Frecuencia:
                    </label>
                    <select
                      value={formCronFrequency}
                      onChange={(e) => setFormCronFrequency(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="diario">Diario (Cada noche al cierre)</option>
                      <option value="cada_12h">Cada 12 horas</option>
                      <option value="semanal">Semanal (Domingos)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 2: Destino de Almacenamiento */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Destino de Almacenamiento Local</span>
                </label>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Directorio / Ruta en la PC: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formStoragePath}
                    onChange={(e) => setFormStoragePath(e.target.value)}
                    placeholder="Ej. /opt/datacambio/backups/ o /home/manu/backups/"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ruta local del sistema donde los scripts o el demonio guardarán los volcados.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Etiqueta Descriptiva:
                  </label>
                  <input
                    type="text"
                    value={formStorageLabel}
                    onChange={(e) => setFormStorageLabel(e.target.value)}
                    placeholder="Ej. Disco Local de la PC del Cliente"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sección 3: Retención y Compresión */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Política de Retención & Compresión</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Días de Retención:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        required
                        value={formRetentionDays}
                        onChange={(e) => setFormRetentionDays(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-slate-400 text-xs font-mono">días</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Archivos más antiguos se depuran automáticamente.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Tipo de Compresión:
                    </label>
                    <select
                      value={formCompressionType}
                      onChange={(e) => setFormCompressionType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer font-mono"
                    >
                      <option value="gzip .sql.gz">gzip (.sql.gz)</option>
                      <option value="zip">ZIP (.zip)</option>
                      <option value="json">JSON (.json)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Parámetros</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
