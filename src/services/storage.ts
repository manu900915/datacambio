import {
  User,
  Role,
  PermissionKey,
  PermissionDefinition,
  LoginLog,
  ExchangeRate,
  RateHistoryItem,
  Account,
  Transaction,
  AuditLog,
  BackupSnapshot,
  CurrencyCode
} from '../types';

const STORAGE_KEY_PREFIX = 'cambiocuba_v5_';

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'transactions_create',
    label: 'Registrar Operaciones',
    category: 'Caja & Divisas',
    description: 'Comprar y vender divisas al cliente y emitir comprobantes de canje'
  },
  {
    key: 'transactions_cancel',
    label: 'Anular Transacciones',
    category: 'Caja & Divisas',
    description: 'Anular operaciones y reversar automáticamente los fondos de caja'
  },
  {
    key: 'rates_edit',
    label: 'Modificar Tasas de Cambio',
    category: 'Mesa de Cambio',
    description: 'Actualizar las cotizaciones de compra y venta para USD, EUR y MLC'
  },
  {
    key: 'accounts_view',
    label: 'Ver Cajas & Cuentas',
    category: 'Cuentas & Cajas',
    description: 'Consultar balances de gavetas físicas, tarjetas MLC y cuentas en bancos'
  },
  {
    key: 'accounts_arqueo',
    label: 'Arqueo & Cuadre de Caja',
    category: 'Cuentas & Cajas',
    description: 'Contar efectivo físico, registrar diferencias (sobrante/faltante) y ajustar balances'
  },
  {
    key: 'reports_view',
    label: 'Ver Reportes Financieros',
    category: 'Informes & Cierres',
    description: 'Consultar balances diarios, semanales, mensuales y actas de cierre'
  },
  {
    key: 'users_manage',
    label: 'Gestionar Usuarios & Roles',
    category: 'Seguridad & Acceso',
    description: 'Crear, editar, activar/desactivar operadores y configurar matriz de roles'
  },
  {
    key: 'audit_view',
    label: 'Auditoría & Registro de Logins',
    category: 'Seguridad & Acceso',
    description: 'Ver historial de inicios de sesión por IP y pista de eventos sensibles'
  },
  {
    key: 'backups_manage',
    label: 'Copias de Seguridad',
    category: 'Sistema',
    description: 'Generar respaldos, descargar volcados JSON/SQL y restaurar tablas'
  },
  {
    key: 'deploy_view',
    label: 'Despliegue Laravel & CI/CD',
    category: 'DevOps & Servidor',
    description: 'Acceso a consola de despliegue, Docker, túneles VPN y pipelines'
  }
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-desarrollador',
    name: 'Desarrollador / DevOps Master',
    code: 'desarrollador',
    description: 'Acceso total y sin restricciones: ve y gestiona absolutamente todo, incluido el despliegue.',
    color: 'cyan',
    permissions: [
      'transactions_create',
      'transactions_cancel',
      'rates_edit',
      'accounts_view',
      'accounts_arqueo',
      'reports_view',
      'users_manage',
      'audit_view',
      'backups_manage',
      'deploy_view'
    ],
    isSystem: true
  },
  {
    id: 'role-admin',
    name: 'Administrador General',
    code: 'admin',
    description: 'Control de todo el negocio (usuarios, tasas, cajas, auditoría, reportes), excepto el módulo de despliegue.',
    color: 'red',
    permissions: [
      'transactions_create',
      'transactions_cancel',
      'rates_edit',
      'accounts_view',
      'accounts_arqueo',
      'reports_view',
      'users_manage',
      'audit_view',
      'backups_manage'
    ],
    isSystem: true
  },
  {
    id: 'role-cajero',
    name: 'Cajero / Operador Mostrador',
    code: 'cajero',
    description: 'Operación diaria en mostrador: comprar/vender divisas, consultar tasas y cuadre de caja. Sin acceso a usuarios ni despliegue.',
    color: 'emerald',
    permissions: [
      'transactions_create',
      'accounts_view',
      'accounts_arqueo',
      'rates_edit'
    ],
    isSystem: true
  },
  {
    id: 'role-auditor',
    name: 'Auditor Financiero',
    code: 'auditor',
    description: 'Solo supervisión: visualiza Dashboard, Registro de Operaciones y Reportes. Bloqueado para ejecutar transacciones.',
    color: 'purple',
    permissions: [
      'reports_view',
      'audit_view'
    ],
    isSystem: true
  }
];

// Usuarios iniciales preconfigurados para cada rol para permitir pruebas y conmutación inmediata
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-dev-1',
    name: 'Enmanuel Caraballo (Dev)',
    username: 'dev',
    email: 'enmanuelcaraballoborrajo@gmail.com',
    role: 'desarrollador',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    phone: '+53 5000 0000',
    password: 'dev',
    createdAt: '2026-10-31 09:00:00',
    lastLogin: '2026-10-31 09:30:00'
  },
  {
    id: 'usr-admin-1',
    name: 'Alejandro Gómez (Admin)',
    username: 'admin',
    email: 'admin@cambiocuba.cu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    phone: '+53 5123 4567',
    password: 'admin',
    createdAt: '2026-10-31 09:00:00',
    lastLogin: '2026-10-31 09:15:00'
  },
  {
    id: 'usr-cajero-1',
    name: 'Carlos Mendoza (Cajero)',
    username: 'cajero',
    email: 'cajero@cambiocuba.cu',
    role: 'cajero',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    phone: '+53 5987 6543',
    password: 'cajero',
    createdAt: '2026-10-31 09:00:00',
    lastLogin: '2026-10-31 08:45:00'
  },
  {
    id: 'usr-auditor-1',
    name: 'Lic. Beatriz Ramos (Auditora)',
    username: 'auditor',
    email: 'auditor@cambiocuba.cu',
    role: 'auditor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    phone: '+53 5444 3322',
    password: 'auditor',
    createdAt: '2026-10-31 09:00:00',
    lastLogin: '2026-10-31 08:30:00'
  }
];

export const INITIAL_RATES: ExchangeRate[] = [
  {
    currency: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    buyRate: 325,
    sellRate: 335,
    lastUpdated: '2026-10-31 08:00:00',
    updatedBy: 'Enmanuel Caraballo (admin)',
    minRate: 300,
    maxRate: 360,
    marketReference: 330
  },
  {
    currency: 'EUR',
    name: 'Euro Comunitario',
    symbol: '€',
    buyRate: 350,
    sellRate: 362,
    lastUpdated: '2026-10-31 08:00:00',
    updatedBy: 'Enmanuel Caraballo (admin)',
    minRate: 320,
    maxRate: 380,
    marketReference: 355
  },
  {
    currency: 'MLC',
    name: 'Moneda Libremente Convertible',
    symbol: 'MLC',
    buyRate: 275,
    sellRate: 283,
    lastUpdated: '2026-10-31 08:00:00',
    updatedBy: 'Enmanuel Caraballo (admin)',
    minRate: 250,
    maxRate: 300,
    marketReference: 280
  }
];

// Cajas limpias listas para operar (inician en 0 para recibir el arqueo/capital inicial real)
export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-usd-cash',
    name: 'Caja Fuerte Efectivo USD',
    currency: 'USD',
    balance: 0,
    accountType: 'efectivo',
    description: 'Billetes físicos en caja de seguridad'
  },
  {
    id: 'acc-cup-cash',
    name: 'Caja Mostrador Efectivo CUP',
    currency: 'CUP',
    balance: 0,
    accountType: 'efectivo',
    description: 'Efectivo en mostrador para pagos y cobranzas en CUP'
  },
  {
    id: 'acc-mlc-card',
    name: 'Tarjeta Bandec MLC',
    currency: 'MLC',
    balance: 0,
    accountType: 'banco_tarjeta',
    accountNumber: '9225-xxxx-xxxx-4512',
    description: 'Cuenta matriz en Banco de Crédito y Comercio'
  },
  {
    id: 'acc-bpa-cup',
    name: 'Transfermóvil Banco Metropolitano (CUP)',
    currency: 'CUP',
    balance: 0,
    accountType: 'banco_tarjeta',
    accountNumber: '9202-xxxx-xxxx-8831',
    description: 'Cuenta electrónica para transferencias de clientes'
  },
  {
    id: 'acc-enzona-cup',
    name: 'Billetera EnZona (CUP)',
    currency: 'CUP',
    balance: 0,
    accountType: 'banco_tarjeta',
    accountNumber: 'ID-ENZONA-9941',
    description: 'Pasarela digital de pagos QR'
  },
  {
    id: 'acc-eur-cash',
    name: 'Caja Reserva EUR',
    currency: 'EUR',
    balance: 0,
    accountType: 'efectivo',
    description: 'Efectivo en billetes de euros'
  }
];

class StorageService {
  constructor() {
    // Si quedan rastros de datos de prueba antiguos de cualquier versión anterior, purgarlos completamente
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cambiocuba_') && !k.startsWith(STORAGE_KEY_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {
      // Ignorar si hay restricciones de acceso
    }
  }

  private getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }

  // Active User / Session (Autenticación Real)
  getActiveUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + 'active_user');
      if (!raw || raw === 'null' || raw === 'undefined') {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.id) return null;
      const users = this.getUsers();
      const current = users.find(u => u.id === parsed.id);
      return current && current.isActive ? current : null;
    } catch {
      return null;
    }
  }

  setActiveUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'active_user');
    } else {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'active_user', JSON.stringify(user));
    }
  }

  login(username: string, password: string, customIp?: string): { success: boolean; user?: User; error?: string } {
    try {
      const users = this.getUsers();
      const cleanUser = username.trim().replace(/^@+/, '').toLowerCase();
      const cleanPass = password.trim();

      const user = users.find(u => u.username.toLowerCase() === cleanUser);

      if (!user) {
        this.recordLogin(username, false, customIp);
        return { success: false, error: `El usuario "${cleanUser}" no existe en la base de datos.` };
      }

      if (!user.isActive) {
        this.recordLogin(username, false, customIp);
        return { success: false, error: 'Esta cuenta ha sido desactivada por el administrador.' };
      }

      const validPassword = (user.password || user.username).trim();
      if (cleanPass !== validPassword) {
        this.recordLogin(username, false, customIp);
        return { success: false, error: 'Contraseña incorrecta. Intento registrado en auditoría.' };
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      user.lastLogin = now;
      this.setItem('users', users);
      this.setActiveUser(user);
      this.recordLogin(username, true, customIp);
      return { success: true, user };
    } catch (err: any) {
      console.error('Error during login:', err);
      return { success: false, error: `Error en autenticación: ${err?.message || 'Error interno'}` };
    }
  }

  logout(operator?: User): void {
    if (operator) {
      this.addAuditLog('LOGOUT', 'Auth', operator.username, operator, `Cierre de sesión del usuario ${operator.name} (@${operator.username}).`);
    }
    this.setActiveUser(null);
  }

  changePassword(userId: string, currentPass: string, newPass: string, operator: User): { success: boolean; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Usuario no encontrado.' };

    const expected = user.password || user.username;
    if (currentPass !== expected) {
      return { success: false, error: 'La contraseña actual ingresada es incorrecta.' };
    }

    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }

    user.password = newPass.trim();
    this.setItem('users', users);
    const active = this.getActiveUser();
    if (active && active.id === userId) {
      this.setActiveUser(user);
    }
    this.addAuditLog('CAMBIO_PASSWORD', 'User', user.username, operator, `Contraseña actualizada exitosamente para @${user.username}.`);
    return { success: true };
  }

  // ==========================================
  // ROLES MANAGEMENT (Dinámico)
  // ==========================================
  getRoles(): Role[] {
    return this.getItem<Role[]>('roles', INITIAL_ROLES);
  }

  addRole(roleData: Omit<Role, 'id'>, operator: User): Role {
    const roles = this.getRoles();
    const newRole: Role = {
      ...roleData,
      id: 'role-' + Date.now(),
      isSystem: false
    };
    this.setItem('roles', [...roles, newRole]);
    this.addAuditLog('CREAR_ROL', 'Role', newRole.code, operator, `Nuevo rol creado: "${newRole.name}" con ${newRole.permissions.length} permisos.`);
    return newRole;
  }

  updateRole(roleId: string, roleData: Partial<Role>, operator: User): Role | null {
    const roles = this.getRoles();
    const index = roles.findIndex(r => r.id === roleId);
    if (index === -1) return null;

    roles[index] = { ...roles[index], ...roleData };
    this.setItem('roles', roles);
    this.addAuditLog('ACTUALIZAR_ROL', 'Role', roles[index].code, operator, `Rol "${roles[index].name}" modificado.`);
    return roles[index];
  }

  deleteRole(roleId: string, operator: User): boolean {
    const roles = this.getRoles();
    const role = roles.find(r => r.id === roleId);
    if (!role || role.isSystem) return false;

    // Verificar si hay usuarios con este rol
    const users = this.getUsers();
    const usersWithRole = users.filter(u => u.role === role.code);
    if (usersWithRole.length > 0) {
      return false; // No se puede borrar si tiene usuarios asignados
    }

    const filtered = roles.filter(r => r.id !== roleId);
    this.setItem('roles', filtered);
    this.addAuditLog('ELIMINAR_ROL', 'Role', role.code, operator, `Rol "${role.name}" eliminado.`);
    return true;
  }

  // ==========================================
  // USERS MANAGEMENT
  // ==========================================
  getUsers(): User[] {
    const list = this.getItem<User[]>('users', INITIAL_USERS);
    if (!Array.isArray(list) || list.length === 0) {
      this.setItem('users', INITIAL_USERS);
      return INITIAL_USERS;
    }
    return list;
  }

  addUser(userData: Omit<User, 'id' | 'createdAt'>, operator: User): User {
    const users = this.getUsers();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
      createdAt: now,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    this.setItem('users', [...users, newUser]);
    this.addAuditLog('CREAR_USUARIO', 'User', newUser.username, operator, `Usuario creado: "${newUser.name}" (@${newUser.username}) con rol "${newUser.role}".`);
    return newUser;
  }

  updateUser(userId: string, userData: Partial<User>, operator: User): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    users[index] = { ...users[index], ...userData };
    this.setItem('users', users);

    // Si el usuario actualizado es el activo, refrescarlo
    const active = this.getActiveUser();
    if (active && active.id === userId) {
      this.setActiveUser(users[index]);
    }

    this.addAuditLog('ACTUALIZAR_USUARIO', 'User', users[index].username, operator, `Usuario "@${users[index].username}" actualizado.`);
    return users[index];
  }

  deleteUser(userId: string, operator: User): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    // No permitir borrar el usuario activo o el admin principal
    if (user.id === operator.id || user.username === 'admin') {
      return false;
    }

    const filtered = users.filter(u => u.id !== userId);
    this.setItem('users', filtered);
    this.addAuditLog('ELIMINAR_USUARIO', 'User', user.username, operator, `Usuario "@${user.username}" eliminado del sistema.`);
    return true;
  }

  // ==========================================
  // LOGIN LOGS
  // ==========================================
  getLoginLogs(): LoginLog[] {
    return this.getItem<LoginLog[]>('login_logs', []);
  }

  recordLogin(username: string, success: boolean, customIp?: string): LoginLog {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    const log: LoginLog = {
      id: 'log-' + Date.now(),
      userId: user ? user.id : 'usr-desconocido',
      userName: user ? user.name : username,
      role: user ? user.role : 'invitado',
      ipAddress: customIp || (window.location.hostname === 'localhost' ? '127.0.0.1 (Local)' : '100.64.0.18 (VPN Wireguard)'),
      userAgent: navigator.userAgent.substring(0, 60),
      status: success ? 'exito' : 'fallido',
      timestamp,
      location: success ? 'Sesión Autorizada' : 'Contraseña incorrecta o usuario inactivo'
    };

    const currentLogs = this.getLoginLogs();
    const updated = [log, ...currentLogs];
    this.setItem('login_logs', updated);

    if (user && success) {
      user.lastLogin = timestamp;
      this.setActiveUser(user);
      this.updateUser(user.id, { lastLogin: timestamp }, user);
    }

    return log;
  }

  // ==========================================
  // EXCHANGE RATES
  // ==========================================
  getRates(): ExchangeRate[] {
    return this.getItem<ExchangeRate[]>('rates', INITIAL_RATES);
  }

  updateRates(currency: CurrencyCode, buyRate: number, sellRate: number, note: string, operator: User): void {
    const rates = this.getRates();
    const index = rates.findIndex(r => r.currency === currency);
    if (index === -1) return;

    const old = rates[index];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const historyItem: RateHistoryItem = {
      id: 'rh-' + Date.now(),
      currency,
      oldBuy: old.buyRate,
      newBuy: buyRate,
      oldSell: old.sellRate,
      newSell: sellRate,
      updatedBy: operator.name,
      timestamp: nowStr,
      note: note || 'Ajuste manual de cotización'
    };

    const history = this.getRateHistory();
    this.setItem('rate_history', [historyItem, ...history]);

    rates[index] = {
      ...old,
      buyRate,
      sellRate,
      lastUpdated: nowStr,
      updatedBy: `${operator.name} (${operator.username})`
    };
    this.setItem('rates', rates);

    this.addAuditLog(
      'ACTUALIZAR_TASA',
      'ExchangeRate',
      currency,
      operator,
      `Tasa ${currency} cambiada: Compra ${old.buyRate} -> ${buyRate} | Venta ${old.sellRate} -> ${sellRate}. Motivo: ${note || 'Sin nota'}`
    );
  }

  syncElToqueRates(
    updates: { currency: CurrencyCode; buyRate: number; sellRate: number; marketReference?: number }[],
    note: string,
    operator: User
  ): void {
    const rates = this.getRates();
    const history = this.getRateHistory();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newHistoryItems: RateHistoryItem[] = [];

    updates.forEach(u => {
      const index = rates.findIndex(r => r.currency === u.currency);
      if (index !== -1) {
        const old = rates[index];
        newHistoryItems.push({
          id: 'rh-' + Date.now() + '-' + u.currency,
          currency: u.currency,
          oldBuy: old.buyRate,
          newBuy: u.buyRate,
          oldSell: old.sellRate,
          newSell: u.sellRate,
          updatedBy: operator.name,
          timestamp: nowStr,
          note: note || 'Sincronización automática con elTOQUE (TRMI)'
        });

        rates[index] = {
          ...old,
          buyRate: u.buyRate,
          sellRate: u.sellRate,
          marketReference: u.marketReference ?? old.marketReference,
          lastUpdated: nowStr,
          updatedBy: `${operator.name} (@${operator.username})`
        };
      }
    });

    this.setItem('rate_history', [...newHistoryItems, ...history]);
    this.setItem('rates', rates);

    this.addAuditLog(
      'ACTUALIZAR_TASA',
      'ExchangeRate',
      'MULTI',
      operator,
      `Sincronización de tasas con elTOQUE (TRMI): ${updates.map(u => `${u.currency} C:${u.buyRate}/V:${u.sellRate}`).join(', ')}`
    );
  }

  getRateHistory(): RateHistoryItem[] {
    return this.getItem<RateHistoryItem[]>('rate_history', []);
  }

  // ==========================================
  // ACCOUNTS & CAJAS
  // ==========================================
  getAccounts(): Account[] {
    return this.getItem<Account[]>('accounts', INITIAL_ACCOUNTS);
  }

  updateAccountBalance(accountId: string, newBalance: number, operator: User, reason: string): void {
    const accounts = this.getAccounts();
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;

    const oldBal = acc.balance;
    acc.balance = newBalance;
    this.setItem('accounts', accounts);

    this.addAuditLog(
      'ARQUEO_CUADRE_CAJA',
      'Account',
      accountId,
      operator,
      `Ajuste/Arqueo en "${acc.name}": ${oldBal} -> ${newBalance} ${acc.currency}. Razón: ${reason}`
    );
  }

  addAccount(data: Omit<Account, 'id'>, operator: User): Account {
    const accounts = this.getAccounts();
    const newAcc: Account = {
      ...data,
      id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    };
    const updated = [...accounts, newAcc];
    this.setItem('accounts', updated);

    this.addAuditLog(
      'NUEVA_CAJA_CUENTA',
      'Account',
      newAcc.id,
      operator,
      `Creación de nueva cuenta/caja "${newAcc.name}" (${newAcc.currency}, ${newAcc.accountType === 'efectivo' ? 'Efectivo' : 'Banca/Tarjeta'}) con saldo inicial de ${newAcc.balance} ${newAcc.currency}.`
    );

    return newAcc;
  }

  deleteAccount(accountId: string, operator: User): { success: boolean; message?: string } {
    const accounts = this.getAccounts();
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) {
      return { success: false, message: 'La cuenta o caja no existe.' };
    }

    if (acc.balance !== 0) {
      return {
        success: false,
        message: `No se puede eliminar la cuenta "${acc.name}" porque tiene un saldo activo de $${acc.balance.toLocaleString()} ${acc.currency}. Realiza un arqueo o transferencia para dejarla en 0 antes de eliminarla.`
      };
    }

    const updated = accounts.filter(a => a.id !== accountId);
    this.setItem('accounts', updated);

    this.addAuditLog(
      'ELIMINAR_CAJA_CUENTA',
      'Account',
      accountId,
      operator,
      `Eliminación de cuenta/caja "${acc.name}" (${acc.currency}, ${acc.accountType}).`
    );

    return { success: true };
  }

  // ==========================================
  // TRANSACTIONS (Sin datos de ejemplo, 100% limpia)
  // ==========================================
  getTransactions(): Transaction[] {
    return this.getItem<Transaction[]>('transactions', []);
  }

  addTransaction(data: Omit<Transaction, 'id' | 'code' | 'date' | 'spreadProfitCUP'>, operator: User): Transaction {
    const transactions = this.getTransactions();
    const rates = this.getRates();
    const currentRate = rates.find(r => r.currency === data.currency);

    const spreadUnit = currentRate ? Math.max(0, currentRate.sellRate - currentRate.buyRate) : 10;
    const spreadProfitCUP = Math.round(data.amountForeign * spreadUnit);

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const code = `TRX-${now.getFullYear()}-${String(transactions.length + 1).padStart(4, '0')}`;

    const newTrx: Transaction = {
      ...data,
      id: 'trx-' + Date.now(),
      code,
      date: dateStr,
      spreadProfitCUP,
      operatorId: operator.id,
      operatorName: operator.name
    };

    if (newTrx.status === 'completada') {
      const accounts = this.getAccounts();

      if (newTrx.type === 'compra') {
        const foreignAcc = accounts.find(a => a.id === newTrx.sourceAccountId);
        const cupAcc = accounts.find(a => a.id === newTrx.targetAccountId);
        if (foreignAcc) foreignAcc.balance += newTrx.amountForeign;
        if (cupAcc) cupAcc.balance -= newTrx.amountCUP;
      } else {
        const foreignAcc = accounts.find(a => a.id === newTrx.targetAccountId);
        const cupAcc = accounts.find(a => a.id === newTrx.sourceAccountId);
        if (foreignAcc) foreignAcc.balance -= newTrx.amountForeign;
        if (cupAcc) cupAcc.balance += newTrx.amountCUP;
      }
      this.setItem('accounts', accounts);
    }

    const updated = [newTrx, ...transactions];
    this.setItem('transactions', updated);

    this.addAuditLog(
      'NUEVA_TRANSACCION',
      'Transaction',
      code,
      operator,
      `${newTrx.type.toUpperCase()} de ${newTrx.amountForeign} ${newTrx.currency} a tasa ${newTrx.rateApplied} CUP (${newTrx.amountCUP.toLocaleString()} CUP). Cliente: ${newTrx.clientName}`
    );

    return newTrx;
  }

  cancelTransaction(transactionId: string, reason: string, operator: User): boolean {
    const transactions = this.getTransactions();
    const trx = transactions.find(t => t.id === transactionId);
    if (!trx || trx.status === 'anulada') return false;

    if (trx.status === 'completada') {
      const accounts = this.getAccounts();
      if (trx.type === 'compra') {
        const foreignAcc = accounts.find(a => a.id === trx.sourceAccountId);
        const cupAcc = accounts.find(a => a.id === trx.targetAccountId);
        if (foreignAcc) foreignAcc.balance -= trx.amountForeign;
        if (cupAcc) cupAcc.balance += trx.amountCUP;
      } else {
        const foreignAcc = accounts.find(a => a.id === trx.targetAccountId);
        const cupAcc = accounts.find(a => a.id === trx.sourceAccountId);
        if (foreignAcc) foreignAcc.balance += trx.amountForeign;
        if (cupAcc) cupAcc.balance -= trx.amountCUP;
      }
      this.setItem('accounts', accounts);
    }

    trx.status = 'anulada';
    trx.cancelledAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    trx.cancelledBy = operator.name;
    trx.cancelReason = reason;

    this.setItem('transactions', transactions);

    this.addAuditLog(
      'ANULAR_TRANSACCION',
      'Transaction',
      trx.code,
      operator,
      `Operación ${trx.code} anulada. Motivo: ${reason}. Se reversaron los saldos de caja.`
    );

    return true;
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>('audit_logs', []);
  }

  addAuditLog(action: string, entity: string, entityId: string, operator: User, details: string): void {
    const log: AuditLog = {
      id: 'aud-' + Date.now(),
      action,
      entity,
      entityId,
      userId: operator.id,
      userName: operator.name,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    const current = this.getAuditLogs();
    this.setItem('audit_logs', [log, ...current]);
  }

  // ==========================================
  // BACKUPS
  // ==========================================
  getBackups(): BackupSnapshot[] {
    return this.getItem<BackupSnapshot[]>('backups', []);
  }

  createBackup(type: 'Automático Diario' | 'Manual' = 'Manual', operator?: User): BackupSnapshot {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T]/g, '_').substring(0, 15);
    const filename = `cambiocuba_backup_${dateStr}.sql.gz`;

    const totalRecords =
      this.getTransactions().length +
      this.getRates().length +
      this.getAccounts().length +
      this.getUsers().length;

    const snapshot: BackupSnapshot = {
      id: 'bk-' + Date.now(),
      filename,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
      sizeKb: Math.round(500 + Math.random() * 200),
      recordsCount: totalRecords,
      type,
      status: 'Completado',
      checksum: 'sha256:' + Math.random().toString(36).substring(2, 10) + '...'
    };

    const current = this.getBackups();
    this.setItem('backups', [snapshot, ...current]);

    if (operator) {
      this.addAuditLog(
        'CREAR_BACKUP',
        'SystemBackup',
        snapshot.id,
        operator,
        `Copia de seguridad generada (${type}): ${filename}`
      );
    }

    return snapshot;
  }

  exportFullDatabaseJSON(): string {
    const dump = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'DataCambio Pro',
      data: {
        users: this.getUsers(),
        roles: this.getRoles(),
        rates: this.getRates(),
        rateHistory: this.getRateHistory(),
        accounts: this.getAccounts(),
        transactions: this.getTransactions(),
        loginLogs: this.getLoginLogs(),
        auditLogs: this.getAuditLogs(),
        backups: this.getBackups()
      }
    };
    return JSON.stringify(dump, null, 2);
  }

  restoreFromJSON(jsonString: string, operator: User): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;

      if (parsed.data.users) this.setItem('users', parsed.data.users);
      if (parsed.data.roles) this.setItem('roles', parsed.data.roles);
      if (parsed.data.rates) this.setItem('rates', parsed.data.rates);
      if (parsed.data.accounts) this.setItem('accounts', parsed.data.accounts);
      if (parsed.data.transactions) this.setItem('transactions', parsed.data.transactions);
      if (parsed.data.loginLogs) this.setItem('login_logs', parsed.data.loginLogs);
      if (parsed.data.rateHistory) this.setItem('rate_history', parsed.data.rateHistory);

      this.addAuditLog(
        'RESTAURAR_BACKUP',
        'SystemBackup',
        'manual-import',
        operator,
        `Base de datos restaurada exitosamente desde archivo JSON importado`
      );
      return true;
    } catch {
      return false;
    }
  }

  // Borrado y reinicio limpio completo
  resetAllData(operator: User): void {
    this.setItem('users', INITIAL_USERS);
    this.setItem('roles', INITIAL_ROLES);
    this.setItem('rates', INITIAL_RATES);
    this.setItem('accounts', INITIAL_ACCOUNTS);
    this.setItem('transactions', []);
    this.setItem('login_logs', []);
    this.setItem('rate_history', []);
    this.setItem('backups', []);
    this.setItem('audit_logs', []);

    this.addAuditLog('LIMPIEZA_TOTAL', 'System', 'ALL', operator, 'Base de datos limpia iniciada sin datos de prueba.');
  }
}

export const storageService = new StorageService();

/**
 * Validador de permisos por rol
 */
export function hasPermission(user: User, permission: PermissionKey, rolesList?: Role[]): boolean {
  if (!user) return false;
  // El desarrollador tiene control y acceso absoluto
  if (user.role === 'desarrollador') return true;

  const roles = rolesList || storageService.getRoles();
  const userRole = roles.find(r => r.code === user.role);
  if (!userRole) return false;

  return userRole.permissions.includes(permission);
}

/**
 * Filtro de acceso a pestañas según requerimiento del cliente:
 * - Desarrollador: puede verlo todo.
 * - Administrador: todo menos el módulo donde se muestra el despliegue.
 * - Cajero: no puede ver la creación de usuarios y roles además de la parte del despliegue.
 * - Auditor: solo puede ver dashboard, registro de operaciones y reportes, pero no puede hacer operaciones.
 */
export function canAccessTab(tabId: string, user: User, rolesList?: Role[]): boolean {
  if (!user) return false;

  // 1. Desarrollador: ve todo
  if (user.role === 'desarrollador') return true;

  // 2. Administrador: todo MENOS despliegue
  if (user.role === 'admin') {
    if (tabId === 'laravel-deploy') return false;
    return true;
  }

  // 3. Cajero: NO usuarios & roles, NO despliegue, NO backups, NO auditoría
  if (user.role === 'cajero') {
    if (tabId === 'users' || tabId === 'laravel-deploy' || tabId === 'backups' || tabId === 'audit' || tabId === 'reports') {
      return false;
    }
    return ['dashboard', 'transactions', 'rates', 'accounts'].includes(tabId);
  }

  // 4. Auditor: SOLO dashboard, registro de operaciones y reportes (y auditoría de accesos)
  if (user.role === 'auditor') {
    return ['dashboard', 'transactions', 'reports', 'audit'].includes(tabId);
  }

  // Fallback para otros roles personalizados según matriz de permisos
  switch (tabId) {
    case 'dashboard':
      return true;
    case 'transactions':
      return true;
    case 'rates':
      return hasPermission(user, 'rates_edit', rolesList);
    case 'reports':
      return hasPermission(user, 'reports_view', rolesList);
    case 'accounts':
      return hasPermission(user, 'accounts_view', rolesList) || hasPermission(user, 'accounts_arqueo', rolesList);
    case 'users':
      return hasPermission(user, 'users_manage', rolesList);
    case 'audit':
      return hasPermission(user, 'audit_view', rolesList);
    case 'backups':
      return hasPermission(user, 'backups_manage', rolesList);
    case 'laravel-deploy':
      return hasPermission(user, 'deploy_view', rolesList);
    default:
      return false;
  }
}
