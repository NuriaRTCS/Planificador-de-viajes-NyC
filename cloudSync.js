// ============================================================
// CLOUD SYNC ENGINE — MODELO PLANIFICADOR DOCENTE 2026/2027
// Firebase Realtime Database REST API + Anti-Sobreescritura
// ============================================================

// Base de datos en la nube (la misma configurada para el usuario)
const DEFAULT_FIREBASE_DB = 'https://planificador-de-viajes-nyc-default-rtdb.europe-west1.firebasedatabase.app';
const DEFAULT_PIN = 'boda-2012';
const PIN_STORAGE_KEY = 'planificador_viajes_pin';
const DB_URL_STORAGE_KEY = 'planificador_viajes_db_url';
const SAFETY_BACKUP_KEY = 'planificador_safety_backup_before_sync';
const SAFETY_BACKUP_TIME_KEY = 'planificador_safety_backup_time';

let isReceivingFromServer = false;
let hasInitialSyncCompleted = false; // Bloquea sobreescrituras accidentales durante el arranque
let autoSyncDebounceTimer = null;
let syncPollerInterval = null;
let lastKnownRemoteTime = 0;

// Obtener la URL activa de Firebase
function getActiveFirebaseDb() {
  try {
    const saved = localStorage.getItem(DB_URL_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch (e) {}
  return DEFAULT_FIREBASE_DB;
}

// Obtener el PIN activo (clave de sala)
function getActivePin() {
  try {
    const saved = localStorage.getItem(PIN_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
    // Compatibilidad con claves previas
    const oldConfig = localStorage.getItem('PLANIFICADOR_VIAJES_CLOUD_V1');
    if (oldConfig) {
      const parsed = JSON.parse(oldConfig);
      if (parsed && parsed.syncKey) return parsed.syncKey;
    }
  } catch (e) {}
  return DEFAULT_PIN;
}

function cleanPinKey(pin) {
  if (!pin) return DEFAULT_PIN;
  return pin.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
}

// Contar el número total de viajes en una base de datos
function countTripsInDb(database) {
  if (!database || !database.years || typeof database.years !== 'object') return 0;
  let count = 0;
  Object.values(database.years).forEach(y => {
    if (y && Array.isArray(y.trips)) {
      count += y.trips.length;
    }
  });
  return count;
}

// Obtener la base de datos local actual
function getCurrentAppDb() {
  if (typeof window.getAppDb === 'function') {
    const d = window.getAppDb();
    if (d) return d;
  }
  if (window.db) return window.db;
  if (typeof loadDatabase === 'function') {
    try {
      const d = loadDatabase();
      if (d) return d;
    } catch (e) {}
  }
  return null;
}

// ------------------------------------------------------------
// SISTEMA DE COPIA DE SEGURIDAD PREVIA (SAFETY ROLLBACK)
// Permite recuperar datos locales en 1 clic si se sobreescriben
// ------------------------------------------------------------
function saveSafetyBackup(data, reason = 'auto_backup') {
  try {
    if (!data) return;
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(SAFETY_BACKUP_KEY, str);
    localStorage.setItem(SAFETY_BACKUP_TIME_KEY, new Date().toISOString());
    updateSafetyBackupBanners();
  } catch (e) {
    console.warn('[CloudSync] No se pudo guardar la copia de seguridad previa:', e);
  }
}

function restoreSafetyBackup() {
  try {
    const backupStr = localStorage.getItem(SAFETY_BACKUP_KEY);
    if (!backupStr) {
      alert('No se encontró ninguna copia previa en la memoria de este navegador.');
      return;
    }
    const parsed = JSON.parse(backupStr);
    if (!parsed || !parsed.years) {
      alert('El archivo de respaldo previo está dañado o incompleto.');
      return;
    }

    if (!confirm('¿Deseas restaurar la copia de seguridad previa y recuperar tus datos anteriores?')) {
      return;
    }

    // Salvar la actual como temporal
    const currentLoc = localStorage.getItem('PLANIFICADOR_VIAJES_DB_V1');
    if (currentLoc) {
      localStorage.setItem('planificador_safety_backup_restored_temp', currentLoc);
    }

    // Restaurar en memoria y en localStorage
    window.db = parsed;
    if (typeof window.setAppDb === 'function') window.setAppDb(parsed);
    if (typeof saveDatabase === 'function') saveDatabase(parsed, true);
    if (typeof initApp === 'function') initApp();

    // Sincronizar inmediatamente a la nube bajo el PIN activo
    const pin = getActivePin();
    if (pin) {
      autoPushToCloud(pin, parsed, true);
    }

    showToast('🎉 ¡Copia de seguridad previa restaurada y sincronizada con éxito!', 'success');
    closeModal('modalCloudSync');
    closeModal('modalBackup');
  } catch (e) {
    console.error('[CloudSync] Error al restaurar safety backup:', e);
    alert('Ocurrió un error al intentar restaurar la copia previa: ' + e.message);
  }
}

function updateSafetyBackupBanners() {
  const hasBackup = !!localStorage.getItem(SAFETY_BACKUP_KEY);
  const backupTime = localStorage.getItem(SAFETY_BACKUP_TIME_KEY);
  let timeText = '';
  if (backupTime) {
    try {
      const d = new Date(backupTime);
      timeText = ` (Guardada el ${d.toLocaleDateString('es-ES')} a las ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`;
    } catch (e) {}
  }

  const banners = [
    document.getElementById('safetyBackupBannerCloud'),
    document.getElementById('safetyBackupBannerModalBackup')
  ];
  banners.forEach(b => {
    if (b) {
      b.style.display = hasBackup ? 'flex' : 'none';
      const timeSpan = b.querySelector('.safety-backup-time');
      if (timeSpan) timeSpan.textContent = timeText;
    }
  });
}

// Actualizar indicador visual en la cabecera
function setAutoSyncStatus(text, type = 'normal') {
  const iconEl = document.getElementById('cloudSyncStatusIcon');
  const textEl = document.getElementById('cloudSyncStatusText');
  const bannerIcon = document.getElementById('cloudSyncBannerIcon');
  const bannerStatus = document.getElementById('cloudSyncBannerStatus');
  const bannerSub = document.getElementById('cloudSyncBannerSubtitle');
  const bannerTime = document.getElementById('cloudSyncLastTime');

  if (iconEl && textEl) {
    if (text.includes('Guardando')) {
      iconEl.textContent = '⚡';
      textEl.textContent = 'Guardando...';
    } else if (text.includes('Sincronizado') || text.includes('Actualizado') || text.includes('Conectado')) {
      iconEl.textContent = '🟢';
      textEl.textContent = 'Sincronizado';
    } else if (text.includes('Descargando') || text.includes('Conectando')) {
      iconEl.textContent = '🔄';
      textEl.textContent = 'Conectando...';
    } else if (text.includes('Error') || text.includes('sin conexión')) {
      iconEl.textContent = '⚠️';
      textEl.textContent = 'Sin conexión';
    } else {
      iconEl.textContent = '🟢';
      textEl.textContent = 'Sincronizado';
    }
  }

  if (bannerStatus) bannerStatus.textContent = text;
  if (bannerIcon) {
    bannerIcon.textContent = text.includes('Guardando') ? '⚡' : (text.includes('Error') ? '⚠️' : '🟢');
  }
  if (bannerSub) {
    bannerSub.textContent = `PIN Activo: "${getActivePin()}". Sincronización en tiempo real multi-dispositivo activa.`;
  }
  if (bannerTime) {
    bannerTime.textContent = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

// ------------------------------------------------------------
// 1. PUSH A LA NUBE (Envía los datos a Firebase con Anti-Sobreescritura)
// ------------------------------------------------------------
async function autoPushToCloud(pin, dataObj, isManual = false) {
  if (!pin || typeof pin !== 'string') return;
  if (isReceivingFromServer) return;

  // Bloqueo de seguridad: No empujar datos viejos hasta que el arranque confirme el estado de la nube
  if (!hasInitialSyncCompleted && !isManual) {
    console.log('[CloudSync] autoPush bloqueado: esperando a que finalice la sincronización inicial con la nube.');
    return;
  }

  const cleanPin = cleanPinKey(pin);
  const dbUrl = getActiveFirebaseDb();
  if (!dbUrl) return;

  // VERIFICACIÓN PREVIA DE CONFLICTOS REMOTOS (Anti-Sobreescritura de versiones más nuevas o con más viajes)
  if (!isManual) {
    try {
      const checkRes = await fetch(`${dbUrl}/rooms/${encodeURIComponent(cleanPin)}.json?nocache=${Date.now()}`);
      if (checkRes.ok) {
        const remoteData = await checkRes.json();
        if (remoteData) {
          const actualRemote = (remoteData.payload && typeof remoteData.payload === 'object') ? remoteData.payload : remoteData;
          const remoteTime = remoteData._lastUpdated || remoteData.timestamp || actualRemote._lastUpdated || actualRemote.timestamp || 0;
          const remoteTrips = countTripsInDb(actualRemote);
          const localTrips = countTripsInDb(dataObj);

          // Si la versión en la nube es más reciente que nuestra última sincronización conocida
          // o si la nube tiene más viajes que los datos locales (evita borrar viajes creados en otro equipo)
          if ((remoteTime > (lastKnownRemoteTime || 0) + 1500) || (remoteTrips > localTrips && remoteTime > (dataObj._lastUpdated || 0))) {
            console.warn(`[CloudSync] Conflicto prevenido: la nube tiene datos más recientes o más viajes (${remoteTrips} vs ${localTrips}). Cancelando subida y descargando versión más reciente.`);
            setAutoSyncStatus('🔄 Descargando versión más reciente de la nube...');

            // Guardar copia local de seguridad por precaución antes de descargar
            saveSafetyBackup(dataObj, 'conflicto_detectado');

            await autoFetchFromCloud(pin, (newData) => {
              window.db = newData;
              if (typeof window.setAppDb === 'function') window.setAppDb(newData);
              if (typeof initApp === 'function') initApp();
              showToast('☁️ Se ha descargado la versión más reciente para evitar perder datos', 'info');
            }, false);
            return;
          }
        }
      }
    } catch (checkErr) {
      console.warn('[CloudSync] No se pudo verificar versión remota previa al push:', checkErr);
    }
  }

  const now = Date.now();
  const payload = { ...dataObj, _lastUpdated: now };
  const payloadStr = JSON.stringify(payload);

  // 1. Guardar localmente
  try {
    localStorage.setItem('PLANIFICADOR_VIAJES_DB_V1', payloadStr);
  } catch (e) {}

  // 2. Enviar a Firebase REST
  try {
    setAutoSyncStatus('⚡ Guardando cambios...');
    const res = await fetch(`${dbUrl}/rooms/${encodeURIComponent(cleanPin)}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: payload,
        _lastUpdated: now,
        timestamp: now
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    lastKnownRemoteTime = now;
    setAutoSyncStatus('🟢 Sincronizado en tiempo real');
    if (isManual) {
      showToast('¡Datos subidos exitosamente a la nube!', 'success');
    }
  } catch (err) {
    console.warn('Firebase push error:', err);
    setAutoSyncStatus('⚠️ Guardado en este dispositivo (sin conexión)');
    if (isManual) {
      showToast(`Error al subir: ${err.message}`, 'error');
    }
  }
}

// ------------------------------------------------------------
// 2. FETCH DE LA NUBE (Descarga cambios desde Firebase)
// ------------------------------------------------------------
async function autoFetchFromCloud(pin, onNewData, isManual = false) {
  if (!pin || typeof pin !== 'string') return false;
  const cleanPin = cleanPinKey(pin);
  const dbUrl = getActiveFirebaseDb();
  if (!dbUrl) return false;

  try {
    const res = await fetch(`${dbUrl}/rooms/${encodeURIComponent(cleanPin)}.json?nocache=${Date.now()}`);
    if (!res.ok) {
      hasInitialSyncCompleted = true;
      return false;
    }
    const remoteData = await res.json();
    if (!remoteData || typeof remoteData !== 'object') {
      hasInitialSyncCompleted = true;
      return false;
    }

    // Aceptar tanto formato wrapped { payload, _lastUpdated } como directo
    const actualData = (remoteData.payload && typeof remoteData.payload === 'object') ? remoteData.payload : remoteData;
    const remoteTime = remoteData._lastUpdated || remoteData.timestamp || actualData._lastUpdated || actualData.timestamp || 0;

    let localTime = 0;
    let localData = null;
    try {
      const loc = localStorage.getItem('PLANIFICADOR_VIAJES_DB_V1');
      if (loc) {
        localData = JSON.parse(loc);
        localTime = localData._lastUpdated || 0;
      }
    } catch (e) {}

    const remoteTrips = countTripsInDb(actualData);
    const localTrips = countTripsInDb(localData);

    // Si la versión en la nube es más reciente, tiene más viajes, o es descarga manual
    const shouldUpdate = isManual || (remoteTime > localTime + 500) || (remoteTrips > localTrips && remoteTime >= localTime);

    if (shouldUpdate) {
      // Guardar copia de seguridad previa antes de actualizar
      try {
        const currentLoc = localStorage.getItem('PLANIFICADOR_VIAJES_DB_V1');
        if (currentLoc) {
          saveSafetyBackup(currentLoc, 'antes_de_actualizacion_nube');
        }
      } catch (e) {}

      lastKnownRemoteTime = remoteTime;
      actualData._lastUpdated = remoteTime;

      // 1. Guardar en localStorage
      try {
        localStorage.setItem('PLANIFICADOR_VIAJES_DB_V1', JSON.stringify(actualData));
      } catch (e) {}

      // 2. Notificar callback para actualizar estado en memoria y pantalla
      if (typeof onNewData === 'function') {
        onNewData(actualData);
      }

      setAutoSyncStatus('🟢 Sincronizado en tiempo real');
      if (isManual) {
        showToast('¡Datos descargados y sincronizados desde la nube!', 'success');
      }
      hasInitialSyncCompleted = true;
      return true;
    } else {
      if (remoteTime > 0) {
        lastKnownRemoteTime = Math.max(lastKnownRemoteTime, remoteTime);
      }
    }
  } catch (err) {
    console.warn('Firebase fetch error:', err);
    if (isManual) {
      showToast(`Error al descargar: ${err.message}`, 'error');
    }
  } finally {
    hasInitialSyncCompleted = true;
  }
  return false;
}

// ------------------------------------------------------------
// 3. HOOK AUTOMÁTICO AL GUARDAR CUALQUIER CAMBIO
// ------------------------------------------------------------
function onDatabaseSavedHook(data) {
  if (isReceivingFromServer) return;
  if (!hasInitialSyncCompleted) {
    console.log('[CloudSync] onDatabaseSavedHook ignorado durante la inicialización');
    return;
  }
  const pin = getActivePin();
  if (!pin) return;

  setAutoSyncStatus('⚡ Guardando cambios...');
  if (autoSyncDebounceTimer) {
    clearTimeout(autoSyncDebounceTimer);
  }

  // Debounce de 1200ms para agrupar escrituras rápidas
  autoSyncDebounceTimer = setTimeout(() => {
    const currentData = data || getCurrentAppDb();
    if (currentData) {
      autoPushToCloud(pin, currentData, false);
    }
  }, 1200);
}

// ------------------------------------------------------------
// 4. BUCLE DE ESCUCHA PERIÓDICO Y EVENTOS DE PANTALLA
// ------------------------------------------------------------
function startAutoSyncLoop() {
  const checkSync = (isFirstCheck = false) => {
    if (isReceivingFromServer) return;
    const pin = getActivePin();
    if (!pin) return;

    autoFetchFromCloud(pin, (newData) => {
      isReceivingFromServer = true;

      // Actualizar variables globales de la app
      window.db = newData;
      if (typeof window.setAppDb === 'function') {
        window.setAppDb(newData);
      }

      // Re-renderizar la interfaz completa con los datos nuevos
      if (typeof initApp === 'function') {
        initApp();
      }

      showToast('☁️ Planificador actualizado automáticamente desde otro dispositivo', 'info');

      setTimeout(() => {
        isReceivingFromServer = false;
      }, 500);
    }, false).finally(() => {
      hasInitialSyncCompleted = true;
      updateSafetyBackupBanners();
    });
  };

  // 1. Verificación inicial inmediata
  checkSync(true);

  // 2. Comprobación periódica cada 4 segundos
  if (syncPollerInterval) clearInterval(syncPollerInterval);
  syncPollerInterval = setInterval(() => checkSync(false), 4000);

  // 3. Eventos instantáneos al recuperar foco o volver a la pestaña en móviles
  window.removeEventListener('focus', checkSync);
  window.addEventListener('focus', () => checkSync(false));

  document.removeEventListener('visibilitychange', checkSync);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkSync(false);
    }
  });

  updateSafetyBackupBanners();
}

// ------------------------------------------------------------
// 5. GESTIÓN DEL MODAL Y ACCIONES DE USUARIO
// ------------------------------------------------------------
function openCloudSyncModal() {
  const inputPin = document.getElementById('inputCloudSyncKey');
  const inputDb = document.getElementById('inputCloudDbUrl');
  const shareRow = document.getElementById('cloudSyncShareRow');
  const shareInput = document.getElementById('inputCloudShareUrl');

  if (inputPin) inputPin.value = getActivePin();
  if (inputDb) inputDb.value = getActiveFirebaseDb();

  if (shareRow && shareInput) {
    shareRow.style.display = 'block';
    shareInput.value = buildCloudShareUrl();
  }

  updateSafetyBackupBanners();
  setAutoSyncStatus('🟢 Conectado');
  openModal('modalCloudSync');
}

function buildCloudShareUrl() {
  const origin = window.location.origin + window.location.pathname;
  const pin = encodeURIComponent(getActivePin());
  return `${origin}?pin=${pin}`;
}

function copyCloudShareUrl() {
  const url = buildCloudShareUrl();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('¡Enlace copiado! Ábrelo en tu móvil para sincronizarte al instante.', 'success');
    }).catch(() => {
      prompt('Copia este enlace para abrirlo en tu móvil:', url);
    });
  } else {
    prompt('Copia este enlace para abrirlo en tu móvil:', url);
  }
}

async function saveAndConnectCloudSync() {
  const inputPin = document.getElementById('inputCloudSyncKey');
  const inputDb = document.getElementById('inputCloudDbUrl');

  const newPin = cleanPinKey(inputPin ? inputPin.value : getActivePin());
  const newDb = inputDb ? inputDb.value.trim().replace(/\/+$/, '') : getActiveFirebaseDb();

  try {
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    if (newDb) {
      localStorage.setItem(DB_URL_STORAGE_KEY, newDb);
    }
  } catch (e) {}

  closeModal('modalCloudSync');
  showToast(`✅ Conectado con el PIN: ${newPin}`, 'success');
  setAutoSyncStatus('🟢 Sincronizado en tiempo real');

  // Comprobar y descargar inmediatamente
  autoFetchFromCloud(newPin, (newData) => {
    window.db = newData;
    if (typeof window.setAppDb === 'function') window.setAppDb(newData);
    if (typeof initApp === 'function') initApp();
  }, true);
}

function disconnectCloudSync() {
  if (confirm('¿Deseas desconectar la sincronización automática? La aplicación continuará en modo local.')) {
    if (syncPollerInterval) clearInterval(syncPollerInterval);
    setAutoSyncStatus('Modo Local (Desconectado)', 'disabled');
    closeModal('modalCloudSync');
    showToast('Sincronización en la nube desactivada.', 'info');
  }
}

function forceCloudUpload() {
  const pin = getActivePin();
  const d = getCurrentAppDb();
  if (!d) {
    alert('No se encontraron datos locales para subir.');
    return;
  }
  if (confirm(`¿Subir todos los datos actuales de este dispositivo a la nube bajo el PIN "${pin}"?`)) {
    autoPushToCloud(pin, d, true);
  }
}

function forceCloudDownload() {
  const pin = getActivePin();
  if (confirm(`¿Descargar los datos de la nube del PIN "${pin}" y reemplazar los locales?`)) {
    autoFetchFromCloud(pin, (newData) => {
      window.db = newData;
      if (typeof window.setAppDb === 'function') window.setAppDb(newData);
      if (typeof initApp === 'function') initApp();
    }, true);
  }
}

// ------------------------------------------------------------
// 6. INICIALIZACIÓN AUTOMÁTICA AL ABRIR LA WEB
// ------------------------------------------------------------
function checkUrlCloudParametersAndInit() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const pinParam = urlParams.get('pin') || urlParams.get('sync');
    const dbParam = urlParams.get('db');

    if (pinParam) {
      const cleanPin = cleanPinKey(pinParam);
      try {
        localStorage.setItem(PIN_STORAGE_KEY, cleanPin);
      } catch (e) {}
      showToast(`📲 Dispositivo vinculado automáticamente con el PIN: ${cleanPin}`, 'success');
    }

    if (dbParam) {
      try {
        localStorage.setItem(DB_URL_STORAGE_KEY, dbParam.trim().replace(/\/+$/, ''));
      } catch (e) {}
    }

    setAutoSyncStatus('🟢 Conectado');
    startAutoSyncLoop();
  } catch (e) {
    console.error('Error en inicialización cloudSync:', e);
  }
}

// Exportar funciones a window
window.openCloudSyncModal = openCloudSyncModal;
window.saveAndConnectCloudSync = saveAndConnectCloudSync;
window.disconnectCloudSync = disconnectCloudSync;
window.forceCloudUpload = forceCloudUpload;
window.forceCloudDownload = forceCloudDownload;
window.copyCloudShareUrl = copyCloudShareUrl;
window.onDatabaseSavedHook = onDatabaseSavedHook;
window.checkUrlCloudParametersAndInit = checkUrlCloudParametersAndInit;
window.setAutoSyncStatus = setAutoSyncStatus;
window.autoPushToCloud = autoPushToCloud;
window.autoFetchFromCloud = autoFetchFromCloud;
window.getActivePin = getActivePin;
window.restoreSafetyBackup = restoreSafetyBackup;
window.updateSafetyBackupBanners = updateSafetyBackupBanners;

// Iniciar automáticamente cuando carga el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkUrlCloudParametersAndInit);
} else {
  checkUrlCloudParametersAndInit();
}
