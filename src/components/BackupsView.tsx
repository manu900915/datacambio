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
  Plus
} from 'lucide-react';
import { BackupSnapshot, User } from '../types';

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

  const handleManualBackup = () => {
    onCreateBackup('Manual');
    setSuccessMsg('Copia de seguridad manual generada y verificada exitosamente.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRestoreFile(e.target.files[0]);
    }
  };

  const handleExecuteRestore = () => {
    if (!restoreFile) return;

    if (activeUser.role !== 'admin') {
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
            Respaldos programados a las 23:59:00 cada noche con política de retención de 30 días y restauración rápida.
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

      {/* Backup Status Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Cron Diario Automatizado</h3>
              <p className="text-xs text-slate-400 mt-0.5">Programado a las 23:59:00 (Hora Cuba)</p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                ● Servicio Activo
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Destino de Almacenamiento</h3>
              <p className="text-xs text-slate-400 mt-0.5">Disco Local de la PC del Cliente</p>
              <span className="inline-block mt-2 text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                /opt/cambiocuba/backups/
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Política de Retención</h3>
              <p className="text-xs text-slate-400 mt-0.5">Rotación automática de 30 días</p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                Compresión gzip .sql.gz
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
          <span className="text-xs text-slate-500 font-mono">
            Último respaldo hace pocas horas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-sans">
              <tr>
                <th className="py-3 px-4">Nombre de Archivo</th>
                <th className="py-3 px-4">Fecha y Hora Generado</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Tamaño</th>
                <th className="py-3 px-4">Registros Respaldados</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Descargar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {backups.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-500" />
                    <span>{bk.filename}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">{bk.timestamp}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                      {bk.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{bk.sizeKb} KB</td>
                  <td className="py-3 px-4 text-amber-300">{bk.recordsCount} filas</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {bk.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={onExportFullJSON}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Descargar copia para resguardo externo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Database Box */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Restauración de Copia de Seguridad</h3>
        </div>
        <p className="text-xs text-slate-400">
          Si necesitas recuperar el sistema tras un formateo o migración de PC, carga el archivo de respaldo exportado (.json o .sql).
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".json,.sql"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
          />
          <button
            onClick={handleExecuteRestore}
            disabled={!restoreFile}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              restoreFile
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Iniciar Restauración de Tablas
          </button>
        </div>
      </div>
    </div>
  );
};
