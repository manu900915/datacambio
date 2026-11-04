import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User as UserIcon, 
  Key, 
  AlertCircle, 
  Eye,
  EyeOff
} from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  users: User[];
  onLogin: (username: string, pass: string, customIp?: string) => { success: boolean; error?: string };
  isStandaloneScreen?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users: _users,
  onLogin,
  isStandaloneScreen = false
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen && !isStandaloneScreen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña.');
      return;
    }

    try {
      const res = onLogin(username.trim(), password.trim());
      if (!res.success) {
        setError(res.error || 'Credenciales inválidas.');
      } else {
        if (onClose) onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Error al autenticar: ${err?.message || 'Error inesperado'}`);
    }
  };

  const containerClasses = isStandaloneScreen
    ? 'min-h-screen bg-slate-950 flex items-center justify-center p-4'
    : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn';

  return (
    <div className={containerClasses}>
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Decorativo */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-center text-slate-950 relative">
          {!isStandaloneScreen && onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-950/20 text-white hover:bg-slate-950/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-xl mb-3">
            🇨🇺
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            CambioCuba <span className="text-emerald-200">PRO</span>
          </h2>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Acceso Seguro al Sistema de Divisas & Cajas
          </p>
        </div>

        {/* Formulario de Autenticación */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu nombre de usuario"
                  autoComplete="username"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer mt-2"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Conexión cifrada y auditoría de accesos activa</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
