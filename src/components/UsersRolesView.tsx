import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Plus, 
  Check, 
  Edit3, 
  Trash2, 
  Lock, 
  Mail, 
  Phone, 
  Key, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Search,
  Sparkles,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { User, Role, PermissionKey } from '../types';
import { AVAILABLE_PERMISSIONS } from '../services/storage';

interface UsersRolesViewProps {
  users: User[];
  roles: Role[];
  activeUser: User;
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => boolean;
  onAddRole: (role: Omit<Role, 'id'>) => void;
  onUpdateRole: (id: string, role: Partial<Role>) => void;
  onDeleteRole: (id: string) => boolean;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  users,
  roles,
  activeUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddRole,
  onUpdateRole,
  onDeleteRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'roles'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState(roles[0]?.code || 'cajero');
  const [userPhone, setUserPhone] = useState('');
  const [userIsActive, setUserIsActive] = useState(true);

  // Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleColor, setRoleColor] = useState('emerald');
  const [rolePermissions, setRolePermissions] = useState<PermissionKey[]>([]);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Open User Modal for Create or Edit
  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUserId(user.id);
      setUserName(user.name);
      setUserUsername(user.username);
      setUserEmail(user.email);
      setUserPassword('');
      setUserRole(user.role);
      setUserPhone(user.phone || '');
      setUserIsActive(user.isActive);
    } else {
      setEditingUserId(null);
      setUserName('');
      setUserUsername('');
      setUserEmail('');
      setUserPassword('');
      setUserRole(roles[0]?.code || 'cajero');
      setUserPhone('');
      setUserIsActive(true);
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userUsername.trim()) {
      alert('Por favor completa el nombre y nombre de usuario.');
      return;
    }

    if (editingUserId) {
      const updateData: Partial<User> = {
        name: userName.trim(),
        username: userUsername.trim().toLowerCase(),
        email: userEmail.trim(),
        role: userRole,
        phone: userPhone.trim(),
        isActive: userIsActive
      };
      if (userPassword.trim()) {
        updateData.password = userPassword.trim();
      }
      onUpdateUser(editingUserId, updateData);
      showNotification(`Usuario "${userName}" actualizado con éxito.`);
    } else {
      onAddUser({
        name: userName.trim(),
        username: userUsername.trim().toLowerCase(),
        email: userEmail.trim() || `${userUsername.trim().toLowerCase()}@cambiocuba.cu`,
        password: userPassword.trim() || '123456',
        role: userRole,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        phone: userPhone.trim(),
        isActive: userIsActive
      });
      showNotification(`Usuario "${userName}" creado exitosamente.`);
    }

    setIsUserModalOpen(false);
  };

  // Open Role Modal for Create or Edit
  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setEditingRoleId(role.id);
      setRoleName(role.name);
      setRoleCode(role.code);
      setRoleDescription(role.description);
      setRoleColor(role.color);
      setRolePermissions([...role.permissions]);
    } else {
      setEditingRoleId(null);
      setRoleName('');
      setRoleCode('');
      setRoleDescription('');
      setRoleColor('emerald');
      setRolePermissions(['transactions_create']);
    }
    setIsRoleModalOpen(true);
  };

  const handleTogglePermission = (key: PermissionKey) => {
    if (rolePermissions.includes(key)) {
      setRolePermissions(rolePermissions.filter(p => p !== key));
    } else {
      setRolePermissions([...rolePermissions, key]);
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert('El nombre del rol es requerido.');
      return;
    }

    const code = roleCode.trim().toLowerCase().replace(/\s+/g, '_') || roleName.trim().toLowerCase().replace(/\s+/g, '_');

    if (editingRoleId) {
      onUpdateRole(editingRoleId, {
        name: roleName.trim(),
        description: roleDescription.trim(),
        color: roleColor,
        permissions: rolePermissions
      });
      showNotification(`Rol "${roleName}" actualizado con éxito.`);
    } else {
      onAddRole({
        name: roleName.trim(),
        code,
        description: roleDescription.trim(),
        color: roleColor,
        permissions: rolePermissions,
        isSystem: false
      });
      showNotification(`Nuevo rol "${roleName}" creado exitosamente.`);
    }

    setIsRoleModalOpen(false);
  };

  const getRoleBadge = (roleCode: string) => {
    const r = roles.find(role => role.code === roleCode);
    if (!r) return <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">{roleCode}</span>;

    const colors: Record<string, string> = {
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[r.color] || colors.emerald}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        <span>{r.name}</span>
      </span>
    );
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Gestión de Usuarios, Operadores & Roles
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Crea cajeros, supervisores y define roles con permisos dinámicos listos para ajustar según tus necesidades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'users' ? (
            <button
              onClick={() => handleOpenUserModal()}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Nuevo Usuario</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenRoleModal()}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Crear Nuevo Rol</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Subtabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuarios ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('roles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'roles'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Roles & Permisos ({roles.length})</span>
          </button>
        </div>

        {activeSubTab === 'users' && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuario por nombre, rol o email..."
              className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-72"
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: LISTADO DE USUARIOS */}
      {/* ======================================================== */}
      {activeSubTab === 'users' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Nombre de Usuario</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Último Acceso</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => {
                  const isCurrentActive = activeUser.id === u.id;
                  const isMainAdmin = u.username === 'admin';
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{u.name}</span>
                              {isCurrentActive && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-medium">
                                  Tú
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        @{u.username}
                      </td>

                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-3 px-4 text-slate-400 space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={isMainAdmin}
                          onClick={() => onUpdateUser(u.id, { isActive: !u.isActive })}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            u.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                          title="Clic para cambiar estado activo/inactivo"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                          <span>{u.isActive ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {u.lastLogin || 'Nunca ha ingresado'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenUserModal(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Editar Usuario"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {!isMainAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Estás seguro de que deseas eliminar el usuario "@${u.username}"?`)) {
                                  onDeleteUser(u.id);
                                  showNotification(`Usuario "@${u.username}" eliminado.`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Eliminar Usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: LISTADO DE ROLES Y MATRIZ DE PERMISOS */}
      {/* ======================================================== */}
      {activeSubTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((r) => {
            const usersCount = users.filter(u => u.role === r.code).length;
            return (
              <div
                key={r.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getRoleBadge(r.code)}
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {usersCount} {usersCount === 1 ? 'usuario' : 'usuarios'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base">{r.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Código: {r.code}</div>
                  </div>

                  {/* Permisos asignados */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Permisos habilitados ({r.permissions.length} de {AVAILABLE_PERMISSIONS.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map(permKey => {
                        const def = AVAILABLE_PERMISSIONS.find(p => p.key === permKey);
                        return (
                          <span
                            key={permKey}
                            className="bg-slate-950 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                            <span>{def?.label || permKey}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {r.isSystem ? 'Rol de Sistema (Protegido)' : 'Rol Personalizado'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenRoleModal(r)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Configurar Permisos de este Rol"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {!r.isSystem && (
                      <button
                        onClick={() => {
                          if (usersCount > 0) {
                            alert(`No puedes eliminar este rol porque tiene ${usersCount} usuario(s) asignado(s). Primero cambia el rol de esos usuarios.`);
                            return;
                          }
                          if (confirm(`¿Eliminar el rol "${r.name}"?`)) {
                            onDeleteRole(r.id);
                            showNotification(`Rol "${r.name}" eliminado.`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Eliminar Rol"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR / EDITAR USUARIO */}
      {/* ======================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario / Operador'}
                  </h3>
                  <p className="text-xs text-slate-400">Asigna credenciales y rol de acceso</p>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ej. Carlos Martínez"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Usuario (@login) *</label>
                  <input
                    type="text"
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="ej. carlos, cajero1..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="usuario@cambiocuba.cu"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {editingUserId ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required={!editingUserId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rol Asignado *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {roles.map(r => (
                      <option key={r.code} value={r.code}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Móvil (+53)</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="+53 5xxxxxxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="userIsActive"
                  checked={userIsActive}
                  onChange={(e) => setUserIsActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="userIsActive" className="text-xs text-slate-300 cursor-pointer">
                  Usuario Activo (Permite iniciar sesión en el sistema)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR / CONFIGURAR ROL Y PERMISOS */}
      {/* ======================================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingRoleId ? 'Configurar Rol & Permisos' : 'Crear Nuevo Rol Personalizado'}
                  </h3>
                  <p className="text-xs text-slate-400">Define las responsabilidades y privilegios de este rol</p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Rol *</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Ej. Supervisor de Turno"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Código Identificador</label>
                  <input
                    type="text"
                    disabled={!!editingRoleId}
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value)}
                    placeholder="ej. supervisor_caja"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción del Rol</label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Ej. Encargado de supervisar balances y autorizar operaciones..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Color Distintivo de la Insignia:</label>
                <div className="flex gap-2">
                  {[
                    { id: 'emerald', bg: 'bg-emerald-500', name: 'Esmeralda' },
                    { id: 'blue', bg: 'bg-blue-500', name: 'Azul' },
                    { id: 'purple', bg: 'bg-purple-500', name: 'Púrpura' },
                    { id: 'amber', bg: 'bg-amber-500', name: 'Ámbar' },
                    { id: 'red', bg: 'bg-red-500', name: 'Rojo' },
                    { id: 'cyan', bg: 'bg-cyan-500', name: 'Cian' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRoleColor(c.id)}
                      className={`w-7 h-7 rounded-full ${c.bg} cursor-pointer transition-transform ${roleColor === c.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Matriz de Permisos */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Permisos de Acceso ({rolePermissions.length} seleccionados)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (rolePermissions.length === AVAILABLE_PERMISSIONS.length) {
                        setRolePermissions([]);
                      } else {
                        setRolePermissions(AVAILABLE_PERMISSIONS.map(p => p.key));
                      }
                    }}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    {rolePermissions.length === AVAILABLE_PERMISSIONS.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = rolePermissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                          isChecked ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{perm.label}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                              {perm.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{perm.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  {editingRoleId ? 'Guardar Rol & Permisos' : 'Crear Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
