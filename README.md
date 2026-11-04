# 🇨🇺 CambioCuba Pro - Sistema de Gestión de Compra y Venta de Divisas

Sistema web profesional para la gestión de operaciones de cambio de divisas (**USD, CUP, MLC, EUR**), arqueo de cajas físicas y electrónicas (Transfermóvil, EnZona, Bandec), auditoría de accesos y reportes financieros, optimizado para el contexto de Cuba.

---

## 🚀 Características Principales

1. **Autenticación Segura & Registro de Quién se Autentica**:
   - Roles de usuario: **Administrador**, **Cajero Operador**, **Auditor Financiero**.
   - Tabla de auditoría inmutable (`login_logs`) que guarda: IP (LAN o VPN), Usuario, Rol, Fecha/Hora, Dispositivo/Navegador y Estado (Éxito / Fallido).

2. **Dashboard en Tiempo Real**:
   - Pizarra de cotizaciones en vivo con referencias del mercado cubano (**elTOQUE**, CADECA, mercado informal).
   - Indicadores KPI: Compras hoy, Ventas hoy, Ganancia neta por diferencial (Spread) y Activos consolidados en caja.
   - Calculadora rápida de mostrador y disponibilidad en cajas.

3. **Registro y Control de Operaciones**:
   - Tabla de transferencias con: Fecha/hora, código único (`TRX-2026-XXXX`), Monto Divisa, Monto en CUP, Tasa de cambio aplicada, Vía de pago (Efectivo, Transfermóvil, EnZona) y Estado.
   - Generación de **Comprobante de Canje Térmico (80mm)** con código QR, desglose y firmas para entrega al cliente.
   - Anulación con reversión estricta y automática de saldos en caja.
   - Exportación a CSV compatible con Microsoft Excel.

4. **Gestión de Tasas de Cambio & Spread**:
   - Modificación instantánea de tasas de compra y venta para USD, EUR y MLC.
   - Historial de cambios de tasas con usuario responsable y motivo justificado.

5. **Reportes Financieros**:
   - Balances **Diarios (Cierre de hoy)**, **Semanales (7 días)** y **Mensuales**.
   - Desglose por método de pago y por cajero operador.
   - **Acta Oficial de Cierre y Liquidación de Caja** imprimible.

6. **Arqueo y Cajas**:
   - Comparación de efectivo físico contado vs saldo en sistema.
   - Detección inmediata de faltantes o sobrantes.

7. **Copias de Seguridad Automatizadas Diarias**:
   - Script bash `scripts/daily_backup.sh` programado a las 23:59:00 vía cron.
   - Volcado MySQL comprimido con gzip (`.sql.gz`) y retención de 30 días.
   - Descarga de respaldo en formato JSON y restauración asistida.

---

## 🛠️ Despliegue en la PC del Cliente (Docker + VPN)

### 1. Despliegue con Docker Compose
En la PC del cliente (ejecutando Linux o Windows con Docker Desktop):

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/cambiocuba-pro.git /opt/cambiocuba
cd /opt/cambiocuba

# 2. Levantar la pila de contenedores (Nginx + Laravel 11 + MySQL 8.0)
cd docker
docker compose up -d --build
```

El sistema estará accesible inmediatamente en el puerto `80` (o `8080`).

---

### 2. Acceso Remoto Seguro por VPN (Sin abrir puertos en el módem de Cuba)
Dado que en Cuba los proveedores (ETECSA / Nauta Hogar) usan NAT dinámico o bloquean puertos, la mejor solución es **Tailscale** o **WireGuard**:

1. En la PC del cliente instala Tailscale:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```
2. La PC recibirá una IP privada fija (ej: `100.85.12.34`).
3. Desde tu laptop o teléfono, conéctate a tu misma cuenta de Tailscale y abre en el navegador:
   ```
   http://100.85.12.34
   ```

---

### 3. Pipeline de CI/CD con GitHub Actions
El archivo `.github/workflows/deploy.yml` ya está listo. Con cada `git push origin main`:
1. GitHub compila y prueba el código.
2. Se conecta a la VPN de la PC del cliente mediante el secret `TAILSCALE_AUTH_KEY`.
3. Ejecuta `git pull`, reconstruye los contenedores Docker y corre las migraciones de Laravel sin interrumpir la operación.

**Secretos requeridos en GitHub (Settings > Secrets and variables > Actions):**
- `CLIENT_PC_HOST`: IP privada de la PC (ej. `100.85.12.34`).
- `CLIENT_PC_USER`: Usuario del sistema en la PC.
- `CLIENT_PC_SSH_KEY`: Clave SSH privada.
- `TAILSCALE_AUTH_KEY`: Clave de autenticación de Tailscale.

---

### 4. Automatización del Respaldo Diario
En la PC del cliente, añade la siguiente línea a `crontab -e`:

```cron
59 23 * * * /opt/cambiocuba/scripts/daily_backup.sh >> /var/log/cambiocuba_backups.log 2>&1
```

Esto generará automáticamente una copia cada noche a las 23:59:00 en `/opt/cambiocuba/backups/` y eliminará los respaldos mayores a 30 días.
