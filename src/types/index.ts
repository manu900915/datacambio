export type PermissionKey = 
  | 'transactions_create'
  | 'transactions_cancel'
  | 'rates_edit'
  | 'accounts_arqueo'
  | 'accounts_view'
  | 'reports_view'
  | 'users_manage'
  | 'backups_manage'
  | 'audit_view'
  | 'deploy_view';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  code: string; // e.g. 'admin', 'cajero', 'auditor', 'supervisor'
  description: string;
  color: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
}

export type UserRole = string;

export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  avatar: string;
  email: string;
  password?: string;
  isActive: boolean;
  phone?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  ipAddress: string;
  userAgent: string;
  status: 'exito' | 'fallido';
  timestamp: string;
  location?: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'MLC';

export interface ExchangeRate {
  currency: CurrencyCode;
  name: string;
  symbol: string;
  buyRate: number; // Tasa a la que compramos al cliente (en CUP)
  sellRate: number; // Tasa a la que vendemos al cliente (en CUP)
  lastUpdated: string;
  updatedBy: string;
  minRate?: number;
  maxRate?: number;
  marketReference?: number; // Referencia informal (ej. elTOQUE)
}

export interface RateHistoryItem {
  id: string;
  currency: CurrencyCode;
  oldBuy: number;
  newBuy: number;
  oldSell: number;
  newSell: number;
  updatedBy: string;
  timestamp: string;
  note: string;
}

export type AccountType = 'efectivo' | 'banco_tarjeta';

export interface Account {
  id: string;
  name: string;
  currency: 'CUP' | CurrencyCode;
  balance: number;
  accountType: AccountType;
  accountNumber?: string;
  description: string;
}

export type TransactionType = 'compra' | 'venta';
export type TransactionStatus = 'completada' | 'pendiente' | 'anulada';
export type PaymentMethod = 'Efectivo' | 'Transfermóvil' | 'EnZona' | 'Transferencia Bancaria';

export interface Transaction {
  id: string;
  code: string; // e.g. TRX-2026-0124
  date: string;
  type: TransactionType;
  currency: CurrencyCode;
  amountForeign: number; // Monto en USD/EUR/MLC
  amountCUP: number; // Monto en CUP
  rateApplied: number; // Tasa de cambio aplicada
  spreadProfitCUP: number; // Ganancia estimada por diferencial cambiario
  paymentMethod: PaymentMethod;
  sourceAccountId: string;
  targetAccountId: string;
  clientName: string;
  clientDocId: string; // Carnet de identidad
  clientPhone: string;
  status: TransactionStatus;
  notes?: string;
  operatorId: string;
  operatorName: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

export interface BackupConfig {
  cronEnabled: boolean;
  cronTime: string; // e.g. "23:59"
  cronFrequency: 'diario' | 'cada_12h' | 'semanal';
  storagePath: string; // e.g. "/opt/datacambio/backups/"
  storageLabel: string; // e.g. "Disco Local de la PC del Cliente"
  retentionDays: number; // e.g. 30
  compressionType: 'gzip .sql.gz' | 'zip' | 'json';
  lastModified?: string;
  modifiedBy?: string;
}

export interface BackupSnapshot {
  id: string;
  filename: string;
  timestamp: string;
  sizeKb: number;
  recordsCount: number;
  type: 'Automático Diario' | 'Manual';
  status: 'Completado' | 'En proceso';
  checksum: string;
}

export interface CashClosingRecord {
  id: string;
  date: string;
  operatorName: string;
  totalTransactions: number;
  totalBuyUSD: number;
  totalSellUSD: number;
  totalCUPMoved: number;
  netProfitCUP: number;
  status: 'Cuadrado' | 'Con Diferencia';
  notes?: string;
}
