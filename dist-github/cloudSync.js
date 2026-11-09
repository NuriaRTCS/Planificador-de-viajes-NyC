function getCurrentAppDatabase() {
  if (typeof window.getAppDb === "function") {
    const d = window.getAppDb();
    if (d) return d;
  }
  if (window.db) return window.db;
  if (typeof loadDatabase === "function") {
    try {
      const d = loadDatabase();
      if (d) return d;
    } catch (e) {}
  }
  return null;
}

// ============================================================
// MODULO DE SINCRONIZACIÓN EN LA NUBE Y MULTI-DISPOSITIVO
// ============================================================

const CLOUD_CONFIG_KEY = "TRAVEL_PLANNER_CLOUD_CONFIG";
const CLOUD_DEVICE_ID_KEY = "TRAVEL_PLANNER_DEVICE_ID";

// Generar o recuperar ID único para este dispositivo
function getDeviceId() {
  let id = localStorage.getItem(CLOUD_DEVICE_ID_KEY);
  if (!id) {
    id = "dev_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
    localStorage.setItem(CLOUD_DEVICE_ID_KEY, id);
  }
  return id;
}

const currentDeviceId = getDeviceId();

// Configuración de sincronización
let cloudConfig = loadCloudConfig();
let cloudSyncDebounceTimer = null;
let cloudPollerTimer = null;
let cloudEventSource = null;
let lastKnownRemoteTimestamp = 0;
let isSyncingToServer = false;
let isReceivingFromServer = false;

function loadCloudConfig() {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Error cargando configuración cloud:", e);
  }
  return {
    enabled: false,
    dbUrl: "",
    syncKey: generateDefaultSyncKey(),
    lastSyncTime: null
  };
}

function saveCloudConfig(cfg) {
  cloudConfig = { ...cloudConfig, ...cfg };
  window.cloudConfig = cloudConfig;
window.getCloudConfig = () => cloudConfig;
window.getCloudEndpointUrl = getCloudEndpointUrl;
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(cloudConfig));
  } catch (e) {
    console.error("Error guardando configuración cloud:", e);
  }
  updateCloudSyncUI();
}

function generateDefaultSyncKey() {
  const words = ["viaje", "familia", "ruta", "aventura", "norte", "verano", "escapada"];
  const w1 = words[Math.floor(Math.random() * words.length)];
  const randNum = Math.floor(100 + Math.random() * 900);
  return `${w1}-${randNum}`;
}

function cleanDbUrl(url) {
  if (!url) return "";
  let clean = url.trim();
  clean = clean.replace(/\/+$/, "");
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  return clean;
}

function cleanSyncKey(key) {
  if (!key) return "";
  return key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-");
}

function getCloudEndpointUrl(config = cloudConfig) {
  const base = cleanDbUrl(config.dbUrl);
  const key = cleanSyncKey(config.syncKey);
  if (!base || !key) return "";
  return `${base}/rooms/${encodeURIComponent(key)}.json`;
}

// ------------------------------------------------------------
// INTERFAZ DE USUARIO: INDICADOR Y MODAL
// ------------------------------------------------------------
function updateCloudSyncUI(status = null) {
  const iconEl = document.getElementById("cloudSyncStatusIcon");
  const textEl = document.getElementById("cloudSyncStatusText");
  const bannerIcon = document.getElementById("cloudSyncBannerIcon");
  const bannerStatus = document.getElementById("cloudSyncBannerStatus");
  const bannerSub = document.getElementById("cloudSyncBannerSubtitle");
  const bannerTime = document.getElementById("cloudSyncLastTime");
  const btnDisconnect = document.getElementById("btnDisconnectCloud");
  const shareRow = document.getElementById("cloudSyncShareRow");
  const inputShareUrl = document.getElementById("inputCloudShareUrl");

  let effectiveStatus = status;
  if (!effectiveStatus) {
    if (!cloudConfig.enabled || !cloudConfig.dbUrl || !cloudConfig.syncKey) {
      effectiveStatus = "disabled";
    } else {
      effectiveStatus = "connected";
    }
  }

  const timeStr = cloudConfig.lastSyncTime ? new Date(cloudConfig.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  if (effectiveStatus === "connected") {
    if (iconEl) iconEl.textContent = "🟢";
    if (textEl) textEl.textContent = "En línea";
    if (bannerIcon) bannerIcon.textContent = "🟢";
    if (bannerStatus) bannerStatus.textContent = "Conectado y Sincronizado";
    if (bannerSub) bannerSub.textContent = `Sincronizando automáticamente en tiempo real bajo la clave: ${cloudConfig.syncKey}`;
    if (bannerTime && timeStr) bannerTime.textContent = `Última sinc.: ${timeStr}`;
    if (btnDisconnect) btnDisconnect.style.display = "inline-flex";
    if (shareRow) shareRow.style.display = "block";
    if (inputShareUrl) {
      inputShareUrl.value = buildCloudShareUrl();
    }
  } else if (effectiveStatus === "syncing") {
    if (iconEl) iconEl.textContent = "🟡";
    if (textEl) textEl.textContent = "Sincronizando...";
    if (bannerIcon) bannerIcon.textContent = "🟡";
    if (bannerStatus) bannerStatus.textContent = "Guardando en la nube...";
    if (bannerSub) bannerSub.textContent = "Transmitiendo cambios a tus otros dispositivos...";
  } else if (effectiveStatus === "error") {
    if (iconEl) iconEl.textContent = "🔴";
    if (textEl) textEl.textContent = "Error sinc.";
    if (bannerIcon) bannerIcon.textContent = "🔴";
    if (bannerStatus) bannerStatus.textContent = "Atención: No se pudo conectar con la nube";
    if (bannerSub) bannerSub.textContent = "Verifica la URL de tu base de datos o tu conexión a internet.";
  } else {
    // Disabled / Local
    if (iconEl) iconEl.textContent = "⚪";
    if (textEl) textEl.textContent = "Sincronizar";
    if (bannerIcon) bannerIcon.textContent = "⚪";
    if (bannerStatus) bannerStatus.textContent = "Modo Local (Sin sincronización activa)";
    if (bannerSub) bannerSub.textContent = "Tus datos se guardan en este dispositivo. Conecta una base en la nube para sincronizar con tu móvil y otros dispositivos.";
    if (bannerTime) bannerTime.textContent = "";
    if (btnDisconnect) btnDisconnect.style.display = "none";
    if (shareRow) shareRow.style.display = "none";
  }
}

function openCloudSyncModal() {
  const inputKey = document.getElementById("inputCloudSyncKey");
  const inputUrl = document.getElementById("inputCloudDbUrl");

  if (inputKey) inputKey.value = cloudConfig.syncKey || generateDefaultSyncKey();
  if (inputUrl) inputUrl.value = cloudConfig.dbUrl || "";

  updateCloudSyncUI();
  openModal("modalCloudSync");
}

function buildCloudShareUrl() {
  const origin = window.location.origin + window.location.pathname;
  const key = encodeURIComponent(cloudConfig.syncKey || "");
  const dbParam = encodeURIComponent(cloudConfig.dbUrl || "");
  return `${origin}?sync=${key}&db=${dbParam}`;
}

function copyCloudShareUrl() {
  if (!cloudConfig.dbUrl) {
    alert("⚠️ ATENCIÓN:\n\nPara que la sincronización automática funcione entre dispositivos, primero debes indicar la 'URL de tu base de datos Firebase' y pulsar '☁️ Conectar y Sincronizar'. Así tus datos se subirán a la nube.\n\n💡 Si solo quieres pasar tus datos al móvil ahora mismo sin configurar Firebase:\nUsa el botón '💾 Datos / Backup' de la cabecera para descargar una copia (.json) y restaurarla en el móvil.");
    return;
  }
  const url = buildCloudShareUrl();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast("¡Enlace copiado! Ábrelo en tu móvil para sincronizarte al instante.", "success");
    }).catch(() => {
      prompt("Copia este enlace para abrirlo en tu móvil:", url);
    });
  } else {
    prompt("Copia este enlace para abrirlo en tu móvil:", url);
  }
}

// ------------------------------------------------------------
// TRANSMISIÓN Y SINCRONIZACIÓN AUTOMÁTICA
// ------------------------------------------------------------

// Se invoca automáticamente desde saveDatabase(data)
function onDatabaseSavedHook(data) {
  if (!cloudConfig.enabled || !cloudConfig.dbUrl || !cloudConfig.syncKey || isReceivingFromServer) {
    return;
  }

  // Cancelar envío previo y debouncar para evitar peticiones repetidas al escribir rápido
  if (cloudSyncDebounceTimer) {
    clearTimeout(cloudSyncDebounceTimer);
  }

  updateCloudSyncUI("syncing");

  cloudSyncDebounceTimer = setTimeout(() => {
    uploadDatabaseToCloud(data);
  }, 650);
}

async function uploadDatabaseToCloud(data = null, isManual = false) {
  const endpoint = getCloudEndpointUrl();
  if (!endpoint) return;

  if (!data) {
    data = getCurrentAppDatabase();
  }
  if (!data) {
    console.error("No hay base de datos para subir");
    if (isManual) showToast("Error: No se encontró la base de datos para subir.", "error");
    return;
  }

  isSyncingToServer = true;
  updateCloudSyncUI("syncing");

  const payload = {
    payload: data,
    timestamp: Date.now(),
    deviceId: currentDeviceId
  };

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    }

    lastKnownRemoteTimestamp = payload.timestamp;
    saveCloudConfig({ lastSyncTime: payload.timestamp });
    updateCloudSyncUI("connected");

    if (isManual) {
      showToast("¡Datos subidos exitosamente a la nube!", "success");
    }
  } catch (err) {
    console.error("Error al subir a la nube:", err);
    updateCloudSyncUI("error");
    if (isManual) {
      showToast(`Error al subir a la nube: ${err.message}`, "error");
    }
  } finally {
    isSyncingToServer = false;
  }
}

async function downloadDatabaseFromCloud(isManual = false) {
  const endpoint = getCloudEndpointUrl();
  if (!endpoint) return;

  try {
    updateCloudSyncUI("syncing");
    const res = await fetch(endpoint, { method: "GET" });

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }

    const remoteData = await res.json();
    if (!remoteData || !remoteData.payload) {
      if (isManual) {
        showToast("La sala en la nube está vacía. Se subirán los datos actuales de este dispositivo.", "info");
        const d = getCurrentAppDatabase(); await uploadDatabaseToCloud(d, true);
      }
      updateCloudSyncUI("connected");
      return;
    }

    // Verificar si es de otro dispositivo o más reciente
    const remoteTime = remoteData.timestamp || 0;
    const isFromOtherDevice = remoteData.deviceId !== currentDeviceId;

    if (remoteTime > lastKnownRemoteTimestamp || isManual) {
      lastKnownRemoteTimestamp = remoteTime;
      isReceivingFromServer = true;

      // Actualizar base de datos local
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData.payload));
      } catch (e) {}
      if (typeof window.setAppDb === "function") {
        window.setAppDb(remoteData.payload);
      }
      window.db = remoteData.payload;

      saveCloudConfig({ lastSyncTime: remoteTime });
      updateCloudSyncUI("connected");

      // Refrescar vistas activas en la aplicación
      if (typeof initApp === "function") {
        initApp();
      }

      if (isManual) {
        showToast("¡Datos descargados y sincronizados desde la nube!", "success");
      } else if (isFromOtherDevice) {
        showToast("☁️ Planificador actualizado automáticamente desde otro dispositivo", "info");
      }

      setTimeout(() => {
        isReceivingFromServer = false;
      }, 500);
    } else {
      updateCloudSyncUI("connected");
    }
  } catch (err) {
    console.error("Error al descargar desde la nube:", err);
    updateCloudSyncUI("error");
    if (isManual) {
      showToast(`Error al descargar: ${err.message}`, "error");
    }
  }
}

// Iniciar escucha continua en tiempo real (Poller inteligente y ligero)
function startCloudRealtimeListener() {
  stopCloudRealtimeListener();

  if (!cloudConfig.enabled || !cloudConfig.dbUrl || !cloudConfig.syncKey) {
    return;
  }

  // Realizar primera descarga inicial
  downloadDatabaseFromCloud(false);

  // Escuchar con Server-Sent Events (SSE) si la base soporta /rooms/<key>.json
  // Firebase Realtime DB soporta SSE nativo añadiendo accept: text/event-stream
  const endpoint = getCloudEndpointUrl();
  if (endpoint && window.EventSource) {
    try {
      cloudEventSource = new EventSource(endpoint);
      cloudEventSource.addEventListener("put", (e) => {
        if (isSyncingToServer) return;
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.data && parsed.data.payload) {
            if (parsed.data.deviceId !== currentDeviceId && parsed.data.timestamp > lastKnownRemoteTimestamp) {
              downloadDatabaseFromCloud(false);
            }
          }
        } catch(err) {}
      });
      cloudEventSource.onerror = () => {
        // Fallback al poller si SSE tiene restricciones de CORS
        if (cloudEventSource) {
          try { cloudEventSource.close(); } catch(e){}
          cloudEventSource = null;
        }
      };
    } catch(e) {}
  }

  // Polling de respaldo cada 5 segundos si la ventana está visible
  cloudPollerTimer = setInterval(() => {
    if (document.visibilityState === "visible" && !isSyncingToServer && cloudConfig.enabled) {
      downloadDatabaseFromCloud(false);
    }
  }, 2500);
}

function stopCloudRealtimeListener() {
  if (cloudPollerTimer) {
    clearInterval(cloudPollerTimer);
    cloudPollerTimer = null;
  }
  if (cloudEventSource) {
    try { cloudEventSource.close(); } catch(e){}
    cloudEventSource = null;
  }
}

// ------------------------------------------------------------
// GESTIÓN DE ACCIONES DE USUARIO
// ------------------------------------------------------------
async function saveAndConnectCloudSync() {
  const inputKey = document.getElementById("inputCloudSyncKey");
  const inputUrl = document.getElementById("inputCloudDbUrl");

  const keyVal = cleanSyncKey(inputKey ? inputKey.value : "");
  let urlVal = cleanDbUrl(inputUrl ? inputUrl.value : "");

  if (!keyVal) {
    alert("Por favor introduce una clave o código para tu familia/grupo.");
    return;
  }

  if (!urlVal) {
    alert("Por favor introduce la URL de tu base de datos Firebase Realtime Database (ej: https://tu-proyecto-default-rtdb.firebaseio.com).");
    return;
  }

  saveCloudConfig({
    enabled: true,
    dbUrl: urlVal,
    syncKey: keyVal
  });

  updateCloudSyncUI("syncing");
  closeModal("modalCloudSync");
  showToast("Conectando con la nube...", "info");

  // Descargar o sincronizar
  await downloadDatabaseFromCloud(true);
  startCloudRealtimeListener();
}

function disconnectCloudSync() {
  if (confirm("¿Deseas desconectar este dispositivo de la sincronización en la nube? Seguirás teniendo tus datos locales en este navegador.")) {
    stopCloudRealtimeListener();
    saveCloudConfig({
      enabled: false
    });
    updateCloudSyncUI("disabled");
    closeModal("modalCloudSync");
    showToast("Sincronización en la nube desactivada. La app funciona ahora en modo local.", "info");
  }
}

function forceCloudUpload() {
  if (!cloudConfig.dbUrl || !cloudConfig.syncKey) {
    alert("Primero debes configurar y conectar tu base de datos en la nube.");
    return;
  }
  if (confirm("¿Subir todos los datos actuales de este dispositivo a la nube? Se sobrescribirá lo que haya en la sala.")) {
    const d = getCurrentAppDatabase(); uploadDatabaseToCloud(d, true);
  }
}

function forceCloudDownload() {
  if (!cloudConfig.dbUrl || !cloudConfig.syncKey) {
    alert("Primero debes configurar y conectar tu base de datos en la nube.");
    return;
  }
  if (confirm("¿Descargar y reemplazar tus datos locales con los de la nube?")) {
    downloadDatabaseFromCloud(true);
  }
}

// Inicialización automática al cargar (comprueba query string ?sync= y ?db=)
function checkUrlCloudParametersAndInit(searchOverride = null) {
  try {
    const search = searchOverride !== null ? searchOverride : window.location.search;
    const urlParams = new URLSearchParams(search);
    const syncParam = urlParams.get("sync");
    const dbParam = urlParams.get("db");

    if (syncParam) {
      const cleanKey = cleanSyncKey(syncParam);
      const cleanUrl = dbParam ? cleanDbUrl(dbParam) : (cloudConfig.dbUrl || "");

      if (cleanKey) {
        saveCloudConfig({
          enabled: true,
          syncKey: cleanKey,
          dbUrl: cleanUrl || cloudConfig.dbUrl
        });
        showToast(`📲 Dispositivo vinculado automáticamente con la clave: ${cleanKey}`, "success");
      }
    }

    updateCloudSyncUI();

    if (cloudConfig.enabled && cloudConfig.dbUrl && cloudConfig.syncKey) {
      startCloudRealtimeListener();
      downloadDatabaseFromCloud(true);
    }
  } catch (e) {
    console.error("Error en auto-init cloud sync:", e);
  }
}

// Exportar funciones a window
window.cloudConfig = cloudConfig;
window.getCloudConfig = () => cloudConfig;
window.getCloudEndpointUrl = getCloudEndpointUrl;
window.getDeviceId = getDeviceId;
window.openCloudSyncModal = openCloudSyncModal;
window.saveAndConnectCloudSync = saveAndConnectCloudSync;
window.disconnectCloudSync = disconnectCloudSync;
window.forceCloudUpload = forceCloudUpload;
window.forceCloudDownload = forceCloudDownload;
window.copyCloudShareUrl = copyCloudShareUrl;
window.onDatabaseSavedHook = onDatabaseSavedHook;
window.checkUrlCloudParametersAndInit = checkUrlCloudParametersAndInit;
window.updateCloudSyncUI = updateCloudSyncUI;


// Escuchar visibilidad y foco para sincronizar al instante en móviles
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && cloudConfig && cloudConfig.enabled) {
      downloadDatabaseFromCloud(false);
    }
  });
}
if (typeof window !== "undefined") {
  window.addEventListener("focus", () => {
    if (cloudConfig && cloudConfig.enabled) {
      downloadDatabaseFromCloud(false);
    }
  });
}
