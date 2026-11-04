import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  History, 
  Globe, 
  Laptop,
  AlertTriangle
} from 'lucide-react';
import { LoginLog, AuditLog, User } from '../types';

interface AuditViewProps {
  loginLogs: LoginLog[];
  auditLogs: AuditLog[];
  activeUser: User;
}

export const AuditView: React.FC<AuditViewProps> = ({
  loginLogs,
  auditLogs,
  activeUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'logins' | 'actions'>('logins');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'exito' | 'fallido'>('todos');

  // Filter login logs
  const filteredLogins = useMemo(() => {
    return loginLogs.filter(log => {
      const matchSearch =
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.userAgent && log.userAgent.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter !== 'todos' && log.status !== statusFilter) return false;

      return true;
    });
  }, [loginLogs, searchTerm, statusFilter]);

  // Filter audit logs
  const filteredAudits = useMemo(() => {
    return auditLogs.filter(aud => {
      return (
        aud.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aud.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aud.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aud.entityId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [auditLogs, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Seguridad, Control de Acceso & Pista de Auditoría</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Registro inmutable de quién se autentica en la aplicación, terminales locales/VPN y acciones financieras sensibles.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('logins')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'logins'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Registro de Inicios de Sesión ({loginLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('actions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'actions'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Auditoría de Acciones del Sistema ({auditLogs.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario, IP, acción o detalle..."
            className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-72"
          />
        </div>
      </div>

      {/* Tab Content: Logins */}
      {activeSubTab === 'logins' ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Historial de Autenticación de Operadores & Cajeros
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filtrar estado:</span>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="todos">Todos los accesos</option>
                <option value="exito">Solo exitosos</option>
                <option value="fallido">Solo fallidos / alertas</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Usuario Autenticado</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Dirección IP & Red</th>
                  <th className="py-3 px-4">Navegador / Dispositivo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Ubicación / Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredLogins.map((log) => {
                  const isSuccess = log.status === 'exito';
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        {log.userName}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.role === 'admin'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : log.role === 'cajero'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{log.ipAddress}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-sans truncate max-w-xs">
                        {log.userAgent}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {isSuccess ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isSuccess ? 'Éxito' : 'Fallido'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                        {log.location || 'Local'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab Content: System Audit Trail */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-950/70 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Pista de Auditoría de Operaciones Sensibles (ACID Audit Logs)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Entidad Afectada</th>
                  <th className="py-3 px-4">ID Objeto</th>
                  <th className="py-3 px-4">Operador Responsable</th>
                  <th className="py-3 px-4">Detalles del Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredAudits.map((aud) => (
                  <tr key={aud.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">{aud.timestamp}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {aud.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{aud.entity}</td>
                    <td className="py-3 px-4 text-amber-300 font-bold">{aud.entityId}</td>
                    <td className="py-3 px-4 font-sans text-slate-200">{aud.userName}</td>
                    <td className="py-3 px-4 font-sans text-slate-300 text-xs">{aud.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
