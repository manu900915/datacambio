import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  Database, 
  Wallet, 
  Terminal, 
  User as UserIcon,
  Clock,
  ChevronDown,
  Layers,
  RotateCcw,
  Info,
  LogOut,
  Key,
  Shield,
  Check,
  Mail,
  Phone
} from 'lucide-react';
import { User, Role, ExchangeRate } from '../types';
import { canAccessTab, hasPermission, AVAILABLE_PERMISSIONS } from '../services/storage';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeUser: User;
  roles: Role[];
  onLogout: () => void;
  onOpenChangePassword: () => void;
  onResetAllData: () => void;
  rates: ExchangeRate[];
  onNewTransaction: () => void;
  quickStats: {
    totalUSD: number;
    totalCUP: number;
    totalMLC: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeUser,
  roles,
  onLogout,
  onOpenChangePassword,
  onResetAllData,
  rates,
  onNewTransaction,
  quickStats
}) => {
  const [cubaTime, setCubaTime] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Havana',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCubaTime(new Intl.DateTimeFormat('es-CU', options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'transactions', label: 'Operaciones', icon: ArrowLeftRight },
    { id: 'rates', label: 'Tasas de Cambio', icon: TrendingUp },
    { id: 'reports', label: 'Reportes Financieros', icon: FileText },
    { id: 'accounts', label: 'Cajas & Cuentas', icon: Wallet },
    { id: 'users', label: 'Usuarios & Roles', icon: UserIcon },
    { id: 'audit', label: 'Auditoría & Accesos', icon: ShieldCheck },
    { id: 'backups', label: 'Copias de Seguridad', icon: Database },
    { id: 'laravel-deploy', label: 'Despliegue Laravel & CI/CD', icon: Terminal, highlight: true }
  ];

  // FILTRADO DINÁMICO DE PESTAÑAS SEGÚN EL ROL DEL USUARIO AUTENTICADO
  const visibleNavItems = allNavItems.filter(item => canAccessTab(item.id, activeUser, roles));

  const canCreateOperation = hasPermission(activeUser, 'transactions_create', roles);
  const canManageUsers = hasPermission(activeUser, 'users_manage', roles);

  const userRoleObj = roles.find(r => r.code === activeUser.role);

  const getRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case 'desarrollador':
        return (
          <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Desarrollador (Total)
          </span>
        );
      case 'admin':
        return (
          <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Administrador
          </span>
        );
      case 'cajero':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Cajero Mostrador
          </span>
        );
      case 'auditor':
        return (
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Auditor (Solo Lectura)
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[11px] px-2 py-0.5 rounded font-medium">
            {roleCode}
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl no-print">
      {/* Ticker superior con tasas en vivo, saldos y reset */}
      <div className="bg-slate-950/90 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px]">MERCADO CUBA (CUP):</span>
          </div>
          {rates.map(rate => (
            <div key={rate.currency} className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono shrink-0">
              <span className="font-bold text-slate-200 text-xs">{rate.currency}</span>
              <span className="text-emerald-400 text-[11px]">C: {rate.buyRate}</span>
              <span className="text-slate-600">|</span>
              <span className="text-blue-400 text-[11px]">V: {rate.sellRate}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          {canAccessTab('accounts', activeUser, roles) ? (
            <div className="hidden lg:flex items-center gap-2.5 bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[11px]">Saldos en Caja:</span>
              <span className="text-emerald-400 font-mono font-medium">${quickStats.totalUSD.toLocaleString()} USD</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-mono font-medium">${quickStats.totalCUP.toLocaleString()} CUP</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-300 font-mono font-medium">${quickStats.totalMLC.toLocaleString()} MLC</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 bg-purple-950/40 border border-purple-800/40 px-2.5 py-0.5 rounded text-[11px] text-purple-300">
              <Info className="w-3 h-3 text-purple-400" />
              <span>Modo Auditoría Activo</span>
            </div>
          )}

          {/* Botón de Poner Cajas a $0 */}
          <button
            type="button"
            onClick={onResetAllData}
            title="Limpiar base de datos local y reiniciar a $0.00 limpio"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Poner Cajas a $0</span>
          </button>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>La Habana: <strong className="text-slate-200">{cubaTime || '09:47 AM'}</strong></span>
          </div>
        </div>
      </div>

      {/* Barra Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
              🇨🇺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Cambio<span className="text-emerald-400">Cuba</span>
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Divisas, Cajas y Auditoría</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canCreateOperation ? (
              <button
                onClick={onNewTransaction}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Nueva Operación</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs px-3 py-2 rounded-lg font-medium" title="El rol Auditor tiene bloqueada la creación de operaciones (solo lectura)">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Auditor:</span>
                <span>Solo Lectura</span>
              </div>
            )}

            {/* Menú del USUARIO AUTÉNTICADO (SOLO EL USUARIO QUE INICIÓ SESIÓN) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer"
                title="Mi Perfil de Usuario y Opciones de Sesión"
              >
                <div className="relative">
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    className="w-8 h-8 rounded-full border border-slate-600 object-cover shrink-0"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200">{activeUser.name.split(' ')[0]}</span>
                    {getRoleBadge(activeUser.role)}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <span>@{activeUser.username}</span>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menú Desplegable con SOLO los datos del usuario autenticado */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  {/* Tarjeta del Usuario Autenticado */}
                  <div className="p-4 bg-slate-950/90 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeUser.avatar}
                        alt={activeUser.name}
                        className="w-12 h-12 rounded-full border-2 border-emerald-500/50 object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="text-sm font-bold text-white truncate">{activeUser.name}</div>
                        <div className="text-xs text-slate-400 font-mono">@{activeUser.username}</div>
                        <div className="mt-1">{getRoleBadge(activeUser.role)}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{activeUser.email}</span>
                      </div>
                      {activeUser.phone && (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{activeUser.phone}</span>
                        </div>
                      )}
                      <div className="text-[10px] text-emerald-400 pt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Sesión Autenticada en Base de Datos</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de permisos del rol */}
                  {userRoleObj && (
                    <div className="p-3 bg-slate-900/50 border-b border-slate-800 text-[11px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-cyan-400" />
                        <span>Permisos Asignados ({userRoleObj.permissions.length}):</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">
                        {userRoleObj.description}
                      </div>
                    </div>
                  )}

                  {/* Acciones de la cuenta */}
                  <div className="p-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenChangePassword();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Key className="w-4 h-4 text-emerald-400" />
                      <span>Cambiar Mi Contraseña</span>
                    </button>

                    {canManageUsers && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('users');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-cyan-400" />
                        <span>Administración de Usuarios & Roles</span>
                      </button>
                    )}

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Directo para Cerrar Sesión */}
            <button
              type="button"
              onClick={onLogout}
              title="Cerrar sesión actual e ir a la pantalla de Login"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-red-500/15 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-400 rounded-xl transition-all text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400 shrink-0" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación filtradas según rol */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? item.highlight
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : item.highlight
                    ? 'text-cyan-400/90 hover:bg-slate-800/80 hover:text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (item.highlight ? 'text-cyan-400' : 'text-emerald-400') : ''}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="bg-cyan-500 text-slate-950 font-extrabold text-[9px] px-1 rounded uppercase">
                    DevOps
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
