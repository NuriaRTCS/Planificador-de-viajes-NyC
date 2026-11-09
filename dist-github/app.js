// ============================================================
// LOGICA PRINCIPAL DE LA APLICACION - PLANIFICADOR DE VIAJES
// ============================================================

let db = loadDatabase();
window.db = db;
window.getAppDb = () => db;
window.setAppDb = (newDb) => {
  db = newDb;
  window.db = newDb;
  currentYear = db.activeYear || 2027;
};
let currentYear = db.activeYear || 2027;
let currentTripId = null;
let activeTab = 'tab-overview';

// Inicialización cuando carga el DOM o si ya está listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
  });
} else {
  initApp();
  setupEventListeners();
}

// ------------------------------------------------------------
// FRASES DEL DÍA SOBRE VIAJES (DINÁMICAS SEGÚN EL DÍA DEL AÑO)
// ------------------------------------------------------------
const TRAVEL_QUOTES = [
  "«El mundo es un libro y aquellos que no viajan solo leen una página.» — San Agustín",
  "«Viajar es la única cosa que compras y te hace más rico.»",
  "«Un viaje de mil millas comienza con un solo paso.» — Lao-Tsé",
  "«No viajamos para escapar de la vida, sino para que la vida no se nos escape.»",
  "«El verdadero viaje de descubrimiento no consiste en buscar nuevos paisajes, sino en mirar con nuevos ojos.» — Marcel Proust",
  "«Viajar te deja sin palabras y luego te convierte en un narrador de historias.» — Ibn Battuta",
  "«No todos los que vagan están perdidos.» — J.R.R. Tolkien",
  "«Nuestro destino nunca es un lugar, sino una nueva forma de ver las cosas.» — Henry Miller",
  "«Un viaje se mide mejor en amigos y recuerdos que en millas.» — Tim Cahill",
  "«Viajar es añadir vida a los años y libertad al espíritu.»",
  "«Viajar es descubrir que todos están equivocados sobre otros países.» — Aldous Huxley",
  "«La felicidad no es una estación a la que se llega, sino una manera de viajar.» — Margaret Lee Runbeck",
  "«Viajar te hace modesto: ves el pequeño lugar que ocupas en el mundo.» — Gustave Flaubert",
  "«Colecciona momentos, mapas y caminos, no cosas.»",
  "«El viaje no termina jamás, solo los viajeros terminan.» — José Saramago",
  "«Las mejores historias se encuentran entre las páginas de un pasaporte.»",
  "«Despertar en un pueblo extraño es una de las sensaciones más placenteras del mundo.» — Freya Stark",
  "«Viajar es vivir dos veces.» — Omar Khayyam",
  "«Nadie se da cuenta de lo hermoso que es viajar hasta que regresa a casa y descansa sobre su almohada vieja y conocida.» — Lin Yutang",
  "«A veces perderse en el camino es la mejor manera de encontrarse.»",
  "«Todo viaje tiene un propósito secreto del que el viajero no es consciente.» — Martin Buber",
  "«El camino es el destino: disfruta cada kilómetro del trayecto.»",
  "«Viajar enseña tolerancia y abre el corazón a nuevas perspectivas.» — Benjamin Disraeli",
  "«La aventura vale la pena por sí misma.» — Amelia Earhart",
  "«Hay lugares donde uno se queda y lugares que quedan en uno.»",
  "«Cada día es una nueva ruta, cada destino una nueva historia por escribir.»",
  "«El impulso de viajar es uno de los síntomas más esperanzadores de la vida.» — Agnes Repplier",
  "«Cruzar fronteras en el mapa es derribar fronteras en la mente.»",
  "«Explora, sueña, descubre: el mundo te está esperando.» — Mark Twain",
  "«El mejor de los viajes siempre es el próximo.»",
  "«Viajar abre la mente, expande el corazón y enriquece el alma.»",
  "«Como todos los grandes viajeros, he visto más de lo que puedo recordar y recuerdo más de lo que he visto.» — Benjamin Disraeli",
  "«Viajar es la mejor inversión en recuerdos y vivencias.»",
  "«La curiosidad es el motor del viajero; el asombro, su recompensa.»",
  "«Cada viaje es una ventana abierta a nuevas vivencias y culturas.»",
  "«Un buen viajero no tiene planes fijos ni la intención de llegar.» — Lao-Tsé",
  "«La vida comienza al final de tu zona de confort.» — Neale Donald Walsch",
  "«Viajar nos devuelve la capacidad de asombro de la infancia.»",
  "«No hay tierras extrañas; solo el viajero es el que resulta extraño.» — Robert Louis Stevenson",
  "«Viajar es cambiar de ropa el alma.»",
  "«Llena tu vida de aventuras, no de cosas; ten historias que contar, no cosas que mostrar.»",
  "«El horizonte nunca está lejos si tienes ganas de caminar.»"
];

let travelQuoteOffset = 0;

function getDailyQuoteIndex(offset = 0, dateObj = new Date()) {
  const start = new Date(dateObj.getFullYear(), 0, 0);
  const diff = (dateObj - start) + ((start.getTimezoneOffset() - dateObj.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const baseIndex = ((dateObj.getFullYear() * 37) + dayOfYear) % TRAVEL_QUOTES.length;
  return (baseIndex + offset + TRAVEL_QUOTES.length * 10) % TRAVEL_QUOTES.length;
}

function getDailyTravelQuote(offset = 0, dateObj = new Date()) {
  const idx = getDailyQuoteIndex(offset, dateObj);
  return TRAVEL_QUOTES[idx];
}

function renderDailyTravelQuote() {
  const el = document.getElementById("headerTravelQuote");
  if (!el) return;
  const quote = getDailyTravelQuote(travelQuoteOffset);
  el.innerHTML = `<span>✨</span> <span>${escapeHtml(quote)}</span>`;
}

function cycleTravelQuote() {
  travelQuoteOffset++;
  const el = document.getElementById("headerTravelQuote");
  if (el) {
    el.style.opacity = "0.2";
    setTimeout(() => {
      renderDailyTravelQuote();
      el.style.opacity = "1";
    }, 150);
  }
}

window.TRAVEL_QUOTES = TRAVEL_QUOTES;
window.getDailyQuoteIndex = getDailyQuoteIndex;
window.getDailyTravelQuote = getDailyTravelQuote;
window.renderDailyTravelQuote = renderDailyTravelQuote;
window.cycleTravelQuote = cycleTravelQuote;

function initApp() {
  db = loadDatabase();
  window.db = db;
  // Asegurar que el año actual exista
  if (!db.years[currentYear]) {
    const yearKeys = Object.keys(db.years);
    currentYear = yearKeys.length > 0 ? parseInt(yearKeys[0]) : 2027;
  }

  // Establecer viaje activo por defecto
  const yearData = db.years[currentYear];
  if (yearData && yearData.trips && yearData.trips.length > 0) {
    if (!currentTripId || !yearData.trips.find(t => t.id === currentTripId)) {
      const todayStr = getTodayString();
      const sorted = [...yearData.trips].sort((a, b) => {
        const rA = getTripDateRange(a);
        const rB = getTripDateRange(b);
        const aPast = rA.end < todayStr;
        const bPast = rB.end < todayStr;
        if (aPast !== bPast) return aPast ? 1 : -1;
        return rA.start.localeCompare(rB.start);
      });
      currentTripId = sorted[0].id;
    }
  } else {
    currentTripId = null;
  }

  // Recalcular finanzas completas para sincronizar todos los viajes y pagos
  recalculateAllTripFinancials();

  // Actualizar dinámicamente distancias y tiempos de llegada con Google Maps al abrir el planificador
  updateItineraryDistancesDynamically();

  renderDailyTravelQuote();
  renderYearButtons();
  renderYearBanner();
  renderStats();
  renderOverviewTab();
  renderTripPills();
  renderItineraryTab();
  renderMealsTab();
  renderTicketsTab();
  renderExpensesTab();
  renderBudgetTab();
  initFuelCalculator();

// checkUrlCloudParametersAndInit is handled on load

  // Soporte para deep-linking de pestañas vía query string (?tab=expenses) o hash (#tab-expenses)
  const urlParams = new URLSearchParams(window.location.search);
  const hashParam = window.location.hash ? window.location.hash.replace(/^#/, '') : null;
  const requestedTab = urlParams.get('tab') || hashParam;
  if (requestedTab) {
    switchTab(requestedTab.startsWith('tab-') ? requestedTab : 'tab-' + requestedTab);
  }

  // Soporte para apertura directa de modal para previsualización o atajos
  if (urlParams.get('modal') === 'assignMeal') {
    switchTab('tab-meals');
    setTimeout(() => {
      openAssignMealModal('Tortilla de patatas casera', 'Alojamiento');
    }, 100);
  }
}

// ------------------------------------------------------------
// NAVEGACIÓN ENTRE PESTAÑAS
// ------------------------------------------------------------
function setupEventListeners() {
  // Pestañas
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Botón Nuevo Año
  document.getElementById("btnNewYear").addEventListener("click", () => {
    openModal("modalNewYear");
  });

  // Confirmar Nuevo Año
  document.getElementById("btnConfirmNewYear").addEventListener("click", handleCreateNewYear);

  // Botón Imprimir
  document.getElementById("btnPrint").addEventListener("click", () => {
    window.print();
  });

  // Botón Backup
  document.getElementById("btnBackup").addEventListener("click", () => {
    openModal("modalBackup");
  });

  // Botón Exportar JSON
  document.getElementById("btnExportJSON").addEventListener("click", exportDatabaseToJSON);

  // Cargar JSON
  document.getElementById("inputFileJSON").addEventListener("change", importDatabaseFromJSON);

  // Botón Resetear (si está presente)
  const btnResetEl = document.getElementById("btnReset");
  if (btnResetEl) {
    btnResetEl.addEventListener("click", () => {
      if (confirm("¿Deseas restablecer todos los datos a la versión original de la propuesta 2027 del documento Excel? Los cambios manuales no guardados en backup se perderán.")) {
        db = resetToDefaultDatabase();
        currentYear = 2027;
        initApp();
        showToast("Datos restablecidos con éxito a la versión original de 2027", "success");
      }
    });
  }

  // Botón Editar Año
  document.getElementById("btnEditYear").addEventListener("click", () => {
    const yearData = db.years[currentYear];
    if (!yearData) return;
    const newName = prompt(`Editar título para el año ${currentYear}:`, yearData.name || `Año ${currentYear}`);
    if (newName !== null && newName.trim() !== "") {
      yearData.name = newName.trim();
      const newNotes = prompt(`Editar notas / descripción para el año ${currentYear}:`, yearData.notes || "");
      if (newNotes !== null) {
        yearData.notes = newNotes.trim();
      }
      saveDatabase(db);
      renderYearBanner();
      renderYearButtons();
      showToast(`Año ${currentYear} actualizado`, "success");
    }
  });

  // Botón Añadir Viaje al Año
  document.getElementById("btnAddTrip").addEventListener("click", () => {
    openTripModal();
  });

  // Botón Editar Viaje
  document.getElementById("btnEditTripModal").addEventListener("click", () => {
    const trip = getCurrentTrip();
    if (trip) openTripModal(trip);
  });

  // Guardar Viaje
  document.getElementById("btnSaveTrip").addEventListener("click", handleSaveTrip);

  // Botón Añadir Día
  document.getElementById("btnAddDayModal").addEventListener("click", () => {
    openDayModal();
  });

  // Guardar Día
  document.getElementById("btnSaveDay").addEventListener("click", handleSaveDay);

  // Botón Añadir Entrada
  document.getElementById("btnAddTicketModal").addEventListener("click", () => {
    openTicketModal();
  });

  // Guardar Entrada
  document.getElementById("btnSaveTicket").addEventListener("click", handleSaveTicket);

  // Botón Añadir Gasto
  document.getElementById("btnAddExpenseModal").addEventListener("click", () => {
    openExpenseModal();
  });

  // Guardar Gasto
  document.getElementById("btnSaveExpense").addEventListener("click", handleSaveExpense);

  // Botón Añadir Recurso / Plato al Banco
  const btnNewResource = document.getElementById("btnOpenNewMealResourceModal");
  if (btnNewResource) {
    btnNewResource.addEventListener("click", openNewMealResourceModal);
  }

  // Inputs calculadora de combustible
  ['calcKm', 'calcConsumption', 'calcPrice'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateFuelCalculation);
  });

  // Sincronización automática de fechas y noches en modal de viaje
  const tripStartEl = document.getElementById("inputTripStartDate");
  const tripEndEl = document.getElementById("inputTripEndDate");
  const updateTripNightsAuto = () => {
    const sVal = tripStartEl?.value;
    const eVal = tripEndEl?.value;
    const nightsInput = document.getElementById("inputTripNights");
    if (sVal && eVal && nightsInput) {
      const s = new Date(sVal + "T00:00:00");
      const e = new Date(eVal + "T00:00:00");
      const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
      nightsInput.value = Math.max(0, diff);
    }
  };
  if (tripStartEl) {
    const handleStartChange = () => {
      if (tripStartEl.value && tripEndEl) {
        const s = new Date(tripStartEl.value + "T00:00:00");
        if (!tripEndEl.value || tripEndEl.value <= tripStartEl.value) {
          const nextDay = new Date(s);
          nextDay.setDate(nextDay.getDate() + 1);
          tripEndEl.value = formatDateIso(nextDay);
        }
      }
      updateTripNightsAuto();
    };
    tripStartEl.addEventListener("change", handleStartChange);
    tripStartEl.addEventListener("input", handleStartChange);
  }
  if (tripEndEl) {
    tripEndEl.addEventListener("change", updateTripNightsAuto);
    tripEndEl.addEventListener("input", updateTripNightsAuto);
  }

  // Sincronización automática de día de la semana con la fecha en modal de día
  const dayDateEl = document.getElementById("inputDayDate");
  const dayWeekDayEl = document.getElementById("inputDayWeekDay");
  if (dayDateEl && dayWeekDayEl) {
    const updateDayWeekDayFromDate = () => {
      if (dayDateEl.value) {
        const d = new Date(dayDateEl.value + "T00:00:00");
        if (!isNaN(d.getTime())) {
          dayWeekDayEl.value = WEEKDAYS_MAP[d.getDay()];
        }
      }
    };
    dayDateEl.addEventListener("input", updateDayWeekDayFromDate);
    dayDateEl.addEventListener("change", updateDayWeekDayFromDate);
  }

  // Confirmar Borrar Viaje con seguridad
  const btnConfirmDel = document.getElementById("btnConfirmDeleteTrip");
  if (btnConfirmDel) {
    btnConfirmDel.addEventListener("click", handleConfirmDeleteTrip);
  }

  // Botón Borrar Viaje desde dentro del Modal de Viaje
  const btnDeleteTripModal = document.getElementById("btnDeleteTripFromModal");
  if (btnDeleteTripModal) {
    btnDeleteTripModal.addEventListener("click", () => {
      const tripId = document.getElementById("tripEditId").value;
      if (tripId) {
        closeModal("modalTrip");
        promptDeleteTrip(tripId);
      }
    });
  }

  // Gestión de Anticipos de Pago
  const btnAddAdvance = document.getElementById("btnAddAdvanceModal");
  if (btnAddAdvance) {
    btnAddAdvance.addEventListener("click", () => {
      openAdvanceModal();
    });
  }

  const btnSaveAdv = document.getElementById("btnSaveAdvance");
  if (btnSaveAdv) {
    btnSaveAdv.addEventListener("click", handleSaveAdvance);
  }

  const filterAdvSelect = document.getElementById("filterAdvanceTripSelect");
  if (filterAdvSelect) {
    filterAdvSelect.addEventListener("change", () => {
      renderAdvancesSection();
    });
  }

  const filterPendingSelect = document.getElementById("filterPendingExpensesTripSelect");
  if (filterPendingSelect) {
    filterPendingSelect.addEventListener("change", () => {
      renderPendingExpensesSection();
    });
  }

  const filterRouteExpSelect = document.getElementById("filterRouteExpensesTripSelect");
  if (filterRouteExpSelect) {
    filterRouteExpSelect.addEventListener("change", () => {
      renderExpensesTab();
    });
  }

  const filterBudgetSelect = document.getElementById("filterBudgetTripSelect");
  if (filterBudgetSelect) {
    filterBudgetSelect.addEventListener("change", () => {
      renderBudgetSummaryTable();
    });
  }
}

function switchTab(tabId) {
  if (tabId === 'tab-itinerary') tabId = 'tab-itineraries';
  activeTab = tabId;
  const cleanId = tabId.replace(/^tab-/, "");
  document.querySelectorAll(".nav-tab").forEach(t => {
    const tData = (t.getAttribute("data-tab") || "").replace(/^tab-/, "");
    t.classList.toggle("active", tData === cleanId);
  });
  document.querySelectorAll(".tab-content").forEach(c => {
    const cClean = c.id.replace(/^tab-/, "");
    if (c.id === tabId || cClean === cleanId) {
      c.style.display = "block";
      c.classList.add("active");
    } else {
      c.style.display = "none";
      c.classList.remove("active");
    }
  });
}

// ------------------------------------------------------------
// AÑOS (MULTI-YEAR SUPPORT)
// ------------------------------------------------------------
function renderYearButtons() {
  const container = document.getElementById("yearButtonsContainer");
  if (!container) return;
  container.innerHTML = "";

  const allYears = Object.keys(db.years || {}).map(Number).sort((a, b) => a - b);
  const todayStr = getTodayString();

  // 1. Determinar el año del próximo viaje (o en curso)
  let nextTripYear = null;
  let minDiff = Infinity;

  allYears.forEach(yr => {
    const yrData = db.years[yr];
    if (yrData && yrData.trips) {
      yrData.trips.forEach(t => {
        const { start, end } = getTripDateRange(t);
        if (end >= todayStr) {
          const diff = getDaysDifference(start, todayStr);
          const score = diff >= 0 ? diff : (100000 + diff);
          if (score < minDiff) {
            minDiff = score;
            nextTripYear = yr;
          }
        }
      });
    }
  });

  if (!nextTripYear) {
    const nowYr = new Date().getFullYear();
    nextTripYear = allYears.find(y => y >= nowYr) || allYears[0] || 2027;
  }

  // 2. Determinar el año siguiente
  let followingYear = allYears.find(y => y > nextTripYear) || (nextTripYear + 1);

  const primaryYears = [nextTripYear, followingYear];

  // Renderizar los 2 botones principales: próximo viaje y el siguiente
  primaryYears.forEach(yr => {
    const btn = document.createElement("button");
    btn.className = `year-btn ${yr === currentYear ? 'active' : ''}`;
    btn.textContent = yr;
    btn.title = yr === nextTripYear ? `Año ${yr} (Año del próximo viaje)` : `Año ${yr} (Año siguiente)`;
    btn.addEventListener("click", () => {
      if (!db.years[yr]) {
        const inputNum = document.getElementById("inputNewYearNum");
        if (inputNum) inputNum.value = yr;
        openModal("modalNewYear");
        return;
      }
      currentYear = yr;
      db.activeYear = yr;
      saveDatabase(db);
      initApp();
      showToast(`Cambiado al año ${yr}`, "success");
    });
    container.appendChild(btn);
  });

  // 3. Si hubiera más de dos años creados, se creará un desplegable con todos los años creados ordenados cronológicamente
  if (allYears.length > 2) {
    const isOtherYearActive = !primaryYears.includes(currentYear);
    const select = document.createElement("select");
    select.id = "selectPlannedYears";
    select.className = `year-dropdown-select ${isOtherYearActive ? 'active' : ''}`;
    select.title = "Desplegable con todos los años creados";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = isOtherYearActive ? `Año ${currentYear}` : "📅 Todos los años...";
    defaultOpt.disabled = true;
    defaultOpt.selected = !isOtherYearActive;
    select.appendChild(defaultOpt);

    allYears.forEach(yr => {
      const opt = document.createElement("option");
      opt.value = yr;
      if (yr === nextTripYear) {
        // En el desplegable aparecerá resaltado en negrita el próximo año y una estrella al lado
        opt.textContent = `⭐ Año ${yr}`;
        opt.style.fontWeight = "bold";
        opt.style.color = "#1e40af";
        opt.className = "next-year-option";
      } else {
        opt.textContent = `Año ${yr}`;
        opt.style.fontWeight = "normal";
      }
      if (yr === currentYear) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
      const selectedYr = parseInt(e.target.value, 10);
      if (!isNaN(selectedYr) && db.years[selectedYr]) {
        currentYear = selectedYr;
        db.activeYear = selectedYr;
        saveDatabase(db);
        initApp();
        showToast(`Cambiado al año ${selectedYr}`, "success");
      }
    });

    container.appendChild(select);
  }
}

function renderYearBanner() {
  const yearData = db.years[currentYear] || { name: `Año ${currentYear}`, notes: "" };
  const titleEl = document.getElementById("currentYearTitle");
  if (titleEl) titleEl.textContent = yearData.name || `Planificación de Viajes ${currentYear}`;
  const notesEl = document.getElementById("currentYearNotes");
  if (notesEl) {
    if (yearData.notes) {
      notesEl.textContent = yearData.notes;
      notesEl.style.display = "block";
    } else {
      notesEl.textContent = "";
      notesEl.style.display = "none";
    }
  }
}

function handleCreateNewYear() {
  const yrNum = parseInt(document.getElementById("inputNewYearNum").value);
  const yrName = document.getElementById("inputNewYearName").value.trim() || `Año ${yrNum} - Planificación de Viajes`;
  const template = document.getElementById("selectYearTemplate").value;

  if (isNaN(yrNum) || yrNum < 2020 || yrNum > 2060) {
    alert("Por favor, introduce un año válido entre 2020 y 2060.");
    return;
  }

  if (db.years[yrNum]) {
    alert(`El año ${yrNum} ya existe en el planificador.`);
    return;
  }

  let newTrips = [];
  let budgetSettings = {
    totalTripKm: 0,
    fuelConsumptionL100: 7.0,
    fuelPricePerLiter: 1.65,
    targetAccommodations: [],
    categories: {
      alojamiento: { budget: 0, paid: 0, pending: 0, totalNights: 0 },
      gasolinaPeajes: { budget: 0, paid: 0, pending: 0 },
      entradas: { budget: 0, paid: 0, pending: 0 },
      comidaSuper: { budget: 0, paid: 0, pending: 0 },
      otros: { budget: 0, paid: 0, pending: 0 },
      efectivo: { budget: 0, paid: 0, pending: 0 }
    }
  };

  db.years[yrNum] = {
    id: yrNum,
    name: yrName,
    notes: `Planificación para el año ${yrNum}`,
    trips: newTrips,
    budgetSettings: budgetSettings
  };

  db.activeYear = yrNum;
  currentYear = yrNum;
  saveDatabase(db);
  closeModal("modalNewYear");
  initApp();
  showToast(`¡Año ${yrNum} creado exitosamente!`, "success");
}

function openDeleteYearModal() {
  const yearKeys = Object.keys(db.years || {});
  if (yearKeys.length <= 1) {
    alert(`No se puede eliminar el año ${currentYear} porque es el único año configurado en el planificador.\nDebe existir al menos un año en el sistema.`);
    return;
  }

  const yearData = db.years[currentYear] || {};
  const tripCount = (yearData.trips && yearData.trips.length) || 0;

  const numEl = document.getElementById("deleteYearModalNum");
  const matchEl = document.getElementById("deleteYearConfirmMatch");
  const countEl = document.getElementById("deleteYearTripCount");
  const inputEl = document.getElementById("inputConfirmDeleteYear");
  const btnConfirm = document.getElementById("btnConfirmDeleteYearSafe");

  if (numEl) numEl.textContent = currentYear;
  if (matchEl) matchEl.textContent = currentYear;
  if (countEl) countEl.textContent = `${tripCount} viaje${tripCount === 1 ? '' : 's'} e itinerarios asociados`;
  if (inputEl) inputEl.value = "";
  if (btnConfirm) btnConfirm.disabled = true;

  openModal("modalDeleteYear");
}

function handleDeleteYearInputCheck(val) {
  const btnConfirm = document.getElementById("btnConfirmDeleteYearSafe");
  if (!btnConfirm) return;
  const isMatch = (val.trim() === String(currentYear));
  btnConfirm.disabled = !isMatch;
}

function executeSafeDeleteYear() {
  const inputEl = document.getElementById("inputConfirmDeleteYear");
  const val = inputEl ? inputEl.value.trim() : "";

  if (val !== String(currentYear)) {
    alert("El año introducido no coincide. Operación cancelada.");
    return;
  }

  const yearKeys = Object.keys(db.years || {});
  if (yearKeys.length <= 1) {
    alert("No se puede eliminar el único año existente.");
    closeModal("modalDeleteYear");
    return;
  }

  const deletedYear = currentYear;
  delete db.years[deletedYear];

  const remainingYears = Object.keys(db.years).map(Number).sort((a, b) => b - a);
  const nextYear = remainingYears.includes(2027) ? 2027 : remainingYears[0];
  currentYear = nextYear;
  db.activeYear = nextYear;

  saveDatabase(db);
  closeModal("modalDeleteYear");
  initApp();
  showToast(`El año ${deletedYear} y todos sus datos han sido eliminados de forma segura`, "warning");
}

function promptDeleteYear() {
  openDeleteYearModal();
}

// ------------------------------------------------------------
// ESTADÍSTICAS RÁPIDAS Y CÁLCULO DE PAGOS
// ------------------------------------------------------------
function getTripTotalPaid(t) {
  if (!t) return 0;
  let paidFromAdvances = 0;
  if (t.advances && t.advances.length > 0) {
    paidFromAdvances = t.advances.reduce((acc, a) => acc + (parseFloat(a.amount) || 0), 0);
  }
  let paidFromPayments = 0;
  if (t.accommodation && t.accommodation.payments) {
    t.accommodation.payments.forEach(p => {
      if (p.status === 'pagado') paidFromPayments += (parseFloat(p.amount) || 0);
    });
  } else if (t.stages && t.stages.length > 0) {
    t.stages.forEach(st => { paidFromPayments += (parseFloat(st.paid) || 0); });
  }
  return Math.max(paidFromAdvances, paidFromPayments);
}

function getMonthFromDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length >= 2) {
    const monthNum = parseInt(parts[1], 10);
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return months[monthNum - 1] || "";
  }
  return "";
}

function handleDueDateChange(inputEl, targetMonthId) {
  if (!inputEl || !inputEl.value) return;
  const mName = getMonthFromDate(inputEl.value);
  const targetEl = document.getElementById(targetMonthId);
  if (targetEl && (!targetEl.value || targetEl.value === "Julio" || targetEl.value === "Marzo")) {
    targetEl.value = mName;
    targetEl.dispatchEvent(new Event('input'));
  }
}

function formatDueDateDayMonth(dueDate, paymentMonth) {
  if (!dueDate && !paymentMonth) return "";
  if (dueDate) {
    const parts = dueDate.split("-");
    if (parts.length === 3) {
      const day = parts[2];
      const month = parts[1];
      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const mIdx = parseInt(month, 10) - 1;
      const mName = paymentMonth || months[mIdx] || month;
      return `${day}/${month} (${mName})`;
    }
  }
  return paymentMonth || "";
}

function syncYearScheduledPayments(yearData) {
  if (!yearData || !yearData.trips) return [];
  const existingItems = (yearData.budgetSettings && yearData.budgetSettings.targetAccommodations) || [];
  const existingMap = new Map();
  existingItems.forEach(it => {
    if (it.id) existingMap.set(it.id, it);
    else if (it.name) existingMap.set(it.name.toLowerCase(), it);
  });

  const synchronizedItems = [];

  yearData.trips.forEach(trip => {
    if (trip.stages && trip.stages.length > 0) {
      trip.stages.forEach((st, sIdx) => {
        const id = `pay_stage_${trip.id}_${sIdx}`;
        const prev = existingMap.get(id);
        const stCost = parseFloat(st.cost) || 0;
        const stPaid = parseFloat(st.paid) || 0;
        const stPending = st.pending !== undefined ? parseFloat(st.pending) : Math.max(0, stCost - stPaid);
        const isPaid = (stPending === 0 && stCost > 0) || (prev && prev.status === 'pagado' && stPending === 0);

        let month = st.paymentMonth || getMonthFromDate(st.dueDate) || getMonthFromDate(trip.startDate) || (prev ? prev.month : "Julio");
        if (!month) month = "Julio";

        synchronizedItems.push({
          id: id,
          tripId: trip.id,
          stageIdx: sIdx,
          name: st.accommodationName || st.name || `Etapa ${sIdx + 1}`,
          accommodationName: st.accommodationName || st.name || `Etapa ${sIdx + 1}`,
          month: month,
          dueDate: st.dueDate || (prev ? prev.dueDate : ""),
          amount: isPaid ? stCost : (stPending > 0 ? stPending : stCost),
          totalCost: stCost,
          pending: stPending,
          paid: stPaid,
          status: isPaid ? "pagado" : "pendiente",
          note: st.platform ? `Plataforma: ${st.platform}` : (prev ? prev.note : ""),
          url: st.url || ""
        });
      });
    } else if (trip.accommodation) {
      const acc = trip.accommodation;
      const id = `pay_trip_${trip.id}`;
      const prev = existingMap.get(id);
      const accCost = parseFloat(acc.totalCost) || 0;
      const tripPaid = getTripTotalPaid(trip);
      const accPending = acc.pendingCost !== undefined ? parseFloat(acc.pendingCost) : Math.max(0, accCost - tripPaid);
      const isPaid = (accPending === 0 && accCost > 0) || (prev && prev.status === 'pagado' && accPending === 0);

      let month = acc.paymentMonth || getMonthFromDate(acc.dueDate) || getMonthFromDate(trip.startDate) || (prev ? prev.month : "Marzo");
      if (!month) month = "Marzo";

      synchronizedItems.push({
        id: id,
        tripId: trip.id,
        name: acc.name || trip.name || 'Alojamiento',
        accommodationName: acc.name || trip.name || 'Alojamiento',
        month: month,
        dueDate: acc.dueDate || (prev ? prev.dueDate : ""),
        amount: isPaid ? accCost : (accPending > 0 ? accPending : accCost),
        totalCost: accCost,
        pending: accPending,
        paid: tripPaid,
        status: isPaid ? "pagado" : "pendiente",
        note: acc.platform ? `Reserva: ${acc.platform}` : (prev ? prev.note : ""),
        url: acc.url || ""
      });
    }
  });

  return synchronizedItems;
}

function recalculateAllTripFinancials(specificTrip = null) {
  const yearData = db.years[currentYear];
  if (!yearData || !yearData.trips) return;

  const trips = specificTrip ? [specificTrip] : yearData.trips;

  // 1. Recalcular cada viaje y sus etapas
  trips.forEach(t => {
    const totalPaid = getTripTotalPaid(t);
    if (t.accommodation) {
      const totalCost = parseFloat(t.accommodation.totalCost) || 0;
      t.accommodation.paidCost = totalPaid;
      t.accommodation.pendingCost = Math.max(0, totalCost - totalPaid);
    }
    if (t.stages && t.stages.length > 0) {
      let remainingPaid = totalPaid;
      t.stages.forEach(st => {
        const stCost = parseFloat(st.cost) || 0;
        const stPaid = Math.min(stCost, remainingPaid);
        st.paid = stPaid;
        st.pending = Math.max(0, stCost - stPaid);
        remainingPaid = Math.max(0, remainingPaid - stPaid);
      });
    }
  });

  // 2. Sincronizar dinámicamente el Calendario de Pagos Pendientes del Año
  if (!yearData.budgetSettings) {
    yearData.budgetSettings = { targetAccommodations: [], categories: {} };
  }
  yearData.budgetSettings.targetAccommodations = syncYearScheduledPayments(yearData);

  // 3. Recalcular todas las partidas presupuestarias globales
  if (!yearData.budgetSettings.categories) {
    yearData.budgetSettings.categories = {
      alojamiento: { budget: 0, paid: 0, pending: 0 },
      gasolinaPeajes: { budget: 350, paid: 0, pending: 350 },
      entradas: { budget: 200, paid: 0, pending: 200 },
      comidaSuper: { budget: 600, paid: 0, pending: 600 },
      otros: { budget: 200, paid: 0, pending: 200 },
      efectivo: { budget: 150, paid: 0, pending: 150 }
    };
  }

  const cats = yearData.budgetSettings.categories;

  // Alojamiento
  let allAccomTotal = 0;
  let allAccomPaid = 0;
  let totalGasolina = 0;
  let totalPeajes = 0;
  let totalSuper = 0;
  let totalRestaurantes = 0;
  let totalEfectivo = 0;
  let totalOtros = 0;
  let totalTicketsCost = 0;
  let totalTicketsPaid = 0;

  yearData.trips.forEach(t => {
    let cost = 0;
    if (t.stages && t.stages.length > 0) {
      t.stages.forEach(s => { cost += (parseFloat(s.cost) || 0); });
    } else if (t.accommodation) {
      cost = (parseFloat(t.accommodation.totalCost) || 0);
    }
    const paid = getTripTotalPaid(t);
    allAccomTotal += cost;
    allAccomPaid += paid;

    // Gastos en ruta
    if (t.expenses && Array.isArray(t.expenses)) {
      t.expenses.forEach(exp => {
        const amt = parseFloat(exp.amount) || 0;
        const cat = (exp.category || "").toLowerCase();
        if (cat.includes("gasolina")) totalGasolina += amt;
        else if (cat.includes("peaje")) totalPeajes += amt;
        else if (cat.includes("compra") || cat.includes("super")) totalSuper += amt;
        else if (cat.includes("restaurante") || cat.includes("bar")) totalRestaurantes += amt;
        else if (cat.includes("efectivo")) totalEfectivo += amt;
        else totalOtros += amt;
      });
    }

    // Entradas
    if (t.tickets && Array.isArray(t.tickets)) {
      t.tickets.forEach(tk => {
        const tkCost = (parseFloat(tk.cost) || 0);
        totalTicketsCost += tkCost;
        if (tk.status === "Comprada" || tk.status === "pagado") {
          totalTicketsPaid += tkCost;
        }
      });
    }
  });

  if (!cats.alojamiento) cats.alojamiento = { budget: 0, paid: 0, pending: 0 };
  cats.alojamiento.budget = Math.max(cats.alojamiento.budget || 0, allAccomTotal);
  cats.alojamiento.paid = allAccomPaid;
  cats.alojamiento.pending = Math.max(0, allAccomTotal - allAccomPaid);

  if (!cats.gasolinaPeajes) cats.gasolinaPeajes = { budget: 350, paid: 0, pending: 350 };
  const gasTotalPaid = totalGasolina + totalPeajes;
  cats.gasolinaPeajes.paid = gasTotalPaid;
  cats.gasolinaPeajes.budget = Math.max(cats.gasolinaPeajes.budget || 350, gasTotalPaid);
  cats.gasolinaPeajes.pending = Math.max(0, cats.gasolinaPeajes.budget - gasTotalPaid);

  if (!cats.entradas) cats.entradas = { budget: 200, paid: 0, pending: 200 };
  cats.entradas.paid = totalTicketsPaid;
  cats.entradas.budget = Math.max(cats.entradas.budget || 200, totalTicketsCost);
  cats.entradas.pending = Math.max(0, cats.entradas.budget - totalTicketsPaid);

  if (!cats.comidaSuper) cats.comidaSuper = { budget: 600, paid: 0, pending: 600 };
  const foodTotalPaid = totalSuper + totalRestaurantes;
  cats.comidaSuper.paid = foodTotalPaid;
  cats.comidaSuper.budget = Math.max(cats.comidaSuper.budget || 600, foodTotalPaid);
  cats.comidaSuper.pending = Math.max(0, cats.comidaSuper.budget - foodTotalPaid);

  if (!cats.efectivo) cats.efectivo = { budget: 150, paid: 0, pending: 150 };
  cats.efectivo.paid = totalEfectivo;
  cats.efectivo.budget = Math.max(cats.efectivo.budget || 150, totalEfectivo);
  cats.efectivo.pending = Math.max(0, cats.efectivo.budget - totalEfectivo);

  if (!cats.otros) cats.otros = { budget: 200, paid: 0, pending: 200 };
  cats.otros.paid = totalOtros;
  cats.otros.budget = Math.max(cats.otros.budget || 200, totalOtros);
  cats.otros.pending = Math.max(0, cats.otros.budget - totalOtros);
}

function renderStats() {
  const yearData = db.years[currentYear] || { trips: [] };
  const trips = yearData.trips || [];

  let totalNights = 0;
  let totalCost = 0;
  let totalPending = 0;
  let totalPaid = 0;

  trips.forEach(t => {
    let tripCost = 0;
    if (t.stages && t.stages.length > 0) {
      t.stages.forEach(st => {
        totalNights += (st.nights || 0);
        tripCost += (st.cost || 0);
      });
    } else if (t.accommodation) {
      totalNights += (t.accommodation.nights || 0);
      tripCost = (t.accommodation.totalCost || 0);
    }
    totalCost += tripCost;
    const paidAmt = getTripTotalPaid(t);
    totalPaid += paidAmt;
    totalPending += Math.max(0, tripCost - paidAmt);
  });

  const avgPerNight = totalNights > 0 ? (totalCost / totalNights).toFixed(2) : "0.00";

  const elTrips = document.getElementById("statTotalTrips");
  if (elTrips) elTrips.textContent = trips.length;
  const elNights = document.getElementById("statTotalNights");
  if (elNights) elNights.textContent = totalNights;
  const elCost = document.getElementById("statTotalCost");
  if (elCost) elCost.textContent = formatCurrency(totalCost);
  const elAvg = document.getElementById("statAvgPerNight");
  if (elAvg) elAvg.textContent = `Media: ${avgPerNight} € / noche`;
  const elPending = document.getElementById("statPendingCost");
  if (elPending) elPending.textContent = formatCurrency(totalPending);
  const elPaid = document.getElementById("statPaidCost");
  if (elPaid) elPaid.textContent = `Abonado: ${formatCurrency(totalPaid)}`;

  // Actualizar también las tarjetas macro-financieras de Control de Gastos (Fila 1)
  const elExpTrips = document.getElementById("statExpTotalTrips");
  if (elExpTrips) elExpTrips.textContent = trips.length;
  const elExpNights = document.getElementById("statExpTotalNights");
  if (elExpNights) elExpNights.textContent = totalNights;
  const elExpCost = document.getElementById("statExpTotalCost");
  if (elExpCost) elExpCost.textContent = formatCurrency(totalCost);
  const elExpAvg = document.getElementById("statExpAvgPerNight");
  if (elExpAvg) elExpAvg.textContent = `Media: ${avgPerNight} € / noche`;
  const elExpPending = document.getElementById("statExpPendingCost");
  if (elExpPending) elExpPending.textContent = formatCurrency(totalPending);
  const elExpPaid = document.getElementById("statExpPaidCost");
  if (elExpPaid) elExpPaid.textContent = `Abonado: ${formatCurrency(totalPaid)}`;
}

// ------------------------------------------------------------
// UTILIDADES DE FECHAS Y ORDENACIÓN AUTOMÁTICA
// ------------------------------------------------------------
function getTripDateRange(trip) {
  let start = trip.startDate || "";
  let end = trip.endDate || "";

  if (!start && trip.days && trip.days.length > 0) {
    const validDates = trip.days.map(d => d.date).filter(Boolean).sort();
    if (validDates.length > 0) {
      start = validDates[0];
      end = validDates[validDates.length - 1];
    }
  }

  if (!start && trip.stages && trip.stages.length > 0) {
    trip.stages.forEach(s => {
      if (s.startDate && (!start || s.startDate < start)) start = s.startDate;
      if (s.endDate && (!end || s.endDate > end)) end = s.endDate;
    });
  }

  // Fallback si no tiene fecha
  if (!start) start = `${currentYear}-12-31`;
  if (!end) end = start;

  return { start, end };
}

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const WEEKDAYS_MAP = ["D", "L", "M", "X", "J", "V", "S"];

function formatDateIso(d) {
  if (!d || isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDaysDifference(dateStr1, dateStr2) {
  try {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffTime = d1 - d2;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch(e) {
    return 0;
  }
}

// ------------------------------------------------------------
// PESTAÑA: VISTA GENERAL (ORDENACIÓN AUTOMÁTICA POR FECHA)
// ------------------------------------------------------------
function renderOverviewTab() {
  const container = document.getElementById("overviewTripsList");
  const yearData = db.years[currentYear] || { trips: [] };
  const rawTrips = yearData.trips || [];

  // Actualizar títulos y botones con el año activo siempre al inicio
  const btnYear = document.getElementById("overviewBtnYear");
  if (btnYear) btnYear.textContent = currentYear;
  const btnTripsYear = document.getElementById("overviewBtnTripsYear");
  if (btnTripsYear) btnTripsYear.textContent = currentYear;
  const titleTripsYear = document.getElementById("overviewTripsTitleYear");
  if (titleTripsYear) titleTripsYear.textContent = currentYear;

  const titleScheduleEl = document.getElementById("overviewTripsScheduleTitle");
  if (titleScheduleEl) {
    titleScheduleEl.innerHTML = `📌 Viajes y propuestas para el año <span id="overviewTripsTitleYear">${currentYear}</span>`;
  }
  const btnTripsEl = document.getElementById("btnOverviewShowTrips");
  if (btnTripsEl) {
    btnTripsEl.innerHTML = `📌 Viajes y propuestas para el año <span id="overviewBtnTripsYear">${currentYear}</span>`;
  }

  switchOverviewView(currentOverviewView);
  renderOverviewPayments();

  if (rawTrips.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px;">
        <p style="color: #64748b; font-size: 1rem; margin-bottom: 1rem;">No hay viajes registrados para el año ${currentYear}.</p>
        <button class="btn btn-primary" onclick="openTripModal()">+ Añadir tu primer viaje</button>
      </div>
    `;
    return;
  }

  const todayStr = getTodayString();

  // Enriquecer cada viaje con sus fechas calculadas y estado respecto a hoy
  const enrichedTrips = rawTrips.map(trip => {
    const { start, end } = getTripDateRange(trip);
    // Un viaje ha pasado si su fecha de fin ya expiró
    const isPast = end < todayStr;
    const isOngoing = start <= todayStr && todayStr <= end;
    const daysUntilStart = getDaysDifference(start, todayStr);
    const daysSinceEnd = getDaysDifference(todayStr, end);
    return {
      trip,
      start,
      end,
      isPast,
      isOngoing,
      daysUntilStart,
      daysSinceEnd
    };
  });

  // Ordenar automáticamente:
  // 1. Primero los viajes próximos y en curso (ordenados cronológicamente por fecha de inicio)
  // 2. Al final, los viajes concluidos que ya han pasado su fecha (ordenados cronológicamente)
  const upcomingOrCurrent = enrichedTrips.filter(t => !t.isPast)
    .sort((a, b) => a.start.localeCompare(b.start));

  const pastTrips = enrichedTrips.filter(t => t.isPast)
    .sort((a, b) => a.start.localeCompare(b.start));

  const sortedTrips = [...upcomingOrCurrent, ...pastTrips];

  const hasFeatured = sortedTrips.some((t, idx) => t.isOngoing || (!t.isPast && idx === 0));
  container.classList.toggle("has-featured", hasFeatured && sortedTrips.length >= 3);

  container.innerHTML = sortedTrips.map((item, idx) => {
    const { trip, start, end, isPast, isOngoing, daysUntilStart, daysSinceEnd } = item;
    const isNextTrip = (!isPast && idx === 0);
    const isEnlarged = (isOngoing || isNextTrip);

    let nights = 0;
    let cost = 0;
    let pending = 0;
    let paid = 0;

    if (trip.stages && trip.stages.length > 0) {
      trip.stages.forEach(s => {
        nights += (s.nights || 0);
        cost += (s.cost || 0);
      });
    } else if (trip.accommodation) {
      nights = trip.accommodation.nights || 0;
      cost = trip.accommodation.totalCost || 0;
    }
    paid = getTripTotalPaid(trip);
    pending = Math.max(0, cost - paid);

    const badgeColor = trip.badgeColor || 'blue';
    const percentPaid = cost > 0 ? Math.min(100, Math.round((paid / cost) * 100)) : 100;

    if (isEnlarged) {
      // ============================================================
      // TARJETA DESTACADA Y AGRANDADA: PRÓXIMO VIAJE O EN CURSO ACTUAL
      // ============================================================
      let timingBadge = isOngoing
        ? `<span class="badge" style="background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; font-weight: 800; font-size: 0.825rem; padding: 0.3rem 0.65rem;">🟢 ¡EN CURSO AHORA!</span>`
        : `<span class="badge" style="background: #ede9fe; color: #4338ca; border: 1.5px solid #c7d2fe; font-weight: 800; font-size: 0.825rem; padding: 0.3rem 0.65rem;">⭐ PRÓXIMO VIAJE</span>`;

      let countdownBadge = "";
      if (isOngoing) {
        countdownBadge = `<span style="background: #dcfce7; color: #15803d; font-weight: 700; font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">• En viaje hoy</span>`;
      } else if (daysUntilStart > 0) {
        countdownBadge = `<span style="background: #e0e7ff; color: #3730a3; font-weight: 700; font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">⏳ Comienza en ${daysUntilStart} día${daysUntilStart === 1 ? '' : 's'}</span>`;
      }

      return `
        <div class="card trip-card-hero trip-card-theme-${badgeColor} ${isOngoing ? 'is-ongoing' : ''}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.65rem; gap: 0.5rem; flex-wrap: wrap;">
              <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-${badgeColor}" style="font-size: 0.8rem; padding: 0.25rem 0.65rem;">${trip.category || 'Viaje'}</span>
                ${timingBadge}
              </div>
            </div>

            <h4 style="font-size: 1.3rem; font-weight: 800; color: #0f172a; margin-bottom: 0.35rem; line-height: 1.3;">
              📍 ${escapeHtml(trip.name)}
            </h4>

            <div style="font-size: 0.85rem; color: #4b5563; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span>📅 <strong>${formatDateSpanish(start)}</strong> al <strong>${formatDateSpanish(end)}</strong></span>
              ${countdownBadge}
            </div>

            <div style="background: #ffffff; padding: 0.85rem 1rem; border-radius: 12px; margin-bottom: 0.85rem; font-size: 0.875rem; border: 1.5px solid #e0e7ff; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                <span style="color: #64748b; font-weight: 500;">Ruta prevista:</span>
                <strong style="color: #1e1b4b; text-align: right;">${escapeHtml(trip.origin || 'Castellón')} ➔ ${escapeHtml(trip.destination || 'Destino')}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                <span style="color: #64748b; font-weight: 500;">Estancia:</span>
                <strong style="color: #0f172a;">${nights} noches confirmadas</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 0.4rem;">
                <span style="color: #64748b; font-weight: 600;">Coste Alojamiento:</span>
                <strong style="color: #047857; font-size: 1.2rem; font-weight: 800;">${formatCurrency(cost)}</strong>
              </div>
            </div>

            <!-- Barra de progreso de pago destacada -->
            <div style="margin-bottom: 1rem; background: #ffffff; padding: 0.65rem 0.85rem; border-radius: 10px; border: 1px solid #f1f5f9;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 0.35rem;">
                <span>Abonado: <strong style="color: #059669;">${formatCurrency(paid)}</strong> (${percentPaid}%)</span>
                <span>Pendiente: <strong style="color: ${pending > 0 ? '#d97706' : '#059669'};">${formatCurrency(pending)}</strong></span>
              </div>
              <div class="progress-bar-bg" style="height: 9px;">
                <div class="progress-bar-fill" style="width: ${percentPaid}%; background: linear-gradient(90deg, #10b981, #059669);"></div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.45rem; margin-top: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary" style="flex: 1.2; font-weight: 700; padding: 0.55rem 0.85rem;" onclick="selectTripAndGoTab('${trip.id}', 'tab-itineraries')">
              🗺️ Ver Itinerario
            </button>
            <button class="btn btn-secondary" style="flex: 1; font-weight: 600; padding: 0.55rem 0.75rem;" onclick="selectTripAndGoTab('${trip.id}', 'tab-meals')">
              🍲 Menús
            </button>
            <button class="btn btn-secondary" style="color: #e11d48; border-color: #fecdd3; padding: 0.55rem 0.75rem;" onclick="promptDeleteTrip('${trip.id}')" title="Eliminar este viaje">
              🗑️
            </button>
          </div>
        </div>
      `;
    }

    // ============================================================
    // TARJETAS COMPACTAS (MÁS PEQUEÑAS): PROPUESTAS SECUNDARIAS
    // ============================================================
    let timingBadge = isPast
      ? `<span class="badge badge-gray" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">✓ Pasado</span>`
      : "";

    let countdownText = "";
    if (!isPast && daysUntilStart > 0) {
      countdownText = `<span style="color: #64748b; font-size: 0.72rem;">• En ${daysUntilStart} días</span>`;
    } else if (isPast && daysSinceEnd >= 0) {
      countdownText = `<span style="color: #94a3b8; font-size: 0.72rem;">• Pasó hace ${daysSinceEnd}d</span>`;
    }

    return `
      <div class="card trip-card-compact trip-card-theme-${badgeColor} ${isPast ? 'is-past' : ''}">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem; gap: 0.3rem; flex-wrap: wrap;">
            <div style="display: flex; gap: 0.25rem; align-items: center; flex-wrap: wrap;">
              <span class="badge badge-${badgeColor}" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">${trip.category || 'Viaje'}</span>
              ${timingBadge}
            </div>
          </div>

          <h4 style="font-size: 0.98rem; font-weight: 700; color: #1e293b; margin-bottom: 0.2rem; line-height: 1.25;">
            ${escapeHtml(trip.name)}
          </h4>

          <p style="font-size: 0.73rem; color: #64748b; margin-bottom: 0.45rem; display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap;">
            <span>📅 ${formatDateSpanish(start)} al ${formatDateSpanish(end)}</span>
            ${countdownText}
          </p>

          <div style="background: #f8fafc; padding: 0.45rem 0.65rem; border-radius: 8px; margin-bottom: 0.45rem; font-size: 0.775rem; border: 1px solid #e2e8f0; line-height: 1.35;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
              <span style="color: #64748b;">Ruta:</span>
              <strong style="color: #334155; text-align: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(trip.origin || 'Castellón')} ➔ ${escapeHtml(trip.destination || 'Destino')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
              <span style="color: #64748b;">Noches:</span>
              <strong>${nights} noches</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Alojamiento:</span>
              <strong style="color: #059669;">${formatCurrency(cost)}</strong>
            </div>
          </div>

          <!-- Barra de progreso de pago compacta -->
          <div style="margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #64748b; margin-bottom: 0.2rem;">
              <span>Abonado: ${formatCurrency(paid)} (${percentPaid}%)</span>
              <span>Pendiente: ${formatCurrency(pending)}</span>
            </div>
            <div class="progress-bar-bg" style="height: 5px;">
              <div class="progress-bar-fill" style="width: ${percentPaid}%;"></div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.3rem; margin-top: 0.35rem; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" style="flex: 1; padding: 0.3rem 0.5rem; font-size: 0.775rem;" onclick="selectTripAndGoTab('${trip.id}', 'tab-itineraries')">
            🗺️ Itinerario
          </button>
          <button class="btn btn-secondary btn-sm" style="flex: 1; padding: 0.3rem 0.5rem; font-size: 0.775rem;" onclick="selectTripAndGoTab('${trip.id}', 'tab-meals')">
            🍲 Menús
          </button>
          <button class="btn btn-secondary btn-sm" style="color: #e11d48; border-color: #fecdd3; padding: 0.3rem 0.5rem; font-size: 0.775rem;" onclick="promptDeleteTrip('${trip.id}')" title="Eliminar este viaje">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join("");
}

let currentOverviewView = 'trips';

function switchOverviewView(view) {
  currentOverviewView = view;
  const sectionTrips = document.getElementById("overviewSectionTrips");
  const sectionPayments = document.getElementById("overviewSectionPayments");
  const btnTrips = document.getElementById("btnOverviewShowTrips");
  const btnPayments = document.getElementById("btnOverviewShowPayments");

  if (view === 'payments') {
    switchTab('tab-budget');
    switchBudgetView('yearPayments');
    return;
  }

  if (sectionTrips) sectionTrips.style.display = 'block';
  if (sectionPayments) sectionPayments.style.display = 'none';
  if (btnTrips) {
    btnTrips.className = 'btn btn-primary';
  }
  if (btnPayments) {
    btnPayments.className = 'btn btn-secondary';
  }
}

function renderOverviewPayments() {
  const container = document.getElementById("overviewPaymentsSchedule");
  const titleEl = document.getElementById("overviewPaymentsScheduleTitle");
  if (titleEl) {
    titleEl.textContent = `🗓️ Calendario de pagos PENDIENTE del año ${currentYear}`;
  }
  const btnYear = document.getElementById("overviewBtnYear");
  if (btnYear) {
    btnYear.textContent = currentYear;
  }
  const btnBudgetYearPayments = document.getElementById("budgetBtnOverviewPaymentsYear");
  if (btnBudgetYearPayments) {
    btnBudgetYearPayments.textContent = currentYear;
  }
  const budgetTitleSpan = document.getElementById("budgetOverviewPaymentsTitleYear");
  if (budgetTitleSpan) {
    budgetTitleSpan.textContent = currentYear;
  }
  const yearData = db.years[currentYear];
  const items = (yearData && yearData.budgetSettings && yearData.budgetSettings.targetAccommodations) || [];

  if (items.length === 0) {
    container.innerHTML = `<p style="color: #64748b; font-size: 0.875rem;">No hay pagos programados configurados para este año.</p>`;
    return;
  }

  const monthOrderMap = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
    "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
  };

  function getPaymentSortKey(it) {
    if (it.dueDate && it.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return it.dueDate;
    }
    const m = (it.month || "").toLowerCase().trim();
    const mNum = String(monthOrderMap[m] || 12).padStart(2, '0');
    let dNum = "15";
    if (it.dueDate) {
      const match = it.dueDate.match(/(\d{1,2})/);
      if (match) dNum = match[1].padStart(2, '0');
    }
    return `${currentYear}-${mNum}-${dNum}`;
  }

  function cleanAccommodationName(item) {
    if (item.accommodationName) return item.accommodationName;
    let name = item.name || "Alojamiento";
    name = name.replace(/\s*\([^)]*\)/g, "").trim();
    return name || item.name;
  }

  // Ordenar cronológicamente
  const sortedItems = [...items].sort((a, b) => getPaymentSortKey(a).localeCompare(getPaymentSortKey(b)));

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
      ${sortedItems.map((item, idx) => {
        const isPaid = item.status === 'pagado';
        const dueText = formatDueDateDayMonth(item.dueDate, item.month);
        const accomName = cleanAccommodationName(item);
        return `
          <div style="background: ${isPaid ? '#ecfdf5' : '#fffbeb'}; border: 1.5px solid ${isPaid ? '#a7f3d0' : '#fde68a'}; border-radius: 10px; padding: 1rem; position: relative; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem; gap: 0.4rem; flex-wrap: wrap;">
                <span class="badge ${isPaid ? 'badge-emerald' : 'badge-amber'}">${item.month || 'Mes'}</span>
                ${dueText ? `<span style="font-size: 0.75rem; color: #dc2626; font-weight: 600;">📅 Vence: ${dueText}</span>` : ''}
              </div>
              <h5 style="font-size: 0.98rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">${escapeHtml(accomName)}</h5>
              ${item.url ? `
                <div style="margin-bottom: 0.35rem;">
                  <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-size: 0.775rem; text-decoration: underline; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">
                    🌐 Web alojamiento ↗
                  </a>
                </div>
              ` : ''}
            </div>

            <div style="margin-top: 0.75rem; border-top: 1px dashed ${isPaid ? '#a7f3d0' : '#fde68a'}; padding-top: 0.6rem;">
              <div style="font-size: 0.72rem; color: #64748b;">${isPaid ? 'Total Abonado:' : 'Pendiente:'}</div>
              <div style="font-size: 1.2rem; font-weight: 800; color: ${isPaid ? '#065f46' : '#92400e'};">
                ${formatCurrency(item.amount)}
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function toggleTargetPaymentStatus(idOrIdx) {
  const yearData = db.years[currentYear];
  if (!yearData || !yearData.budgetSettings || !yearData.budgetSettings.targetAccommodations) return;
  const items = yearData.budgetSettings.targetAccommodations;
  
  let item = null;
  if (typeof idOrIdx === "number") {
    item = items[idOrIdx];
  } else {
    item = items.find(it => it.id === idOrIdx) || items[parseInt(idOrIdx)];
  }
  if (!item) return;

  const willBePaid = item.status !== 'pagado';
  item.status = willBePaid ? 'pagado' : 'pendiente';

  // Sincronizar con los anticipos del viaje correspondiente
  if (item.tripId) {
    const trip = yearData.trips.find(t => t.id === item.tripId);
    if (trip) {
      if (!trip.advances) trip.advances = [];

      if (willBePaid) {
        const pendingToPay = item.pending > 0 ? item.pending : item.amount;
        if (pendingToPay > 0) {
          trip.advances.push({
            id: `adv_auto_${item.id || Date.now()}`,
            concept: `Abono compromiso: ${item.name}`,
            date: item.dueDate || getTodayString(),
            amount: pendingToPay,
            method: "Tarjeta",
            notes: "Marcado desde Calendario de Pagos Pendientes"
          });
        }
      } else {
        const autoIdx = trip.advances.findIndex(a => a.id === `adv_auto_${item.id}` || a.concept.includes(item.name));
        if (autoIdx >= 0) {
          trip.advances.splice(autoIdx, 1);
        }
      }
    }
  }

  saveDatabase(db);
  recalculateAllTripFinancials();
  renderStats();
  renderOverviewPayments();
  renderOverviewTab();
  renderBudgetTab();
  renderItineraryTab();
  renderExpensesTab();
  showToast(`Estado de pago para "${item.name}" actualizado a ${willBePaid ? 'Pagado' : 'Pendiente'}`, "success");
}

function selectTripAndGoTab(tripId, tabName) {
  currentTripId = tripId;
  renderTripPills();
  renderItineraryTab();
  renderMealsTab();
  renderTicketsTab();
  renderExpensesTab();
  switchTab(tabName);
}

// ------------------------------------------------------------
// PESTAÑA: ITINERARIOS Y ALOJAMIENTOS
// ------------------------------------------------------------
function getCurrentTrip() {
  const yearData = db.years[currentYear];
  if (!yearData || !yearData.trips) return null;
  return yearData.trips.find(t => t.id === currentTripId) || yearData.trips[0] || null;
}

function renderTripPills() {
  const container = document.getElementById("tripPillsContainer");
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];

  if (trips.length === 0) {
    container.innerHTML = `<span style="font-size: 0.85rem; color: #94a3b8;">Sin viajes</span>`;
    return;
  }

  const todayStr = getTodayString();
  const sorted = [...trips].sort((a, b) => {
    const rA = getTripDateRange(a);
    const rB = getTripDateRange(b);
    const aPast = rA.end < todayStr;
    const bPast = rB.end < todayStr;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return rA.start.localeCompare(rB.start);
  });

  const colorIcons = {
    emerald: '🟢',
    amber: '🟡',
    indigo: '🟣',
    blue: '🔵',
    rose: '🔴',
    purple: '🟣'
  };

  container.innerHTML = sorted.map((t, idx) => {
    const color = t.badgeColor || 'indigo';
    const isActive = (t.id === currentTripId);
    const icon = colorIcons[color] || '🚗';

    const range = getTripDateRange(t);
    const isPast = range.end < todayStr;
    const isOngoing = (range.start <= todayStr && todayStr <= range.end);
    const isNextTrip = (!isPast && idx === 0);
    const isHero = (isOngoing || isNextTrip);

    const timingBadge = isOngoing 
      ? `<span class="pill-badge pill-badge-ongoing">🟢 En curso</span>`
      : (isNextTrip ? `<span class="pill-badge pill-badge-next">⭐ Próximo</span>` : '');

    const sizeClass = isHero ? 'trip-pill-hero' : 'trip-pill-compact';
    const pastClass = isPast ? 'is-past' : '';

    return `
      <button class="trip-pill trip-pill-${color} ${sizeClass} ${pastClass} ${isActive ? 'active' : ''}" onclick="changeActiveTrip('${t.id}')" title="Consultar ${escapeHtml(t.name)}">
        <span class="pill-icon">${icon}</span>
        <strong class="pill-title">${escapeHtml(t.name)}</strong>
        ${timingBadge}
      </button>
    `;
  }).join("");
}

function changeActiveTrip(tripId) {
  currentTripId = tripId;
  updateItineraryDistancesDynamically();
  renderTripPills();
  renderItineraryTab();
  renderMealsTab();
  renderTicketsTab();
  renderExpensesTab();
}

const STAGE_COLOR_PALETTES = [
  {
    border: '#6366f1',
    bgTint: 'rgba(238, 242, 255, 0.55)',
    badgeBg: '#e0e7ff',
    badgeText: '#3730a3',
    badgeBorder: '#c7d2fe',
    nameColor: '#4338ca',
    icon: '🟣'
  },
  {
    border: '#10b981',
    bgTint: 'rgba(236, 253, 245, 0.55)',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    badgeBorder: '#a7f3d0',
    nameColor: '#047857',
    icon: '🟢'
  },
  {
    border: '#f59e0b',
    bgTint: 'rgba(254, 243, 199, 0.50)',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    badgeBorder: '#fde68a',
    nameColor: '#b45309',
    icon: '🟡'
  },
  {
    border: '#f43f5e',
    bgTint: 'rgba(255, 241, 242, 0.55)',
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
    badgeBorder: '#fecdd3',
    nameColor: '#be123c',
    icon: '🔴'
  },
  {
    border: '#06b6d4',
    bgTint: 'rgba(236, 254, 255, 0.55)',
    badgeBg: '#cffafe',
    badgeText: '#155e75',
    badgeBorder: '#a5f3fc',
    nameColor: '#0e7490',
    icon: '🔵'
  }
];

// ============================================================
// MOTOR DE RUTAS, DISTANCIAS Y TIEMPOS GOOGLE MAPS
// ============================================================
const ROUTE_CACHE_GOOGLE_MAPS = {
  // Rutas principales desde Castellón
  "Castellón|Bilbao": { distanceKm: 510, durationMin: 315 },
  "Bilbao|Castellón": { distanceKm: 510, durationMin: 315 },
  "Castellón|San Sebastián": { distanceKm: 560, durationMin: 345 },
  "San Sebastián|Castellón": { distanceKm: 560, durationMin: 345 },

  // Semana Santa (País Vasco)
  "Castellón|Galdakao": { distanceKm: 580, durationMin: 345 },
  "Galdakao|Castellón": { distanceKm: 580, durationMin: 345 },
  "Galdakao|Bilbao": { distanceKm: 11, durationMin: 15 },
  "Bilbao|Galdakao": { distanceKm: 11, durationMin: 15 },
  "Galdakao|San Juan de Gaztelugatxe": { distanceKm: 38, durationMin: 45 },
  "San Juan de Gaztelugatxe|Galdakao": { distanceKm: 38, durationMin: 45 },
  "Galdakao|Bermeo": { distanceKm: 36, durationMin: 40 },
  "Bermeo|Galdakao": { distanceKm: 36, durationMin: 40 },
  "Galdakao|San Sebastián": { distanceKm: 95, durationMin: 70 },
  "San Sebastián|Galdakao": { distanceKm: 95, durationMin: 70 },
  "Galdakao|Guernica": { distanceKm: 26, durationMin: 30 },
  "Guernica|Galdakao": { distanceKm: 26, durationMin: 30 },
  "Galdakao|Guernica (Gernika)": { distanceKm: 26, durationMin: 30 },
  "Galdakao|Reserva de Urdaibai": { distanceKm: 32, durationMin: 35 },
  "Galdakao|Vitoria-Gasteiz": { distanceKm: 64, durationMin: 55 },
  "Vitoria-Gasteiz|Galdakao": { distanceKm: 64, durationMin: 55 },
  "Galdakao|Valle Salado de Añana": { distanceKm: 78, durationMin: 65 },
  "Galdakao|Getxo": { distanceKm: 22, durationMin: 25 },
  "Getxo|Galdakao": { distanceKm: 22, durationMin: 25 },
  "Galdakao|Getxo (Puente Colgante)": { distanceKm: 22, durationMin: 25 },
  "Galdakao|Galdakao (Alrededores / Visita local)": { distanceKm: 8, durationMin: 12 },

  // Verano 2027: Bonterra
  "Castellón|Benicàssim": { distanceKm: 15, durationMin: 20 },
  "Benicàssim|Castellón": { distanceKm: 15, durationMin: 20 },
  "Benicàssim|Benicàssim (Playa / Actividades)": { distanceKm: 4, durationMin: 8 },
  "Benicàssim|Vía Verde Benicàssim": { distanceKm: 5, durationMin: 10 },
  "Benicàssim|Aquarama Benicàssim": { distanceKm: 3, durationMin: 7 },

  // Verano 2027: Ruta Norte Itinerante
  "Castellón|Viana": { distanceKm: 420, durationMin: 270 },
  "Viana|Castellón": { distanceKm: 420, durationMin: 270 },
  "Viana|Logroño": { distanceKm: 10, durationMin: 15 },
  "Logroño|Viana": { distanceKm: 10, durationMin: 15 },
  "Viana|Logroño (Calle Laurel)": { distanceKm: 10, durationMin: 15 },
  "Viana|Laguardia": { distanceKm: 25, durationMin: 30 },
  "Laguardia|Viana": { distanceKm: 25, durationMin: 30 },
  "Viana|Laguardia (Rioja Alavesa)": { distanceKm: 25, durationMin: 30 },
  "Viana|Potes": { distanceKm: 250, durationMin: 200 },
  "Potes|Viana": { distanceKm: 250, durationMin: 200 },
  "Potes|Monasterio Santo Toribio de Liébana": { distanceKm: 3, durationMin: 8 },
  "Potes|Santo Toribio de Liébana": { distanceKm: 3, durationMin: 8 },
  "Potes|Teleférico de Fuente Dé": { distanceKm: 23, durationMin: 28 },
  "Potes|Fuente Dé": { distanceKm: 23, durationMin: 28 },
  "Potes|Mogrovejo": { distanceKm: 11, durationMin: 18 },
  "Potes|Desfiladero de La Hermida": { distanceKm: 16, durationMin: 22 },
  "Potes|Picos de Europa": { distanceKm: 18, durationMin: 26 },
  "Potes|Potes (Alrededores / Valle de Liébana)": { distanceKm: 6, durationMin: 10 },
  "Potes|León": { distanceKm: 130, durationMin: 130 },
  "León|Potes": { distanceKm: 130, durationMin: 130 },
  "León|Catedral de León": { distanceKm: 3, durationMin: 8 },
  "León|San Isidoro de León": { distanceKm: 2, durationMin: 6 },
  "León|Las Médulas / Ponferrada": { distanceKm: 145, durationMin: 100 },
  "León|Ponferrada": { distanceKm: 115, durationMin: 75 },
  "León|Astorga": { distanceKm: 52, durationMin: 40 },
  "León|Cueva de Valporquero": { distanceKm: 47, durationMin: 50 },
  "León|León (Paseo del Bernesga y relax)": { distanceKm: 4, durationMin: 8 },
  "León|Castellón": { distanceKm: 650, durationMin: 390 }
};

const KNOWN_LOCATIONS_COORDS = {
  "castellón": [39.9864, -0.0513],
  "castellon": [39.9864, -0.0513],
  "castellón de la plana": [39.9864, -0.0513],
  "galdakao": [43.2307, -2.8427],
  "bilbao": [43.2630, -2.9350],
  "san juan de gaztelugatxe": [43.4475, -2.7850],
  "gaztelugatxe": [43.4475, -2.7850],
  "bermeo": [43.4206, -2.7214],
  "mundaka": [43.4072, -2.6983],
  "san sebastián": [43.3183, -1.9812],
  "san sebastian": [43.3183, -1.9812],
  "donostia": [43.3183, -1.9812],
  "guernica": [43.3156, -2.6797],
  "gernika": [43.3156, -2.6797],
  "urdaibai": [43.3500, -2.6833],
  "vitoria": [42.8467, -2.6716],
  "vitoria-gasteiz": [42.8467, -2.6716],
  "getxo": [43.3567, -3.0117],
  "zarautz": [43.2844, -2.1706],
  "getaria": [43.3039, -2.2047],
  "hondarribia": [43.3639, -1.7917],
  "benicàssim": [40.0544, 0.0637],
  "benicassim": [40.0544, 0.0637],
  "oropesa": [40.0925, 0.1342],
  "peñíscola": [40.3581, 0.4069],
  "viana": [42.5161, -2.3719],
  "logroño": [42.4627, -2.4449],
  "logrono": [42.4627, -2.4449],
  "laguardia": [42.5539, -2.5847],
  "haro": [42.5764, -2.8475],
  "potes": [43.1539, -4.6236],
  "fuente dé": [43.1444, -4.8117],
  "fuente de": [43.1444, -4.8117],
  "mogrovejo": [43.1481, -4.7103],
  "león": [42.5987, -5.5671],
  "leon": [42.5987, -5.5671],
  "astorga": [42.4578, -6.0569],
  "ponferrada": [42.5466, -6.5909],
  "valporquero": [42.9069, -5.5583],
  "madrid": [40.4168, -3.7038],
  "barcelona": [41.3851, 2.1734],
  "valencia": [39.4699, -0.3763],
  "sevilla": [37.3891, -5.9845],
  "zaragoza": [41.6488, -0.8891],
  "málaga": [36.7213, -4.4214],
  "malaga": [36.7213, -4.4214],
  "murcia": [37.9922, -1.1307],
  "alicante": [38.3452, -0.4810],
  "córdoba": [37.8882, -4.7794],
  "cordoba": [37.8882, -4.7794],
  "valladolid": [41.6523, -4.7245],
  "vigo": [42.2406, -8.7207],
  "gijón": [43.5322, -5.6611],
  "gijon": [43.5322, -5.6611],
  "a coruña": [43.3623, -8.4115],
  "la coruña": [43.3623, -8.4115],
  "coruña": [43.3623, -8.4115],
  "granada": [37.1773, -3.5986],
  "oviedo": [43.3619, -5.8494],
  "santander": [43.4623, -3.8099],
  "pamplona": [42.8125, -1.6458],
  "almería": [36.8381, -2.4597],
  "almeria": [36.8381, -2.4597],
  "burgos": [42.3440, -3.6969],
  "salamanca": [40.9701, -5.6635],
  "albacete": [38.9943, -1.8585],
  "huelva": [37.2614, -6.9447],
  "tarragona": [41.1189, 1.2445],
  "lleida": [41.6176, 0.6200],
  "cádiz": [36.5271, -6.2886],
  "cadiz": [36.5271, -6.2886],
  "jaén": [37.7796, -3.7849],
  "jaen": [37.7796, -3.7849],
  "ourense": [42.3358, -7.8639],
  "ourense": [42.3358, -7.8639],
  "girona": [41.9794, 2.8214],
  "lugo": [43.0097, -7.5568],
  "santiago de compostela": [42.8782, -8.5448],
  "cáceres": [39.4753, -6.3724],
  "caceres": [39.4753, -6.3724],
  "toledo": [39.8628, -4.0273],
  "guadalajara": [40.6337, -3.1674],
  "pontevedra": [42.4310, -8.6444],
  "palencia": [42.0095, -4.5288],
  "ciudad real": [38.9863, -3.9273],
  "zamora": [41.5034, -5.7444],
  "ávila": [40.6567, -4.6812],
  "avila": [40.6567, -4.6812],
  "cuenca": [40.0704, -2.1374],
  "huesca": [42.1362, -0.4087],
  "segovia": [40.9429, -4.1088],
  "soria": [41.7636, -2.4649],
  "teruel": [40.3456, -1.1072],
  "santillana del mar": [43.3897, -4.1086],
  "comillas": [43.3858, -4.2917],
  "cangas de onís": [43.3514, -5.1275],
  "covadonga": [43.3128, -5.0547],
  "llanes": [43.4197, -4.7547],
  "ribadesella": [43.4614, -5.0594],
  "cudillero": [43.5628, -6.1458]
};

function cleanLocationName(raw) {
  if (!raw) return "";
  let clean = raw.trim();
  clean = clean.replace(/^(etapa\s*\d+:\s*)/i, "");
  clean = clean.replace(/\s*\([^)]*\)/g, "");
  return clean.trim();
}

function extractCityFromStage(stName) {
  if (!stName) return "";
  const match = stName.match(/Etapa\s*\d+:\s*([^(]+)/i);
  if (match) return match[1].trim();
  return cleanLocationName(stName);
}

function getDayRoutePoints(day, trip) {
  // Si el día ya tiene puntos definidos (o vaciados explícitamente por el usuario)
  if (day.origin !== undefined || day.destination !== undefined) {
    return { origin: day.origin || "", destination: day.destination || "" };
  }

  const baseOrigin = trip?.origin ? cleanLocationName(trip.origin) : "Castellón";
  const baseDest = trip?.destination ? cleanLocationName(trip.destination) : "Destino";

  let accomCity = baseDest;
  if (trip?.accommodation?.name) {
    const accName = trip.accommodation.name.toLowerCase();
    if (accName.includes("galdakao")) accomCity = "Galdakao";
    else if (accName.includes("bonterra") || accName.includes("benicàssim") || accName.includes("benicassim")) accomCity = "Benicàssim";
    else if (accName.includes("viana")) accomCity = "Viana";
    else if (accName.includes("potes")) accomCity = "Potes";
    else if (accName.includes("león") || accName.includes("leon")) accomCity = "León";
  }

  if (day?.stageName) {
    const stCity = extractCityFromStage(day.stageName);
    if (stCity) accomCity = stCity;
  }

  const planText = (day.plan || day.title || "").toLowerCase();

  // Caso: Día 1 o salida de casa
  if (day.dayNum === 1 || planText.includes("salida desde castellón") || planText.includes("salida desde castellon")) {
    const dest = (day.stageName ? extractCityFromStage(day.stageName) : accomCity) || baseDest;
    return { origin: baseOrigin, destination: dest };
  }

  // Caso: Vuelta a casa / último día
  if (planText.includes("vuelta a casa") || planText.includes("hacia castellón") || planText.includes("hacia castellon") || planText.includes("vuelta final")) {
    const orig = accomCity || baseDest;
    return { origin: orig, destination: baseOrigin };
  }

  // Caso: Transición entre etapas
  if (day.isTransition) {
    const prevCity = extractCityFromStage(day.prevStageName || "") || accomCity;
    const nextCity = extractCityFromStage(day.nextStageName || "") || baseDest;
    return { origin: prevCity, destination: nextCity };
  }

  // Detección de excursiones y puntos de interés en el plan del día
  const keywords = [
    { key: "bilbao", name: "Bilbao" },
    { key: "san juan de gaztelugatxe", name: "San Juan de Gaztelugatxe" },
    { key: "gaztelugatxe", name: "San Juan de Gaztelugatxe" },
    { key: "bermeo", name: "Bermeo" },
    { key: "san sebastián", name: "San Sebastián" },
    { key: "san sebastian", name: "San Sebastián" },
    { key: "concha", name: "San Sebastián" },
    { key: "guernica", name: "Guernica (Gernika)" },
    { key: "gernika", name: "Guernica (Gernika)" },
    { key: "urdaibai", name: "Reserva de Urdaibai" },
    { key: "vitoria", name: "Vitoria-Gasteiz" },
    { key: "valle salado", name: "Valle Salado de Añana" },
    { key: "getxo", name: "Getxo" },
    { key: "puente colgante", name: "Getxo (Puente Colgante)" },
    { key: "benicàssim", name: "Benicàssim" },
    { key: "benicassim", name: "Benicàssim" },
    { key: "vía verde", name: "Vía Verde Benicàssim" },
    { key: "aquarama", name: "Aquarama Benicàssim" },
    { key: "logroño", name: "Logroño (Calle Laurel)" },
    { key: "logrono", name: "Logroño (Calle Laurel)" },
    { key: "laguardia", name: "Laguardia (Rioja Alavesa)" },
    { key: "bodegas", name: "Laguardia" },
    { key: "potes", name: "Potes" },
    { key: "santo toribio", name: "Monasterio Santo Toribio de Liébana" },
    { key: "fuente dé", name: "Teleférico de Fuente Dé" },
    { key: "fuente de", name: "Teleférico de Fuente Dé" },
    { key: "mogrovejo", name: "Mogrovejo" },
    { key: "desfiladero de la hermida", name: "Desfiladero de La Hermida" },
    { key: "león", name: "León" },
    { key: "leon", name: "León" },
    { key: "catedral de león", name: "Catedral de León" },
    { key: "catedral de leon", name: "Catedral de León" },
    { key: "san isidoro", name: "San Isidoro de León" },
    { key: "médulas", name: "Las Médulas / Ponferrada" },
    { key: "medulas", name: "Las Médulas / Ponferrada" },
    { key: "ponferrada", name: "Ponferrada" },
    { key: "astorga", name: "Astorga" },
    { key: "valporquero", name: "Cueva de Valporquero" }
  ];

  for (const item of keywords) {
    if (planText.includes(item.key)) {
      return { origin: accomCity, destination: item.name };
    }
  }

  // Día local / estancia / descanso
  return { origin: accomCity, destination: `${accomCity} (Alrededores / Visita local)` };
}

function findCoordsForLocation(locName) {
  if (!locName) return null;
  // 1. Detectar si son coordenadas directas
  const m = locName.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
  if (m) {
    return [parseFloat(m[1]), parseFloat(m[2])];
  }
  const clean = cleanLocationName(locName).toLowerCase().trim();
  if (KNOWN_LOCATIONS_COORDS[clean]) return KNOWN_LOCATIONS_COORDS[clean];

  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return null;
}

function haversineDistanceKm(coords1, coords2) {
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatMinutesToHhMm(totalMinutes) {
  const m = Math.max(0, parseInt(totalMinutes, 10) || 0);
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function parseTimeToMinutes(val) {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return Math.max(0, Math.round(val));
  const str = String(val).trim();
  if (str.includes(":")) {
    const parts = str.split(":");
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return Math.max(0, (h * 60) + m);
  }
  return Math.max(0, parseInt(str, 10) || 0);
}

function formatTimeHHMM(totalMinutes) {
  const norm = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDurationHuman(durationMin = 0) {
  const total = Math.max(1, Math.round(durationMin));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function calculateArrivalTime(departureTime = "09:00", durationMin = 0) {
  const parts = (departureTime || "09:00").split(":");
  const depH = parseInt(parts[0], 10) || 9;
  const depM = parseInt(parts[1], 10) || 0;
  const totalMin = depH * 60 + depM + Math.round(durationMin);
  return formatTimeHHMM(totalMin);
}

function buildGoogleMapsDirUrl(origin, destination) {
  const o = (origin || "").trim();
  const d = (destination || "").trim();
  if (!o && !d) return "https://www.google.com/maps";
  if (!o || !d) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o || d)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
}

function calculateRouteMetrics(origin, destination, departureTime = "09:00", stopDurationMin = 0, customDist = null, customDuration = null, stopCount = null) {
  const origClean = cleanLocationName(origin);
  const destClean = cleanLocationName(destination);
  const stops = parseTimeToMinutes(stopDurationMin);
  const stopsCount = (stopCount !== null && stopCount !== undefined) ? parseInt(stopCount, 10) : (stops > 0 ? 1 : 0);

  if (!origin || !destination || !origClean || !destClean) {
    let url = "https://www.google.com/maps";
    if (origin || destination) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(origin || destination)}`;
    }
    return {
      distanceKm: 0,
      durationMin: 0,
      durationFormatted: "",
      departureTime: departureTime || "",
      stopCount: stopsCount,
      stopDurationMin: stops,
      stopDurationHhMm: formatMinutesToHhMm(stops),
      stopDurationFormatted: stops > 0 ? formatDurationHuman(stops) : "",
      totalDurationMin: 0,
      totalDurationFormatted: "",
      arrivalTime: "",
      arrivalWithStopsTime: "",
      googleMapsUrl: url
    };
  }

  let distanceKm = 0;
  let durationMin = 0;

  // 1. Comprobar caché exacto o inverso de Google Maps
  const key1 = `${origClean}|${destClean}`;
  const key2 = `${destClean}|${origClean}`;
  if (ROUTE_CACHE_GOOGLE_MAPS[key1]) {
    distanceKm = ROUTE_CACHE_GOOGLE_MAPS[key1].distanceKm;
    durationMin = ROUTE_CACHE_GOOGLE_MAPS[key1].durationMin;
  } else if (ROUTE_CACHE_GOOGLE_MAPS[key2]) {
    distanceKm = ROUTE_CACHE_GOOGLE_MAPS[key2].distanceKm;
    durationMin = ROUTE_CACHE_GOOGLE_MAPS[key2].durationMin;
  } else {
    // 2. Comprobar coincidencia por substring en las claves de la caché
    let found = false;
    for (const k of Object.keys(ROUTE_CACHE_GOOGLE_MAPS)) {
      const [kOrig, kDest] = k.split("|");
      if ((origClean.toLowerCase().includes(kOrig.toLowerCase()) || kOrig.toLowerCase().includes(origClean.toLowerCase())) &&
          (destClean.toLowerCase().includes(kDest.toLowerCase()) || kDest.toLowerCase().includes(destClean.toLowerCase()))) {
        distanceKm = ROUTE_CACHE_GOOGLE_MAPS[k].distanceKm;
        durationMin = ROUTE_CACHE_GOOGLE_MAPS[k].durationMin;
        found = true;
        break;
      }
    }

    if (!found) {
      // 3. Cálculo dinámico por coordenadas (cualquier punto del mapa o ciudad)
      const c1 = findCoordsForLocation(origin);
      const c2 = findCoordsForLocation(destination);
      if (c1 && c2) {
        const airDist = haversineDistanceKm(c1, c2);
        // Factor de carretera real de Google Maps (1.28x sobre distancia en línea recta)
        distanceKm = Math.max(2, Math.round(airDist * 1.28));
        const speedKmh = distanceKm > 200 ? 105 : (distanceKm > 70 ? 85 : (distanceKm > 25 ? 60 : 38));
        durationMin = Math.max(4, Math.round((distanceKm / speedKmh) * 60));
      } else {
        // 4. Estimación dinámica sensible si son puntos sin coordenadas exactas
        if (origClean.toLowerCase() === destClean.toLowerCase()) {
          distanceKm = 5;
          durationMin = 10;
        } else {
          let hash = 0;
          for (let i = 0; i < origClean.length; i++) hash += origClean.charCodeAt(i) * (i + 1);
          for (let j = 0; j < destClean.length; j++) hash += destClean.charCodeAt(j) * (j + 2);
          distanceKm = 20 + (hash % 180);
          durationMin = Math.max(15, Math.round((distanceKm / 75) * 60));
        }
      }
    }
  }

  const arrivalDirect = calculateArrivalTime(departureTime, durationMin);
  const arrivalWithStops = calculateArrivalTime(departureTime, durationMin + stops);

  return {
    distanceKm: distanceKm,
    durationMin: durationMin,
    durationFormatted: formatDurationHuman(durationMin),
    departureTime: departureTime,
    stopCount: stopsCount,
    stopDurationMin: stops,
    stopDurationHhMm: formatMinutesToHhMm(stops),
    stopDurationFormatted: formatDurationHuman(stops),
    totalDurationMin: durationMin + stops,
    totalDurationFormatted: formatDurationHuman(durationMin + stops),
    arrivalTime: arrivalDirect,
    arrivalWithStopsTime: arrivalWithStops,
    googleMapsUrl: buildGoogleMapsDirUrl(origin, destination)
  };
}

function getDayRouteMetrics(day, trip) {
  const points = getDayRoutePoints(day, trip);
  const depTime = (day.departureTime !== undefined && day.departureTime !== null && day.departureTime !== "")
    ? day.departureTime
    : "09:00";
  const stopMin = parseTimeToMinutes(day.stopDurationMin);

  if (!points.origin || !points.destination) {
    return {
      origin: points.origin || "",
      destination: points.destination || "",
      departureTime: day.departureTime || "",
      stopDurationMin: stopMin,
      distanceKm: 0,
      durationMin: 0,
      durationFormatted: "",
      arrivalTime: "",
      arrivalWithStopsTime: "",
      totalDurationFormatted: "",
      googleMapsUrl: (points.origin || points.destination)
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(points.origin || points.destination)}`
        : "https://www.google.com/maps"
    };
  }

  // Siempre calcular dinámicamente según origen y destino
  const metrics = calculateRouteMetrics(points.origin, points.destination, depTime, stopMin, null, null, day.stopCount);
  return {
    origin: points.origin,
    destination: points.destination,
    departureTime: depTime,
    stopDurationMin: stopMin,
    distanceKm: metrics.distanceKm,
    durationMin: metrics.durationMin,
    durationFormatted: metrics.durationFormatted,
    arrivalTime: metrics.arrivalTime,
    arrivalWithStopsTime: metrics.arrivalWithStopsTime,
    totalDurationFormatted: metrics.totalDurationFormatted,
    googleMapsUrl: metrics.googleMapsUrl
  };
}

function updateModalRoutePreview() {
  const originVal = document.getElementById("inputDayOrigin")?.value.trim() || "";
  const destVal = document.getElementById("inputDayDestination")?.value.trim() || "";
  const depTimeVal = document.getElementById("inputDayDepartureTime")?.value || "09:00";
  const stopCountVal = parseInt(document.getElementById("inputDayStopCount")?.value, 10) || 0;
  const stopTimeRaw = document.getElementById("inputDayStopMinutes")?.value || "00:00";
  const stopMinVal = parseTimeToMinutes(stopTimeRaw);

  const m = calculateRouteMetrics(originVal, destVal, depTimeVal, stopMinVal, null, null, stopCountVal);

  const distEl = document.getElementById("previewDistKm");
  if (distEl) distEl.innerHTML = `🚗 Distancia: <strong>${m.distanceKm > 0 ? m.distanceKm + ' km' : '-'}</strong>`;

  const driveTimeEl = document.getElementById("previewDriveTime");
  if (driveTimeEl) driveTimeEl.innerHTML = `⏱️ En ruta: <strong>${m.durationFormatted || '-'}</strong>`;

  const directEl = document.getElementById("previewDirectArrival");
  if (directEl) directEl.innerHTML = `🏁 Llegada directa: <strong>${m.arrivalTime || '--:--'}</strong>`;

  const stopsEl = document.getElementById("previewStopsArrival");
  if (stopsEl) {
    const stopsLabel = m.stopDurationMin > 0 ? ` (+${formatMinutesToHhMm(m.stopDurationMin)})` : ``;
    stopsEl.innerHTML = `🛑 Con paradas${stopsLabel}: <strong>${m.arrivalWithStopsTime || '--:--'}</strong>`;
  }

  const gmapsLink = document.getElementById("linkDayGmapsLive");
  if (gmapsLink) {
    gmapsLink.href = m.googleMapsUrl;
    if (!originVal && !destVal) {
      gmapsLink.style.display = "none";
    } else {
      gmapsLink.style.display = "inline";
    }
  }
}
// ------------------------------------------------------------
// GESTIÓN DE LÍNEAS DE ACTIVIDADES EN EL DÍA
// ------------------------------------------------------------
function getDayActivities(day) {
  if (!day) return [];
  if (Array.isArray(day.activities) && day.activities.length > 0) {
    return day.activities;
  }
  const act = {
    text: day.plan || "",
    origin: day.origin || "",
    destination: day.destination || "",
    departureTime: day.departureTime || "09:00",
    stopCount: day.stopCount !== undefined ? parseInt(day.stopCount, 10) : ((day.stopDurationMin && day.stopDurationMin > 0) ? 1 : 0),
    stopDurationMin: day.stopDurationMin || 0,
    customDist: day.customDist || null,
    customDuration: day.customDuration || null
  };
  return [act];
}

let modalDayActivitiesListState = [];
let draggedModalActIdx = null;

function attachModalActivityDragEvents() {
  const container = document.getElementById("modalActivitiesList");
  if (!container) return;
  const rows = container.querySelectorAll(".modal-activity-row");
  rows.forEach(row => {
    row.addEventListener("dragstart", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON" || e.target.tagName === "SELECT" || e.target.tagName === "LABEL") {
        return;
      }
      draggedModalActIdx = parseInt(row.getAttribute("data-modal-act-idx"), 10);
      row.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", draggedModalActIdx);
    });

    row.addEventListener("dragend", () => {
      row.classList.remove("is-dragging");
      rows.forEach(r => r.classList.remove("drag-over-top", "drag-over-bottom"));
      draggedModalActIdx = null;
    });

    row.addEventListener("dragover", (e) => {
      if (draggedModalActIdx === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const targetIdx = parseInt(row.getAttribute("data-modal-act-idx"), 10);
      if (draggedModalActIdx === targetIdx) return;

      const rect = row.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        row.classList.add("drag-over-top");
        row.classList.remove("drag-over-bottom");
      } else {
        row.classList.add("drag-over-bottom");
        row.classList.remove("drag-over-top");
      }
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over-top", "drag-over-bottom");
    });

    row.addEventListener("drop", (e) => {
      if (draggedModalActIdx === null) return;
      e.preventDefault();
      row.classList.remove("drag-over-top", "drag-over-bottom");
      const targetIdx = parseInt(row.getAttribute("data-modal-act-idx"), 10);
      if (isNaN(targetIdx) || draggedModalActIdx === targetIdx) return;

      const rect = row.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dropAfter = (e.clientY >= mid);

      handleReorderModalActivities(draggedModalActIdx, targetIdx, dropAfter);
    });
  });
}

function handleReorderModalActivities(fromIdx, toIdx, dropAfter = false) {
  if (!modalDayActivitiesListState || modalDayActivitiesListState.length <= 1) return;
  if (fromIdx < 0 || fromIdx >= modalDayActivitiesListState.length || toIdx < 0 || toIdx >= modalDayActivitiesListState.length || fromIdx === toIdx) return;

  const [moved] = modalDayActivitiesListState.splice(fromIdx, 1);
  let insertAt = toIdx;
  if (fromIdx < toIdx) {
    insertAt = dropAfter ? toIdx : (toIdx - 1);
  } else {
    insertAt = dropAfter ? (toIdx + 1) : toIdx;
  }
  insertAt = Math.max(0, Math.min(modalDayActivitiesListState.length, insertAt));
  modalDayActivitiesListState.splice(insertAt, 0, moved);

  const planInput = document.getElementById("inputDayPlan");
  if (planInput) {
    planInput.value = modalDayActivitiesListState.map(a => a.text).filter(Boolean).join("\n");
  }
  syncFirstActivityToPrimaryDayInputs();
  renderModalActivitiesList();
}

function renderModalActivitiesList() {
  const container = document.getElementById("modalActivitiesList");
  if (!container) return;

  if (!modalDayActivitiesListState || modalDayActivitiesListState.length === 0) {
    modalDayActivitiesListState = [{
      text: "",
      origin: "",
      destination: "",
      departureTime: "09:00",
      stopCount: 0,
      stopDurationMin: 0,
      noDisplacement: false,
      showRoute: false
    }];
  }

  container.innerHTML = modalDayActivitiesListState.map((act, idx) => {
    const isFirst = idx === 0;
    const isNoDisp = Boolean(act.noDisplacement);
    const m = calculateRouteMetrics(act.origin, act.destination, act.departureTime || "09:00", act.stopDurationMin || 0, null, null, act.stopCount);
    const hasRoute = Boolean(act.origin || act.destination) && !isNoDisp;

    return `
      <div class="modal-activity-row" draggable="true" data-modal-act-idx="${idx}" style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.35rem 0.5rem; margin-bottom: 0.35rem; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: all 0.15s ease;">
        <!-- Número de la actividad y descripción en la MISMA LÍNEA (formato limpio y sin grandes espacios) -->
        <div style="display: flex; align-items: center; gap: 0.4rem; width: 100%;">
          <span class="activity-drag-handle" title="Arrastra para reordenar esta actividad dentro del día" style="cursor: grab; color: #94a3b8; font-size: 1.15rem; line-height: 1; user-select: none;">⋮⋮</span>
          <strong class="activity-num-badge" style="color: #2563eb; font-size: 0.85rem; min-width: 20px;">${idx + 1}.</strong>
          <input type="text" class="form-control modal-act-text-input" style="flex: 1; min-width: 120px; font-size: 0.825rem; padding: 0.25rem 0.5rem; height: 31px;" placeholder="Descripción de la actividad..." value="${escapeHtml(act.text || '')}" oninput="updateModalActivityText(${idx}, this.value)">
          
          <div style="display: inline-flex; align-items: center; gap: 0.35rem; flex-shrink: 0;">
            <!-- Opción: Sin desplazamiento -->
            <label style="font-size: 0.7rem; font-weight: 600; color: ${isNoDisp ? '#15803d' : '#475569'}; background: ${isNoDisp ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isNoDisp ? '#bbf7d0' : '#cbd5e1'}; padding: 2px 5px; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.2rem; margin: 0; cursor: pointer; white-space: nowrap; user-select: none;" title="Marcar si esta actividad no requiere desplazamiento en vehículo">
              <input type="checkbox" ${isNoDisp ? 'checked' : ''} onchange="toggleActivityNoDisplacement(${idx}, this.checked)" style="width: 13px; height: 13px; accent-color: #2563eb; cursor: pointer;">
              <span>🚶 Sin desplazam.</span>
            </label>

            ${!isNoDisp ? `
              <button type="button" class="btn btn-sm" onclick="toggleModalActRouteSection(${idx})" style="font-size: 0.7rem; padding: 0.15rem 0.4rem; height: 26px; background: ${hasRoute ? '#eff6ff' : '#f8fafc'}; color: ${hasRoute ? '#1d4ed8' : '#475569'}; border: 1px solid ${hasRoute ? '#bfdbfe' : '#cbd5e1'}; border-radius: 4px; font-weight: 600; white-space: nowrap;">
                🗺️ ${hasRoute ? 'Ruta ✓' : '+ Ruta'}
              </button>
            ` : ''}

            ${!isFirst ? `
              <button type="button" class="btn btn-danger btn-sm" onclick="removeModalActivityLine(${idx})" style="font-size: 0.75rem; padding: 0.15rem 0.35rem; height: 26px; line-height: 1;" title="Eliminar actividad">&times;</button>
            ` : ''}
          </div>
        </div>
        
        <!-- Sección de ruta para esta actividad -->
        ${isNoDisp ? '' : `
          <div id="modalActRouteSec_${idx}" style="display: ${act.showRoute || hasRoute ? 'block' : 'none'}; margin-top: 0.35rem; background: #f8fafc; border: 1px dashed #bfdbfe; border-radius: 6px; padding: 0.45rem;">
            <div style="font-size: 0.725rem; font-weight: 700; color: #0369a1; margin-bottom: 0.25rem;">📍 Desplazamiento / Ruta asociada (Google Maps):</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 0.3rem;">
              <div>
                <div style="font-size: 0.68rem; color: #64748b; margin-bottom: 0.1rem;">Salida (Origen):</div>
                <input type="text" id="modalActOrigin_${idx}" class="form-control" style="font-size: 0.75rem; padding: 2px 6px; height: 28px;" value="${escapeHtml(act.origin || '')}" placeholder="Origen..." oninput="updateModalActivityRouteField(${idx}, 'origin', this.value)">
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #64748b; margin-bottom: 0.1rem;">Llegada (Destino):</div>
                <input type="text" id="modalActDest_${idx}" class="form-control" style="font-size: 0.75rem; padding: 2px 6px; height: 28px;" value="${escapeHtml(act.destination || '')}" placeholder="Destino..." oninput="updateModalActivityRouteField(${idx}, 'destination', this.value)">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 0.4rem; margin-bottom: 0.3rem;">
              <div>
                <div style="font-size: 0.68rem; color: #64748b; margin-bottom: 0.1rem;">Hora Salida:</div>
                <input type="time" class="form-control" style="font-size: 0.75rem; padding: 2px 4px; height: 28px;" value="${act.departureTime || '09:00'}" oninput="updateModalActivityRouteField(${idx}, 'departureTime', this.value)">
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #64748b; margin-bottom: 0.1rem;">Nº Paradas:</div>
                <select class="form-control" style="font-size: 0.75rem; padding: 2px 4px; height: 28px;" onchange="updateModalActivityStopCount(${idx}, this.value)">
                  <option value="0" ${(act.stopCount == 0) ? 'selected' : ''}>0 paradas</option>
                  <option value="1" ${(act.stopCount == 1) ? 'selected' : ''}>1 parada</option>
                  <option value="2" ${(act.stopCount == 2) ? 'selected' : ''}>2 paradas</option>
                  <option value="3" ${(act.stopCount == 3) ? 'selected' : ''}>3 paradas</option>
                  <option value="4" ${(act.stopCount == 4) ? 'selected' : ''}>4 paradas</option>
                  <option value="5" ${(act.stopCount == 5) ? 'selected' : ''}>5 paradas</option>
                  <option value="6" ${(act.stopCount >= 6) ? 'selected' : ''}>6+ paradas</option>
                </select>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #64748b; margin-bottom: 0.1rem;">Tiempo Paradas:</div>
                <input type="time" class="form-control" style="font-size: 0.75rem; padding: 2px 4px; height: 28px;" value="${formatMinutesToHhMm(act.stopDurationMin || 0)}" step="300" oninput="updateModalActivityStopDuration(${idx}, this.value)">
              </div>
            </div>
            <div id="modalActMetrics_${idx}" style="display: ${hasRoute ? 'flex' : 'none'}; font-size: 0.725rem; color: #334155; background: white; padding: 0.3rem 0.5rem; border-radius: 4px; border: 1px solid #e2e8f0; flex-wrap: wrap; gap: 0.45rem; align-items: center;">
              ${hasRoute ? `
                <span>🚗 ${m.distanceKm > 0 ? m.distanceKm + ' km' : '-'}</span>
                <span>⏱️ ${m.durationFormatted || '-'}</span>
                <span>🏁 Llegada directa: <strong>${m.arrivalTime || '--:--'}</strong></span>
                ${m.stopDurationMin > 0 ? `<span>🛑 Con paradas (+${formatMinutesToHhMm(m.stopDurationMin)}): <strong>${m.arrivalWithStopsTime || '--:--'}</strong></span>` : ''}
              ` : ''}
            </div>
          </div>
        `}
      </div>
    `;
  }).join("");

  attachModalActivityDragEvents();
}

function toggleActivityNoDisplacement(idx, isChecked) {
  if (modalDayActivitiesListState[idx]) {
    modalDayActivitiesListState[idx].noDisplacement = isChecked;
    if (isChecked) {
      modalDayActivitiesListState[idx].origin = "";
      modalDayActivitiesListState[idx].destination = "";
      modalDayActivitiesListState[idx].distanceKm = null;
      modalDayActivitiesListState[idx].durationMin = null;
    }
    if (idx === 0) {
      syncFirstActivityToPrimaryDayInputs();
    }
    renderModalActivitiesList();
  }
}

function updateModalActivityRowMetrics(idx) {
  const act = modalDayActivitiesListState[idx];
  if (!act) return;
  const metricsEl = document.getElementById(`modalActMetrics_${idx}`);
  if (!metricsEl) return;

  const isNoDisp = Boolean(act.noDisplacement);
  const hasRoute = Boolean(act.origin || act.destination) && !isNoDisp;
  if (!hasRoute) {
    metricsEl.innerHTML = "";
    metricsEl.style.display = "none";
    return;
  }

  const m = calculateRouteMetrics(act.origin, act.destination, act.departureTime || "09:00", act.stopDurationMin || 0, null, null, act.stopCount);
  metricsEl.style.display = "flex";
  metricsEl.innerHTML = `
    <span>🚗 ${m.distanceKm > 0 ? m.distanceKm + ' km' : '-'}</span>
    <span>⏱️ ${m.durationFormatted || '-'}</span>
    <span>🏁 Llegada directa: <strong>${m.arrivalTime || '--:--'}</strong></span>
    ${m.stopDurationMin > 0 ? `<span>🛑 Con paradas (+${formatMinutesToHhMm(m.stopDurationMin)}): <strong>${m.arrivalWithStopsTime || '--:--'}</strong></span>` : ''}
  `;
}

function updateModalActivityStopDuration(idx, val) {
  if (modalDayActivitiesListState[idx]) {
    modalDayActivitiesListState[idx].stopDurationMin = parseTimeToMinutes(val);
    if (idx === 0) {
      const inputStop = document.getElementById("inputDayStopMinutes");
      if (inputStop) inputStop.value = formatMinutesToHhMm(modalDayActivitiesListState[idx].stopDurationMin);
    }
    updateModalActivityRowMetrics(idx);
  }
}

function addModalActivityLine() {
  modalDayActivitiesListState.push({
    text: "",
    origin: "",
    destination: "",
    departureTime: "09:00",
    stopCount: 0,
    stopDurationMin: 0,
    noDisplacement: false,
    showRoute: false
  });
  renderModalActivitiesList();
}

function removeModalActivityLine(idx) {
  if (modalDayActivitiesListState.length <= 1) return;
  modalDayActivitiesListState.splice(idx, 1);
  renderModalActivitiesList();
  syncFirstActivityToPrimaryDayInputs();
}

function toggleModalActRouteSection(idx) {
  const sec = document.getElementById(`modalActRouteSec_${idx}`);
  if (sec) {
    const isHidden = sec.style.display === "none";
    sec.style.display = isHidden ? "block" : "none";
    if (modalDayActivitiesListState[idx]) {
      modalDayActivitiesListState[idx].showRoute = isHidden;
    }
  }
}

function updateModalActivityText(idx, val) {
  if (modalDayActivitiesListState[idx]) {
    modalDayActivitiesListState[idx].text = val;
    const planInput = document.getElementById("inputDayPlan");
    if (planInput) {
      planInput.value = modalDayActivitiesListState.map(a => a.text).filter(Boolean).join("\n");
    }
  }
}

// CORRECCIÓN LETRA A LETRA: Actualizar estado y métricas SIN destruir el innerHTML del formulario
function updateModalActivityRouteField(idx, field, val) {
  if (modalDayActivitiesListState[idx]) {
    modalDayActivitiesListState[idx][field] = val;
    if (idx === 0) {
      syncFirstActivityToPrimaryDayInputs();
    }
    updateModalActivityRowMetrics(idx);
  }
}

function updateModalActivityStopCount(idx, val) {
  if (modalDayActivitiesListState[idx]) {
    const count = parseInt(val, 10) || 0;
    modalDayActivitiesListState[idx].stopCount = count;
    if (count > 0 && (!modalDayActivitiesListState[idx].stopDurationMin || modalDayActivitiesListState[idx].stopDurationMin === 0)) {
      modalDayActivitiesListState[idx].stopDurationMin = count * 20;
    } else if (count === 0) {
      modalDayActivitiesListState[idx].stopDurationMin = 0;
    }
    if (idx === 0) {
      syncFirstActivityToPrimaryDayInputs();
    }
    renderModalActivitiesList();
  }
}

function syncFirstActivityToPrimaryDayInputs() {
  if (!modalDayActivitiesListState || modalDayActivitiesListState.length === 0) return;
  const first = modalDayActivitiesListState[0];
  const inputOrigin = document.getElementById("inputDayOrigin");
  if (inputOrigin) inputOrigin.value = first.origin || "";
  const inputDest = document.getElementById("inputDayDestination");
  if (inputDest) inputDest.value = first.destination || "";
  const inputDep = document.getElementById("inputDayDepartureTime");
  if (inputDep) inputDep.value = first.departureTime || "09:00";
  const stopCount = document.getElementById("inputDayStopCount");
  if (stopCount) stopCount.value = first.stopCount !== undefined ? first.stopCount : (first.stopDurationMin > 0 ? 1 : 0);
  const stopMin = document.getElementById("inputDayStopMinutes");
  if (stopMin) stopMin.value = formatMinutesToHhMm(first.stopDurationMin || 0);
  updateModalRoutePreview();
}

// ------------------------------------------------------------
// MODAL DEDICADO DE RUTA (GOOGLE MAPS)
// ------------------------------------------------------------
function openDayRouteModal(dayIndex, activityIndex = 0) {
  const trip = getCurrentTrip();
  if (!trip) return;
  const targetDay = getDayObjectByIndex(trip, dayIndex);
  if (!targetDay) return;

  const dayIndexInput = document.getElementById("routeModalDayIndex");
  if (dayIndexInput) dayIndexInput.value = dayIndex;

  const actIndexInput = document.getElementById("routeModalActivityIndex");
  if (actIndexInput) actIndexInput.value = activityIndex;

  const activities = getDayActivities(targetDay);
  const curAct = activities[activityIndex] || activities[0] || {};

  const titleEl = document.getElementById("modalDayRouteTitle");
  if (titleEl) titleEl.textContent = `🗺️ Establecer Ruta y Paradas - Día ${targetDay.dayNum}`;

  const selectorRow = document.getElementById("routeModalActivitySelectorRow");
  const selector = document.getElementById("routeModalActivitySelect");
  if (selectorRow && selector) {
    if (activities.length > 1) {
      selectorRow.style.display = "block";
      selector.innerHTML = activities.map((a, i) => {
        const previewText = a.text ? a.text.substring(0, 32) : `Actividad ${i + 1}`;
        return `<option value="${i}" ${i === activityIndex ? 'selected' : ''}>Línea ${i + 1}: ${escapeHtml(previewText)}</option>`;
      }).join("");
    } else {
      selectorRow.style.display = "none";
    }
  }

  const origInput = document.getElementById("routeModalOrigin");
  if (origInput) origInput.value = curAct.origin !== undefined ? curAct.origin : (targetDay.origin || "");

  const destInput = document.getElementById("routeModalDestination");
  if (destInput) destInput.value = curAct.destination !== undefined ? curAct.destination : (targetDay.destination || "");

  const depInput = document.getElementById("routeModalDepartureTime");
  if (depInput) depInput.value = curAct.departureTime || targetDay.departureTime || "09:00";

  const stopCountSelect = document.getElementById("routeModalStopCount");
  if (stopCountSelect) {
    const sc = curAct.stopCount !== undefined ? curAct.stopCount : (targetDay.stopCount !== undefined ? targetDay.stopCount : ((curAct.stopDurationMin > 0 || targetDay.stopDurationMin > 0) ? 1 : 0));
    stopCountSelect.value = String(sc);
  }

  const stopInput = document.getElementById("routeModalStopMinutes");
  if (stopInput) {
    const sMin = curAct.stopDurationMin !== undefined ? curAct.stopDurationMin : (targetDay.stopDurationMin || 0);
    stopInput.value = formatMinutesToHhMm(sMin);
  }

  // Comprobar si esta actividad no tiene desplazamiento asociado
  const noDispCheckbox = document.getElementById("routeModalNoDisplacement");
  const isNoDisp = Boolean(curAct.noDisplacement || (activityIndex === 0 && targetDay.noDisplacement));
  if (noDispCheckbox) {
    noDispCheckbox.checked = isNoDisp;
    toggleRouteModalNoDisplacement(isNoDisp);
  }

  updateDedicatedRouteModalPreview();
  openModal("modalDayRoute");
}

function toggleRouteModalNoDisplacement(isChecked) {
  const fields = document.getElementById("routeModalFieldsContainer");
  const notice = document.getElementById("routeModalNoDisplacementNotice");
  const liveMap = document.getElementById("routeModalLiveMapCard");

  if (fields) fields.style.display = isChecked ? "none" : "block";
  if (notice) notice.style.display = isChecked ? "block" : "none";
  if (liveMap) liveMap.style.display = isChecked ? "none" : "flex";

  if (!isChecked) {
    updateDedicatedRouteModalPreview();
  }
}

function switchRouteModalActivity(newActIdx) {
  const dayIndex = parseInt(document.getElementById("routeModalDayIndex")?.value, 10);
  openDayRouteModal(dayIndex, parseInt(newActIdx, 10) || 0);
}

function handleStopCountChange(prefix) {
  const countSelect = document.getElementById(prefix === "routeModal" ? "routeModalStopCount" : "inputDayStopCount");
  const minInput = document.getElementById(prefix === "routeModal" ? "routeModalStopMinutes" : "inputDayStopMinutes");
  if (!countSelect || !minInput) return;

  const count = parseInt(countSelect.value, 10) || 0;
  const currentMin = parseTimeToMinutes(minInput.value);

  if (count > 0 && currentMin === 0) {
    minInput.value = formatMinutesToHhMm(count * 20); // Sugerencia de 20 min por parada en formato hh:mm
  } else if (count === 0 && currentMin > 0) {
    minInput.value = "00:00";
  }

  if (prefix === "routeModal") {
    updateDedicatedRouteModalPreview();
  } else {
    updateModalRoutePreview();
  }
}

function handleCustomRouteMetricChange(prefix) {
  if (prefix === "routeModal") {
    updateDedicatedRouteModalPreview();
  } else {
    updateModalRoutePreview();
  }
}


let routeModalMiniMapInstance = null;
let routeModalStartMarker = null;
let routeModalEndMarker = null;
let routeModalPolyline = null;

function updateRouteModalMiniMap(originVal, destVal, m) {
  const container = document.getElementById("routeModalMiniMap");
  if (!container) return;

  if (!originVal && !destVal) {
    container.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#64748b; font-size:0.85rem; text-align:center; padding:1rem;">📍 Escribe o marca un punto de salida y llegada para ver el trazado de la ruta.</div>';
    if (routeModalMiniMapInstance) {
      try { routeModalMiniMapInstance.remove(); } catch(e){}
      routeModalMiniMapInstance = null;
      routeModalStartMarker = null;
      routeModalEndMarker = null;
      routeModalPolyline = null;
    }
    return;
  }

  if (window.L && typeof window.L.map === "function") {
    container.innerHTML = "";
    const coords1 = (originVal ? findCoordsForLocation(originVal) : null) || (destVal ? findCoordsForLocation(destVal) : null) || [39.9864, -0.0513];
    const coords2 = (destVal ? findCoordsForLocation(destVal) : null) || [coords1[0] + 0.15, coords1[1] + 0.15];

    if (!routeModalMiniMapInstance) {
      routeModalMiniMapInstance = L.map("routeModalMiniMap", {
        zoomControl: true,
        attributionControl: false
      }).setView(coords1, 10);

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 18
      }).addTo(routeModalMiniMapInstance);
    }

    if (!routeModalStartMarker) {
      routeModalStartMarker = L.circleMarker(coords1, {
        radius: 8,
        fillColor: "#10b981",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 0.95
      }).addTo(routeModalMiniMapInstance);
    } else {
      routeModalStartMarker.setLatLng(coords1);
      if (!routeModalMiniMapInstance.hasLayer(routeModalStartMarker)) {
        routeModalStartMarker.addTo(routeModalMiniMapInstance);
      }
    }
    routeModalStartMarker.bindTooltip(`📍 Salida: ${originVal || "Origen"}`);

    if (originVal && destVal) {
      if (!routeModalEndMarker) {
        routeModalEndMarker = L.circleMarker(coords2, {
          radius: 8,
          fillColor: "#ef4444",
          color: "#ffffff",
          weight: 2,
          fillOpacity: 0.95
        }).addTo(routeModalMiniMapInstance);
      } else {
        routeModalEndMarker.setLatLng(coords2);
        if (!routeModalMiniMapInstance.hasLayer(routeModalEndMarker)) {
          routeModalEndMarker.addTo(routeModalMiniMapInstance);
        }
      }
      routeModalEndMarker.bindTooltip(`🏁 Llegada: ${destVal}`);

      if (!routeModalPolyline) {
        routeModalPolyline = L.polyline([coords1, coords2], {
          color: "#2563eb",
          weight: 4,
          opacity: 0.85,
          dashArray: "6, 6"
        }).addTo(routeModalMiniMapInstance);
      } else {
        routeModalPolyline.setLatLngs([coords1, coords2]);
        if (!routeModalMiniMapInstance.hasLayer(routeModalPolyline)) {
          routeModalPolyline.addTo(routeModalMiniMapInstance);
        }
      }

      routeModalMiniMapInstance.fitBounds(L.latLngBounds([coords1, coords2]), {
        padding: [30, 30]
      });
    } else {
      if (routeModalEndMarker && routeModalMiniMapInstance.hasLayer(routeModalEndMarker)) {
        routeModalMiniMapInstance.removeLayer(routeModalEndMarker);
      }
      if (routeModalPolyline && routeModalMiniMapInstance.hasLayer(routeModalPolyline)) {
        routeModalMiniMapInstance.removeLayer(routeModalPolyline);
      }
      routeModalMiniMapInstance.setView(coords1, 12);
    }

    [0, 50, 150, 300, 600].forEach(delay => {
      setTimeout(() => {
        if (routeModalMiniMapInstance) routeModalMiniMapInstance.invalidateSize();
      }, delay);
    });
  }
}

function updateDedicatedRouteModalPreview() {
  const originVal = document.getElementById("routeModalOrigin")?.value.trim() || "";
  const destVal = document.getElementById("routeModalDestination")?.value.trim() || "";
  const depTimeVal = document.getElementById("routeModalDepartureTime")?.value || "09:00";
  const stopCountVal = parseInt(document.getElementById("routeModalStopCount")?.value, 10) || 0;
  const stopTimeRaw = document.getElementById("routeModalStopMinutes")?.value || "00:00";
  const stopMinVal = parseTimeToMinutes(stopTimeRaw);

  // Cálculo dinámico automático con Google Maps
  const m = calculateRouteMetrics(originVal, destVal, depTimeVal, stopMinVal, null, null, stopCountVal);

  const distEl = document.getElementById("routeModalDist");
  if (distEl) distEl.textContent = m.distanceKm > 0 ? `${m.distanceKm} km` : "-";

  const durEl = document.getElementById("routeModalDuration");
  if (durEl) durEl.textContent = m.durationFormatted || "-";

  const directEl = document.getElementById("routeModalDirectArrival");
  if (directEl) directEl.textContent = m.arrivalTime || "--:--";

  const stopsEl = document.getElementById("routeModalStopsArrival");
  if (stopsEl) {
    if (m.arrivalWithStopsTime) {
      const stopParenthesis = m.stopDurationMin > 0 ? ` (+${formatMinutesToHhMm(m.stopDurationMin)})` : ``;
      stopsEl.textContent = `${m.arrivalWithStopsTime}${stopParenthesis}`;
    } else {
      stopsEl.textContent = "--:--";
    }
  }

  const gmapsLink = document.getElementById("routeModalGmapsLink");
  if (gmapsLink) {
    gmapsLink.href = m.googleMapsUrl;
    if (!originVal && !destVal) {
      gmapsLink.style.display = "none";
    } else {
      gmapsLink.style.display = "inline-flex";
    }
  }

  // Actualizar automáticamente la ruta marcada en Google Maps y trazado interactivo
  const routeMapIframe = document.getElementById("routeModalLiveMapIframe");
  const extRouteLink = document.getElementById("routeModalLiveMapExternalLink");
  if (extRouteLink) {
    extRouteLink.href = m.googleMapsUrl;
  }
  if (routeMapIframe) {
    if (originVal && destVal) {
      routeMapIframe.src = `https://maps.google.com/maps?saddr=${encodeURIComponent(originVal)}&daddr=${encodeURIComponent(destVal)}&output=embed`;
    } else if (originVal || destVal) {
      routeMapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(originVal || destVal)}&output=embed`;
    }
  }

  // Renderizar trazado interactivo en el mini mapa
  updateRouteModalMiniMap(originVal, destVal, m);
}

function saveDayRouteFromDedicatedModal() {
  const trip = getCurrentTrip();
  if (!trip) return;
  const dayIndex = parseInt(document.getElementById("routeModalDayIndex").value, 10);
  const targetDay = getDayObjectByIndex(trip, dayIndex);
  if (!targetDay) return;

  const actIdx = parseInt(document.getElementById("routeModalActivityIndex")?.value, 10) || 0;

  const origVal = document.getElementById("routeModalOrigin").value.trim();
  const destVal = document.getElementById("routeModalDestination").value.trim();
  const depTimeVal = document.getElementById("routeModalDepartureTime").value || "09:00";
  const stopCountVal = parseInt(document.getElementById("routeModalStopCount")?.value, 10) || 0;
  const stopTimeRaw = document.getElementById("routeModalStopMinutes")?.value || "00:00";
  const stopMinVal = parseTimeToMinutes(stopTimeRaw);

  const m = calculateRouteMetrics(origVal, destVal, depTimeVal, stopMinVal, null, null, stopCountVal);

  if (!targetDay.activities || !Array.isArray(targetDay.activities)) {
    targetDay.activities = getDayActivities(targetDay);
  }
  while (targetDay.activities.length <= actIdx) {
    targetDay.activities.push({ text: "" });
  }

  const act = targetDay.activities[actIdx];
  const isNoDisp = Boolean(document.getElementById("routeModalNoDisplacement")?.checked);
  act.noDisplacement = isNoDisp;

  if (isNoDisp) {
    act.origin = "";
    act.destination = "";
    act.distanceKm = null;
    act.durationMin = null;
    act.estimatedTime = "";
    act.arrivalTime = "";
    act.arrivalWithStopsTime = "";
    act.googleMapsUrl = "";
    if (actIdx === 0) {
      targetDay.noDisplacement = true;
      targetDay.origin = "";
      targetDay.destination = "";
      targetDay.distanceKm = null;
      targetDay.durationMin = null;
      targetDay.estimatedTime = "";
      targetDay.arrivalTime = "";
      targetDay.arrivalWithStopsTime = "";
      targetDay.googleMapsUrl = "";
    }
  } else {
    act.origin = origVal;
    act.destination = destVal;
    act.departureTime = depTimeVal;
    act.stopCount = stopCountVal;
    act.stopDurationMin = stopMinVal;

    if (origVal && destVal) {
      act.distanceKm = m.distanceKm;
      act.durationMin = m.durationMin;
      act.estimatedTime = m.durationFormatted;
      act.arrivalTime = m.arrivalTime;
      act.arrivalWithStopsTime = m.arrivalWithStopsTime;
      act.googleMapsUrl = m.googleMapsUrl;
    } else {
      act.distanceKm = null;
      act.durationMin = null;
      act.estimatedTime = "";
      act.arrivalTime = "";
      act.arrivalWithStopsTime = "";
      act.googleMapsUrl = m.googleMapsUrl;
    }
    if (actIdx === 0) {
      targetDay.noDisplacement = false;
    }
  }

  // Sincronizar datos globales del día si es la actividad principal (índice 0)
  if (actIdx === 0) {
    targetDay.origin = act.origin;
    targetDay.destination = act.destination;
    targetDay.departureTime = act.departureTime;
    targetDay.stopCount = act.stopCount;
    targetDay.stopDurationMin = act.stopDurationMin;
    targetDay.distanceKm = act.distanceKm;
    targetDay.durationMin = act.durationMin;
    targetDay.estimatedTime = act.estimatedTime;
    targetDay.arrivalTime = act.arrivalTime;
    targetDay.arrivalWithStopsTime = act.arrivalWithStopsTime;
    targetDay.googleMapsUrl = act.googleMapsUrl;
  }

  saveDatabase(db);
  closeModal("modalDayRoute");
  renderItineraryTab();
  showToast(`Ruta del Día ${targetDay.dayNum} actualizada`, "success");
}

function clearRouteField(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.value = "";
    if (inputId.startsWith("routeModal")) {
      updateDedicatedRouteModalPreview();
    } else {
      updateModalRoutePreview();
    }
  }
}

// ============================================================
// SELECTOR INTERACTIVO DE MAPA Y GOOGLE MAPS (MAP PICKER)
// ============================================================
let mapPickerLeafletInstance = null;
let mapPickerMarker = null;
let mapPickerTargetInputId = null;
let mapPickerTargetLabel = "";
let currentPickedLocation = {
  name: "",
  lat: 39.9864,
  lng: -0.0513
};

let currentTileLayerKey = "esri";
let activeTileLayer = null;

function setMapTileLayer(key) {
  if (!mapPickerLeafletInstance || !window.L) return;
  currentTileLayerKey = key;
  if (activeTileLayer) {
    try { mapPickerLeafletInstance.removeLayer(activeTileLayer); } catch(e){}
  }
  let url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
  let attribution = "Tiles &copy; Esri &mdash; Street Map";
  let maxZoom = 19;

  if (key === "satellite") {
    url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    attribution = "Tiles &copy; Esri &mdash; Satellite Imagery";
  } else if (key === "osm") {
    url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    attribution = "&copy; OpenStreetMap contributors";
  }

  activeTileLayer = L.tileLayer(url, { attribution, maxZoom }).addTo(mapPickerLeafletInstance);
  mapPickerLeafletInstance.invalidateSize();
}

function openMapPickerModal(targetInputId, fieldLabel) {
  mapPickerTargetInputId = targetInputId;
  mapPickerTargetLabel = fieldLabel || "Punto de Ruta";

  const titleEl = document.getElementById("modalMapPickerTitle");
  if (titleEl) {
    titleEl.textContent = `📍 Marcar en el Mapa: ${mapPickerTargetLabel}`;
  }

  const targetEl = document.getElementById(targetInputId);
  const currentVal = targetEl ? targetEl.value.trim() : "";

  let startLat = 39.9864;
  let startLng = -0.0513;
  let startName = currentVal || "Castellón";

  if (currentVal) {
    const coords = findCoordsForLocation(currentVal);
    if (coords) {
      startLat = coords[0];
      startLng = coords[1];
    }
  } else {
    const curTrip = getCurrentTrip();
    if (curTrip?.destination) {
      const c = findCoordsForLocation(curTrip.destination);
      if (c) {
        startLat = c[0];
        startLng = c[1];
        startName = curTrip.destination;
      }
    }
  }

  currentPickedLocation = {
    name: startName,
    lat: startLat,
    lng: startLng
  };

  const nameEl = document.getElementById("mapPickerSelectedName");
  if (nameEl) nameEl.textContent = currentPickedLocation.name || "(Sin seleccionar)";

  const coordsEl = document.getElementById("mapPickerSelectedCoords");
  if (coordsEl) coordsEl.textContent = `Lat: ${startLat.toFixed(5)}, Lng: ${startLng.toFixed(5)}`;

  const searchInput = document.getElementById("mapPickerSearchInput");
  if (searchInput) searchInput.value = currentVal;

  const btnExternal = document.getElementById("btnOpenExternalGoogleMaps");
  if (btnExternal) {
    btnExternal.href = currentVal
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentVal)}`
      : "https://www.google.com/maps";
  }

  const iframe = document.getElementById("mapPickerGmapsIframe");
  if (iframe) {
    const q = encodeURIComponent(startName || "Castellón");
    iframe.src = `https://maps.google.com/maps?q=${q}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }

  openModal("modalMapPicker");

  // Asegurar visualización inmediata y sin fallos del mapa interactivo
  initOrUpdatePickerMap(startLat, startLng, startName);
  [50, 150, 300, 600].forEach(delay => {
    setTimeout(() => {
      initOrUpdatePickerMap(startLat, startLng, startName);
    }, delay);
  });
}

function initOrUpdatePickerMap(lat, lng, name) {
  const container = document.getElementById("mapPickerLeaflet");
  if (!container) return;

  if (window.L && typeof window.L.map === "function") {
    if (!mapPickerLeafletInstance) {
      mapPickerLeafletInstance = L.map("mapPickerLeaflet", {
        zoomControl: true
      }).setView([lat, lng], 13);

      setMapTileLayer(currentTileLayerKey || "esri");

      // CLIC EN CUALQUIER PUNTO DEL MAPA (Requisito 2)
      mapPickerLeafletInstance.on("click", (e) => {
        handleMapPickerClick(e.latlng.lat, e.latlng.lng);
      });
    } else {
      mapPickerLeafletInstance.setView([lat, lng], 13);
    }

    if (!mapPickerMarker) {
      mapPickerMarker = L.marker([lat, lng], { draggable: true }).addTo(mapPickerLeafletInstance);
      mapPickerMarker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        handleMapPickerClick(pos.lat, pos.lng);
      });
    } else {
      mapPickerMarker.setLatLng([lat, lng]);
      if (!mapPickerLeafletInstance.hasLayer(mapPickerMarker)) {
        mapPickerMarker.addTo(mapPickerLeafletInstance);
      }
    }

    // Forzar redibujado de tamaño en múltiples intervalos para eliminar cualquier pantalla gris o retraso
    [0, 50, 150, 300, 600].forEach(delay => {
      setTimeout(() => {
        if (mapPickerLeafletInstance) {
          mapPickerLeafletInstance.invalidateSize();
        }
      }, delay);
    });
  }
}

function handleMapPickerClick(lat, lng) {
  currentPickedLocation.lat = lat;
  currentPickedLocation.lng = lng;

  if (mapPickerMarker) {
    mapPickerMarker.setLatLng([lat, lng]);
  }

  // Buscar coincidencia cercana en lugares conocidos
  let bestName = "";
  let minDistance = 999999;
  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS_COORDS)) {
    const dist = haversineDistanceKm([lat, lng], coords);
    if (dist < minDistance) {
      minDistance = dist;
      bestName = key.charAt(0).toUpperCase() + key.slice(1);
    }
  }

  if (minDistance <= 2.5 && bestName) {
    currentPickedLocation.name = bestName;
  } else {
    // Cualquier punto marcado en el mapa (Requisito 2)
    currentPickedLocation.name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  // Registrar las coordenadas de este punto marcado
  KNOWN_LOCATIONS_COORDS[currentPickedLocation.name.toLowerCase()] = [lat, lng];

  updateMapPickerUI();

  // Intentar geocodificación inversa con Nominatim para poner el nombre de la calle/lugar real
  try {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`, {
      headers: { "Accept-Language": "es" }
    })
    .then(r => r.json())
    .then(data => {
      if (data && data.address) {
        const place = data.address.road || data.address.suburb || data.address.neighbourhood || data.address.town || data.address.village || data.address.city || (data.display_name ? data.display_name.split(",")[0] : null);
        const city = data.address.city || data.address.town || data.address.municipality || "";
        if (place) {
          const finalName = city && !place.includes(city) ? `${place}, ${city}` : place;
          currentPickedLocation.name = finalName;
          KNOWN_LOCATIONS_COORDS[finalName.toLowerCase()] = [lat, lng];
          updateMapPickerUI();
        }
      }
    })
    .catch(() => {});
  } catch (e) {}
}

function updateMapPickerUI() {
  const nameEl = document.getElementById("mapPickerSelectedName");
  if (nameEl) nameEl.textContent = currentPickedLocation.name || "(Sin seleccionar)";

  const coordsEl = document.getElementById("mapPickerSelectedCoords");
  if (coordsEl) coordsEl.textContent = `Lat: ${currentPickedLocation.lat.toFixed(5)}, Lng: ${currentPickedLocation.lng.toFixed(5)}`;

  const btnExternal = document.getElementById("btnOpenExternalGoogleMaps");
  if (btnExternal) {
    btnExternal.href = currentPickedLocation.name
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentPickedLocation.name)}`
      : "https://www.google.com/maps";
  }
}

function selectMapPreset(name, lat, lng) {
  currentPickedLocation.name = name;
  currentPickedLocation.lat = lat;
  currentPickedLocation.lng = lng;
  KNOWN_LOCATIONS_COORDS[name.toLowerCase()] = [lat, lng];
  updateMapPickerUI();
  if (mapPickerMarker) mapPickerMarker.setLatLng([lat, lng]);
  if (mapPickerLeafletInstance) {
    mapPickerLeafletInstance.setView([lat, lng], 13);
  }
}

function handleMapPickerSearch() {
  const raw = document.getElementById("mapPickerSearchInput")?.value.trim() || "";
  if (!raw) return;

  const coordMatch = raw.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    handleMapPickerClick(lat, lng);
    if (mapPickerLeafletInstance) mapPickerLeafletInstance.setView([lat, lng], 14);
    return;
  }

  const coords = findCoordsForLocation(raw);
  if (coords) {
    selectMapPreset(cleanLocationName(raw), coords[0], coords[1]);
    return;
  }

  try {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(raw)}&limit=1`, {
      headers: { "Accept-Language": "es" }
    })
    .then(r => r.json())
    .then(data => {
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const name = cleanLocationName(raw);
        selectMapPreset(name, lat, lng);
      }
    })
    .catch(() => {});
  } catch (e) {}
}

function toggleMapPickerMode() {
  const leafletEl = document.getElementById("mapPickerLeaflet");
  const iframeEl = document.getElementById("mapPickerGmapsIframe");
  const btnToggle = document.getElementById("btnToggleMapMode");
  if (!leafletEl || !iframeEl) return;

  if (leafletEl.style.display !== "none") {
    leafletEl.style.display = "none";
    iframeEl.style.display = "block";
    const q = encodeURIComponent(currentPickedLocation.name || `${currentPickedLocation.lat},${currentPickedLocation.lng}`);
    iframeEl.src = `https://maps.google.com/maps?q=${q}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    if (btnToggle) btnToggle.textContent = "📍 Volver al Mapa Interactivo";
  } else {
    iframeEl.style.display = "none";
    leafletEl.style.display = "block";
    if (mapPickerLeafletInstance) {
      mapPickerLeafletInstance.invalidateSize();
      mapPickerLeafletInstance.setView([currentPickedLocation.lat, currentPickedLocation.lng], 13);
    }
    if (btnToggle) btnToggle.textContent = "🗺️ Vista Google Maps";
  }
}

function clearMapPickerSelection() {
  currentPickedLocation.name = "";
  updateMapPickerUI();
}

function confirmMapPickerSelection() {
  if (!mapPickerTargetInputId) return;
  const inputEl = document.getElementById(mapPickerTargetInputId);
  if (inputEl) {
    inputEl.value = currentPickedLocation.name || "";
    if (mapPickerTargetInputId.startsWith("routeModal")) {
      updateDedicatedRouteModalPreview();
    } else {
      updateModalRoutePreview();
    }
  }
  closeModal("modalMapPicker");
}

function updateItineraryDistancesDynamically() {
  if (!db) return;

  const processDayList = (daysList, currentTrip) => {
    if (!daysList || !Array.isArray(daysList)) return;
    daysList.forEach(d => {
      const metrics = getDayRouteMetrics(d, currentTrip);
      d.origin = metrics.origin;
      d.destination = metrics.destination;
      d.distanceKm = metrics.distanceKm;
      d.durationMin = metrics.durationMin;
      d.estimatedTime = metrics.durationFormatted;
      d.arrivalTime = metrics.arrivalTime;
      d.arrivalWithStopsTime = metrics.arrivalWithStopsTime;
      d.stopDurationMin = metrics.stopDurationMin;
      d.googleMapsUrl = metrics.googleMapsUrl;
      d.departureTime = metrics.departureTime;

      // Actualizar automáticamente también todas las líneas de actividades asociadas
      if (Array.isArray(d.activities) && d.activities.length > 0) {
        d.activities.forEach((act, actIdx) => {
          const actOrig = act.origin || (actIdx === 0 ? d.origin : "");
          const actDest = act.destination || (actIdx === 0 ? d.destination : "");
          const actDep = act.departureTime || d.departureTime || "09:00";
          const actStops = parseTimeToMinutes(act.stopDurationMin);
          const actStopCount = act.stopCount !== undefined ? act.stopCount : (actStops > 0 ? 1 : 0);

          if (actOrig && actDest) {
            const m = calculateRouteMetrics(actOrig, actDest, actDep, actStops, null, null, actStopCount);
            act.distanceKm = m.distanceKm;
            act.durationMin = m.durationMin;
            act.estimatedTime = m.durationFormatted;
            act.arrivalTime = m.arrivalTime;
            act.arrivalWithStopsTime = m.arrivalWithStopsTime;
            act.googleMapsUrl = m.googleMapsUrl;
          }
        });
      }
    });
  };

  const tripsToProcess = [];
  if (db.years) {
    Object.values(db.years).forEach(y => {
      if (y && y.trips && Array.isArray(y.trips)) {
        tripsToProcess.push(...y.trips);
      }
    });
  }
  if (db.trips && Array.isArray(db.trips)) {
    tripsToProcess.push(...db.trips);
  }

  // Actualizar todos los viajes de la base de datos
  tripsToProcess.forEach(tr => {
    if (tr.days && tr.days.length > 0) {
      processDayList(tr.days, tr);
    }
    if (tr.stages && tr.stages.length > 0) {
      tr.stages.forEach(st => {
        if (st.days) processDayList(st.days, tr);
      });
    }
  });

  saveDatabase(db);
}

function syncItineraryWithGoogleMaps() {
  updateItineraryDistancesDynamically();
  renderItineraryTab();
  showToast("Distancias y tiempos estimados de llegada actualizados con Google Maps", "success");
}

function renderDayLinksHtml(d) {
  if (!d) return "";
  const linksHtml = [];
  if (d.url) {
    linksHtml.push(`
      <a href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer" 
        style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 600; text-decoration: none;"
        title="${escapeHtml(d.url)}">
        🔗 ${escapeHtml(d.urlTitle || 'Enlace actividad')} ↗
      </a>
    `);
  }
  const textToSearch = [d.plan, d.planPrev, d.planNext].filter(Boolean).join(" ");
  const urlMatches = textToSearch.match(/(https?:\/\/[^\s<]+)/g);
  if (urlMatches) {
    const uniqueUrls = Array.from(new Set(urlMatches));
    uniqueUrls.forEach(u => {
      if (u !== d.url) {
        let clean = u.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        linksHtml.push(`
          <a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer" 
            style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 600; text-decoration: none;"
            title="${escapeHtml(u)}">
            🌐 ${escapeHtml(clean)} ↗
          </a>
        `);
      }
    });
  }
  if (linksHtml.length === 0) return "";
  return `<div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem;">${linksHtml.join("")}</div>`;
}

function renderDayRouteBoxHtml(day, trip, actIdx = 0) {
  const activities = getDayActivities(day);
  const act = activities[actIdx] || activities[0] || {};

  // Si la actividad está marcada sin desplazamiento, no se renderiza ninguna caja de ruta
  if (act.noDisplacement || (actIdx === 0 && day.noDisplacement)) {
    return "";
  }

  const orig = act.origin !== undefined ? act.origin : (actIdx === 0 ? day.origin : "");
  const dest = act.destination !== undefined ? act.destination : (actIdx === 0 ? day.destination : "");
  const depTime = act.departureTime || (actIdx === 0 ? day.departureTime : "09:00");
  const stopCount = act.stopCount !== undefined ? act.stopCount : (actIdx === 0 ? day.stopCount : 0);
  const stopMin = act.stopDurationMin !== undefined ? act.stopDurationMin : (actIdx === 0 ? day.stopDurationMin : 0);
  const customDist = act.customDist || (actIdx === 0 ? day.customDist : null);
  const customDur = act.customDuration || (actIdx === 0 ? day.customDuration : null);

  const m = calculateRouteMetrics(orig, dest, depTime, stopMin, customDist, customDur, stopCount);

  const originHtml = orig ? `
    <span class="route-point-tag origin" title="Punto de salida / origen en Google Maps">
      📍 <strong>Salida:</strong> ${escapeHtml(orig)}
    </span>
  ` : "";

  const destHtml = dest ? `
    <span class="route-point-tag destination" title="Punto de llegada / destino en Google Maps">
      🏁 <strong>Llegada:</strong> ${escapeHtml(dest)}
    </span>
  ` : "";

  const arrowHtml = (orig && dest) ? `<span class="route-arrow-icon">➔</span>` : "";

  const gmapsLinkHtml = (orig || dest) ? `
    <a href="${m.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-gmaps-link" title="Abrir y consultar ruta en Google Maps">
      <span>🗺️</span> Google Maps ↗
    </a>
  ` : "";

  // Botón con SOLAMENTE la imagen del lápiz como botón para modificar (Requisito 1)
  const editRouteBtnHtml = `
    <button type="button" class="btn-edit-route-inline no-print" onclick="openDayRouteModal(${day._origIndex}, ${actIdx})" title="Modificar ruta y paradas">✏️</button>
  `;

  // Métricas: si alguno de los apartados no está rellenado, no debe aparecer (Aspecto limpio)
  const depTimeHtml = (m.departureTime && (orig || dest)) ? `
    <span class="route-metric-pill" title="Hora de salida programada">
      ⏰ Salida: <strong>${m.departureTime}</strong>
    </span>
  ` : "";

  const distHtml = (m.distanceKm && m.distanceKm > 0) ? `
    <span class="route-metric-pill" title="Distancia por carretera calculada por Google Maps">
      🚗 Distancia: <strong>${m.distanceKm} km</strong>
    </span>
  ` : "";

  const durationHtml = (m.durationFormatted && m.durationMin > 0) ? `
    <span class="route-metric-pill" title="Tiempo neto estimado de desplazamiento">
      ⏱️ En ruta: <strong>${m.durationFormatted}</strong>
    </span>
  ` : "";

  const directArrivalHtml = (m.arrivalTime && m.arrivalTime !== "--:--") ? `
    <span class="route-metric-pill arrival-pill direct" title="1er cálculo: Hora estimada de llegada directa sin paradas">
      🏁 Llegada directa (sin paradas): <strong>${m.arrivalTime}</strong>
    </span>
  ` : "";

  const stopBadgeText = m.stopDurationMin > 0 ? `+${formatMinutesToHhMm(m.stopDurationMin)}` : "";
  const stopsArrivalHtml = (m.arrivalWithStopsTime && m.arrivalWithStopsTime !== "--:--" && m.stopDurationMin > 0) ? `
    <span class="route-metric-pill arrival-pill stops" title="2º cálculo: Hora estimada de llegada con paradas estimadas (${stopBadgeText})">
      🛑 Con paradas (${stopBadgeText}): <strong>${m.arrivalWithStopsTime}</strong>
    </span>
  ` : "";

  const metricsInnerHtml = `${depTimeHtml}${distHtml}${durationHtml}${directArrivalHtml}${stopsArrivalHtml}`.trim();
  const hasAnyEndpoints = Boolean(originHtml || destHtml);
  const hasAnyMetrics = Boolean(metricsInnerHtml);

  if (hasAnyEndpoints || hasAnyMetrics) {
    return `
      <div class="day-route-badge" style="margin-top: 0.35rem;">
        <div class="day-route-header">
          <div class="day-route-endpoints">
            ${originHtml}
            ${arrowHtml}
            ${destHtml}
            ${editRouteBtnHtml}
          </div>
          ${gmapsLinkHtml}
        </div>
        ${hasAnyMetrics ? `<div class="day-route-metrics">${metricsInnerHtml}</div>` : ""}
      </div>
    `;
  }

  return `
    <div style="margin-top: 0.25rem; display: inline-flex; align-items: center; gap: 0.4rem;">
      ${editRouteBtnHtml}
      <span style="font-size: 0.725rem; color: #94a3b8;">Establecer ruta</span>
    </div>
  `;
}

function renderDayActivitiesCell(day, trip) {
  const activities = getDayActivities(day);
  const isMultiple = activities.length > 1;

  // Días de transición entre etapas
  if (day.isTransition) {
    const palPrev = STAGE_COLOR_PALETTES[day.prevStageIndex % STAGE_COLOR_PALETTES.length];
    const palNext = STAGE_COLOR_PALETTES[day.nextStageIndex % STAGE_COLOR_PALETTES.length];
    const routeBox = renderDayRouteBoxHtml(day, trip, 0);

    return `
      <div class="transition-day-box" style="margin-bottom: 0.35rem;">
        <div class="transition-sub-plan" style="border-left: 4px solid ${palPrev.border};">
          <div style="font-size: 0.725rem; font-weight: 700; color: ${palPrev.nameColor}; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
            <span>🚗</span> <span>Salida / Trayecto de salida:</span>
          </div>
          <textarea class="inline-plan-input" 
            style="min-height: 34px;"
            placeholder="Actividad de salida de etapa anterior..."
            title="Haz clic para editar directamente"
            onchange="saveTransitionStageDayPlan(${day._stageIndex}, ${day._stageLocalIndex}, this.value)">${escapeHtml(day.planPrev || day.plan || '')}</textarea>
        </div>
        <div class="transition-sub-plan" style="border-left: 4px solid ${palNext.border};">
          <div style="font-size: 0.725rem; font-weight: 700; color: ${palNext.nameColor}; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
            <span>🏠</span> <span>Llegada / Trayecto de llegada:</span>
          </div>
          <textarea class="inline-plan-input" 
            style="min-height: 34px;"
            placeholder="Llegada e instalación en nueva etapa..."
            title="Haz clic para editar directamente"
            onchange="saveTransitionStageDayPlan(${day._stageNextIdx}, ${day._dayNextIdx}, this.value)">${escapeHtml(day.planNext || '')}</textarea>
        </div>
      </div>
      ${routeBox}
      ${renderDayLinksHtml(day)}
    `;
  }

  // Día normal con 1 actividad: Número y descripción en la misma línea con formato limpio
  if (!isMultiple) {
    const act = activities[0];
    const isNoDisp = Boolean(act.noDisplacement || day.noDisplacement);
    const routeBox = renderDayRouteBoxHtml(day, trip, 0);

    return `
      <div class="day-activities-container" data-day-orig-index="${day._origIndex}">
        <div class="day-activity-item" data-day-orig-index="${day._origIndex}" data-act-index="0" style="margin-bottom: 0.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.35rem; margin-bottom: 0.2rem;">
            <div style="display: flex; align-items: center; gap: 0.35rem; flex: 1;">
              <strong style="color: #2563eb; font-size: 0.825rem; white-space: nowrap;">1.</strong>
              <textarea class="inline-plan-input" 
                rows="1"
                placeholder="Escribe el plan o actividad..." 
                title="Haz clic para editar directamente"
                onchange="saveInlineDayPlan(${day._origIndex}, this.value)">${escapeHtml(day.plan || act.text || '')}</textarea>
            </div>
            ${isNoDisp ? `
              <span class="no-displacement-badge" title="Actividad sin desplazamiento asociado" style="font-size: 0.7rem; color: #15803d; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1px 6px; border-radius: 4px; white-space: nowrap; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                🚶 Sin desplazamiento
              </span>
            ` : ''}
          </div>
          ${routeBox}
        </div>
        <div style="margin-top: 0.25rem;">
          <button type="button" class="btn-add-activity-inline no-print" onclick="openDayModal(${day._origIndex})" title="Añadir más líneas de actividad a este día">
            + Añadir otra actividad
          </button>
        </div>
        ${renderDayLinksHtml(day)}
      </div>
    `;
  }

  // Día con múltiples líneas de actividades: Número y descripción en la MISMA LÍNEA, arrastrables y formato compacto
  const activitiesHtml = activities.map((act, actIdx) => {
    const isNoDisp = Boolean(act.noDisplacement);
    const routeBox = renderDayRouteBoxHtml(day, trip, actIdx);
    return `
      <div class="day-activity-item" draggable="true" data-day-orig-index="${day._origIndex}" data-act-index="${actIdx}">
        <div class="day-activity-text" style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem;">
          <div style="display: flex; align-items: center; gap: 0.35rem; flex: 1; min-width: 0;">
            <span class="activity-drag-handle" title="Arrastra para reordenar esta actividad dentro del día">⋮⋮</span>
            <strong style="color: #2563eb; font-size: 0.825rem; white-space: nowrap;">${actIdx + 1}.</strong>
            <span style="font-weight: 500; word-break: break-word;">${escapeHtml(act.text || '(Sin descripción)')}</span>
            ${isNoDisp ? `
              <span class="no-displacement-badge" title="Actividad sin desplazamiento asociado" style="font-size: 0.68rem; color: #15803d; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1px 5px; border-radius: 4px; margin-left: 0.35rem; font-weight: 600; white-space: nowrap; flex-shrink: 0;">
                🚶 Sin desplazamiento
              </span>
            ` : ''}
          </div>
          <button type="button" class="btn-edit-route-inline no-print" onclick="openDayRouteModal(${day._origIndex}, ${actIdx})" title="Configurar ruta para esta actividad">✏️</button>
        </div>
        ${routeBox}
      </div>
    `;
  }).join("");

  return `
    <div class="day-activities-container" data-day-orig-index="${day._origIndex}">
      ${activitiesHtml}
      <div style="margin-top: 0.25rem;">
        <button type="button" class="btn-add-activity-inline no-print" onclick="openDayModal(${day._origIndex})" title="Gestionar y añadir actividades a este día">
          + Gestionar actividades
        </button>
      </div>
      ${renderDayLinksHtml(day)}
    </div>
  `;
}

function renderItineraryTab() {
  const trip = getCurrentTrip();
  const banner = document.getElementById("tripAccommodationBanner");
  const title = document.getElementById("itineraryTableTitle");
  const tbody = document.getElementById("itineraryDaysTbody");

  if (!trip) {
    banner.innerHTML = `<p style="padding: 1rem; color: #64748b;">No hay viaje seleccionado.</p>`;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No hay viaje activo.</td></tr>`;
    if (title) title.textContent = "🗺️ Hoja de ruta (viaje o etapa asociada)";
    return;
  }

  let associatedName = trip.name || trip.title || "viaje o etapa asociada";
  if (trip.stages && trip.stages.length > 0) {
    const stagesSummary = trip.stages.map(s => s.name || s.destination).join(" • ");
    if (!trip.name.includes("(") && !trip.name.includes(" - ")) {
      associatedName = `${trip.name} (${stagesSummary})`;
    } else {
      associatedName = trip.name;
    }
  }
  title.textContent = `🗺️ Hoja de ruta (${associatedName})`;

  // Botón unificado para modificar datos generales del viaje
  const editTripBtnHtml = `
    <button class="btn btn-primary btn-sm" onclick="openTripModal(getCurrentTrip())" style="font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
      ✏️ Modificar datos generales
    </button>
  `;

  // Si tiene etapas (stages) como la Ruta Norte
  const hasStages = Boolean(trip.stages && trip.stages.length > 0);

  if (hasStages) {
    banner.innerHTML = `
      <div class="card" style="background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);">
        <div class="card-header" style="margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <h4 style="font-size: 1.1rem; color: #1e3a8a; font-weight: 700; margin: 0;">🏠 Datos viaje (${trip.stages.length} Etapas)</h4>
            <span class="badge badge-indigo">Total: ${trip.distanceKm || 1850} km</span>
          </div>
          ${editTripBtnHtml}
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          ${trip.stages.map((st, sIdx) => {
            const pal = STAGE_COLOR_PALETTES[sIdx % STAGE_COLOR_PALETTES.length];
            return `
              <div style="background: white; border: 1.5px solid ${pal.badgeBorder}; border-left: 5px solid ${pal.border}; border-radius: 10px; padding: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <strong style="color: #0f172a;">${pal.icon} ${st.name}</strong>
                  <span class="badge" style="background:${pal.badgeBg}; color:${pal.badgeText}; font-weight:700;">${st.nights} noches</span>
                </div>
                <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">${st.origin} ➔ ${st.destination}</p>
                <div style="font-size: 0.85rem; color: #334155; margin-bottom: 0.35rem;">
                  <strong>Alojamiento:</strong> ${st.accommodationName} (${st.platform})
                </div>
                ${st.url ? `
                  <div style="margin-bottom: 0.35rem;">
                    <a href="${escapeHtml(st.url)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 600; text-decoration: underline; font-size: 0.775rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                      🌐 Ver web alojamiento ↗
                    </a>
                  </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; border-top: 1px dashed #e2e8f0; padding-top: 0.35rem; margin-top: 0.35rem;">
                  <span>Coste: <strong>${formatCurrency(st.cost)}</strong></span>
                  <span style="color: ${st.pending > 0 ? '#b45309' : '#059669'}; font-weight: 600;">
                    ${st.pending > 0 ? 'Pendiente: ' + formatCurrency(st.pending) : 'Pagado'}
                  </span>
                </div>
                ${(st.dueDate || st.paymentMonth) ? `
                  <div style="font-size: 0.75rem; color: #dc2626; margin-top: 0.25rem; font-weight: 600;">
                    📅 Vence: ${formatDueDateDayMonth(st.dueDate, st.paymentMonth)}
                  </div>
                ` : ''}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  } else if (trip.accommodation) {
    const acc = trip.accommodation;
    banner.innerHTML = `
      <div class="card" style="background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);">
        <div class="card-header" style="margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <h4 style="font-size: 1.1rem; color: #065f46; font-weight: 700; margin: 0;">🏠 Datos viaje</h4>
            <span class="badge badge-emerald">${acc.nights || 0} noches confirmadas</span>
          </div>
          ${editTripBtnHtml}
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; font-size: 0.875rem;">
          <div>
            <div style="color: #64748b; font-size: 0.775rem;">Alojamiento / Camping:</div>
            <strong style="color: #0f172a; font-size: 1rem;">${acc.name || 'Por definir'}</strong>
            <div style="font-size: 0.8rem; color: #0284c7;">${acc.platform || 'Directo'}</div>
            ${acc.url ? `
              <div style="margin-top: 0.3rem;">
                <a href="${escapeHtml(acc.url)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 600; text-decoration: underline; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                  🌐 Ver web alojamiento ↗
                </a>
              </div>
            ` : ''}
          </div>
          <div>
            <div style="color: #64748b; font-size: 0.775rem;">Ruta y Trayecto:</div>
            <strong>${trip.origin || 'Castellón'} ➔ ${trip.destination || 'Destino'}</strong>
            <div style="font-size: 0.8rem; color: #64748b;">Distancia: ${trip.distanceKm ? trip.distanceKm + ' km' : 'Sin calcular'} (${trip.estimatedTime || 'Google Maps'})</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 0.775rem;">Coste Estancia:</div>
            <strong style="color: #059669; font-size: 1.15rem;">${formatCurrency(acc.totalCost)}</strong>
            <div style="font-size: 0.75rem; color: #64748b;">Media: ${acc.nights > 0 ? (acc.totalCost / acc.nights).toFixed(2) : 0} € / noche</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 0.775rem;">Estado de Pago:</div>
            <div style="font-weight: 700; color: ${acc.pendingCost > 0 ? '#b45309' : '#059669'};">
              ${acc.pendingCost > 0 ? 'Pendiente: ' + formatCurrency(acc.pendingCost) : 'Totalmente Pagado'}
            </div>
            ${(acc.dueDate || acc.paymentMonth) ? `
              <div style="font-size: 0.75rem; color: #dc2626; margin-top: 0.25rem; font-weight: 600;">
                📅 Vence: ${formatDueDateDayMonth(acc.dueDate, acc.paymentMonth)}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Recopilar todos los días del viaje preservando la continuidad de días y unificando transiciones
  let rawDays = [];
  if (hasStages) {
    let globalDayCounter = 1;
    let flattenedIndex = 0;
    trip.stages.forEach((st, sIdx) => {
      if (!st.days) return;
      st.days.forEach((d, localIdx) => {
        const curFlatIdx = flattenedIndex++;
        // Comprobar si este día es inicio de etapa y coincide en fecha con el fin de la etapa anterior
        if (sIdx > 0 && localIdx === 0 && rawDays.length > 0) {
          const prevDay = rawDays[rawDays.length - 1];
          if (prevDay.date && d.date && prevDay.date === d.date) {
            // Fusión de día de transición: no duplicamos la fila
            prevDay.isTransition = true;
            prevDay.planPrev = prevDay.plan;
            prevDay.planNext = d.plan;
            prevDay.prevStageIndex = prevDay._stageIndex;
            prevDay.prevStageName = prevDay.stageName;
            prevDay.nextStageIndex = sIdx;
            prevDay.nextStageName = st.name;
            prevDay._stageNextIdx = sIdx;
            prevDay._dayNextIdx = localIdx;
            prevDay._flatNextIdx = curFlatIdx;
            // Preservar la cena del alojamiento de llegada
            if (d.dinner && (!prevDay.dinner || prevDay.dinner === "Alojamiento")) {
              prevDay.dinner = d.dinner;
            }
            return;
          }
        }

        // Día normal
        rawDays.push({
          ...d,
          dayNum: globalDayCounter++, // Contador global continuo para todo el viaje
          _origIndex: curFlatIdx,
          _stageIndex: sIdx,
          _stageLocalIndex: localIdx,
          stageId: st.id,
          stageName: st.name,
          isTransition: false
        });
      });
    });
  } else if (trip.days && trip.days.length > 0) {
    rawDays = trip.days.map((d, i) => ({
      ...d,
      dayNum: d.dayNum || (i + 1),
      _origIndex: i,
      isTransition: false
    }));
  }

  if (rawDays.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">No hay días planificados aún para este viaje. Haz clic en <strong>+ Añadir Día</strong>.</td></tr>`;
    return;
  }

  // Ordenación dinámica según la fecha actual:
  // Antes de la llegada de la fecha del viaje, la hoja de ruta debe estar ordenada
  // por defecto por Día (Día 1, 2, 3...).
  // Conforme pasen los días de viaje, estos se irán desplazando al final de la lista.
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const upcomingOrToday = [];
  const pastDays = [];

  rawDays.forEach(d => {
    if (!d.date) {
      upcomingOrToday.push(d);
    } else if (d.date >= todayStr) {
      upcomingOrToday.push(d);
    } else {
      pastDays.push(d);
    }
  });

  let displayDays = [];
  let isAllPast = false;

  const hasTripStarted = pastDays.length > 0;

  if (!hasTripStarted) {
    // Antes de la llegada de la fecha: ordenado por defecto estrictamente por Día (1, 2, 3...)
    displayDays = [...rawDays].sort((a, b) => (a.dayNum || 0) - (b.dayNum || 0));
  } else if (upcomingOrToday.length > 0) {
    // Durante el transcurso del viaje: el día activo o restantes al inicio, y los pasados al final
    upcomingOrToday.sort((a, b) => (a.dayNum || 0) - (b.dayNum || 0));
    pastDays.sort((a, b) => (a.dayNum || 0) - (b.dayNum || 0));
    displayDays = [ ...upcomingOrToday, ...pastDays ];
  } else {
    // Si todos los días ya han pasado (viaje completado)
    isAllPast = true;
    displayDays = [...pastDays].sort((a, b) => (a.dayNum || 0) - (b.dayNum || 0));
  }

  // Si tiene etapas, renderizar la leyenda de etapas
  let stageLegendHtml = "";
  if (hasStages) {
    stageLegendHtml = `
      <div class="stages-legend-container no-print">
        <span class="stages-legend-title">📍 Etapas del viaje:</span>
        ${trip.stages.map((st, sIdx) => {
          const pal = STAGE_COLOR_PALETTES[sIdx % STAGE_COLOR_PALETTES.length];
          return `
            <span class="stage-badge-pill" style="background:${pal.badgeBg}; color:${pal.badgeText}; border:1.5px solid ${pal.badgeBorder};">
              ${pal.icon} ${st.name} (${st.nights} noches)
            </span>
          `;
        }).join("")}
      </div>
    `;
  }

  let tableHeaderLegend = document.getElementById("itineraryStageLegendWrapper");
  if (!tableHeaderLegend) {
    const parentCard = tbody.closest(".card");
    if (parentCard) {
      tableHeaderLegend = document.createElement("div");
      tableHeaderLegend.id = "itineraryStageLegendWrapper";
      parentCard.insertBefore(tableHeaderLegend, parentCard.querySelector(".table-responsive"));
    }
  }
  if (tableHeaderLegend) {
    tableHeaderLegend.innerHTML = stageLegendHtml;
  }

  // Generar las filas de la tabla
  let rowsHtml = [];
  let pastDividerRendered = false;

  displayDays.forEach((day, idx) => {
    const isPast = Boolean(day.date && day.date < todayStr);

    // Separador visual si hay días pasados desplazados al final
    if (!isAllPast && upcomingOrToday.length > 0 && pastDays.length > 0 && isPast && !pastDividerRendered) {
      pastDividerRendered = true;
      rowsHtml.push(`
        <tr class="itinerary-past-divider">
          <td colspan="7">
            ⬇️ Días pasados del viaje (desplazados automáticamente al final de la lista)
          </td>
        </tr>
      `);
    }

    const parsedLunch = parseMealString(day.lunch || "");
    const metaLunch = getMealTagMeta(parsedLunch.type);

    const parsedDinner = parseMealString(day.dinner || "");
    const metaDinner = getMealTagMeta(parsedDinner.type);

    // Color de la línea vertical según la etapa en la que nos encontremos
    let rowStageStyle = "";
    if (hasStages) {
      if (day.isTransition) {
        const palNext = STAGE_COLOR_PALETTES[day.nextStageIndex % STAGE_COLOR_PALETTES.length];
        const palPrev = STAGE_COLOR_PALETTES[day.prevStageIndex % STAGE_COLOR_PALETTES.length];
        rowStageStyle = `border-left: 6px solid ${palNext.border}; border-top: 1.5px dashed ${palPrev.border}; background: linear-gradient(90deg, ${palNext.bgTint} 0%, #ffffff 100%);`;
      } else if (typeof day._stageIndex === "number") {
        const pal = STAGE_COLOR_PALETTES[day._stageIndex % STAGE_COLOR_PALETTES.length];
        rowStageStyle = `border-left: 6px solid ${pal.border}; background-color: ${pal.bgTint};`;
      }
    }

    // Indicador temporal dinámico (Hoy / Próximo / Pasado)
    let statusBadgeHtml = "";
    let rowTimeClass = "";
    if (!isAllPast && upcomingOrToday.length > 0) {
      if (day === upcomingOrToday[0]) {
        if (day.date === todayStr) {
          statusBadgeHtml = `<span class="badge-pulse-today" style="margin-top:0.25rem;">🟢 ¡HOY EN RUTA!</span>`;
          rowTimeClass = "row-day-today";
        } else {
          statusBadgeHtml = ""; // Eliminado texto PRÓXIMO DÍA por petición de usuario
        }
      } else if (isPast) {
        statusBadgeHtml = `<span class="badge badge-gray" style="font-size:0.65rem; margin-top:0.25rem; display:inline-block;">✓ Pasado</span>`;
        rowTimeClass = "row-day-past";
      }
    } else if (isPast) {
      statusBadgeHtml = `<span class="badge badge-gray" style="font-size:0.65rem; margin-top:0.25rem; display:inline-block;">✓ Pasado</span>`;
      rowTimeClass = "row-day-past";
    }

    function renderDayLinksHtml(d) {
      const linksHtml = [];
      if (d.url) {
        linksHtml.push(`
          <a href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer" 
            style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 600; text-decoration: none;"
            title="${escapeHtml(d.url)}">
            🔗 ${escapeHtml(d.urlTitle || 'Enlace actividad')} ↗
          </a>
        `);
      }
      const textToSearch = [d.plan, d.planPrev, d.planNext].filter(Boolean).join(" ");
      const urlMatches = textToSearch.match(/(https?:\/\/[^\s<]+)/g);
      if (urlMatches) {
        const uniqueUrls = Array.from(new Set(urlMatches));
        uniqueUrls.forEach(u => {
          if (u !== d.url) {
            let clean = u.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
            linksHtml.push(`
              <a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer" 
                style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 600; text-decoration: none;"
                title="${escapeHtml(u)}">
                🌐 ${escapeHtml(clean)} ↗
              </a>
            `);
          }
        });
      }
      if (linksHtml.length === 0) return "";
      return `<div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem;">${linksHtml.join("")}</div>`;
    }

        // Renderizar celda de actividades y ruta (Requisitos 1, 3 y 6):
    // 1. Botón con SOLAMENTE la imagen del lápiz (✏️)
    // 3. Descripción y actividades del día en PRIMER lugar, luego la información de ruta
    // 6. Líneas con información de actividades y ruta asociada por línea
    const planCellHtml = renderDayActivitiesCell(day, trip);

rowsHtml.push(`
      <tr class="${rowTimeClass} itinerary-drag-row" 
          style="${rowStageStyle}" 
          draggable="true" 
          data-day-index="${idx}" 
          data-orig-index="${day._origIndex}">
        <td style="font-weight: 700; color: #1e293b; vertical-align: top; white-space: nowrap;">
          <span class="drag-handle-icon" title="Arrastra para reordenar este día">⋮⋮</span>
          <span style="font-size: 1.05rem; line-height: 1.2;">Día ${day.dayNum}</span>
          ${statusBadgeHtml}
        </td>
        <td style="vertical-align: top;"><span class="badge ${getWeekDayBadgeColor(day.weekDay)}">${day.weekDay || '-'}</span></td>
        <td style="font-size: 0.825rem; font-family: monospace; vertical-align: top;">${formatDateSpanish(day.date)}</td>
        <td style="vertical-align: top;">
          ${planCellHtml}
        </td>
        <td style="vertical-align: top;">
          <div class="inline-meal-editor">
            <div class="inline-meal-row">
              <select class="inline-meal-select ${metaLunch.tagClass}" 
                id="inline_lunch_select_${day._origIndex}"
                title="Seleccionar tipo de comida (Mediodía)"
                onchange="handleInlineMealSelectChange(${day._origIndex}, 'lunch', this.value)">
                <option value="" ${parsedLunch.type === '' ? 'selected' : ''}>— Ninguno —</option>
                <option value="Tránsito" ${parsedLunch.type === 'Tránsito' ? 'selected' : ''}>🚗 Tránsito</option>
                <option value="Alojamiento" ${parsedLunch.type === 'Alojamiento' ? 'selected' : ''}>🏠 Alojamiento</option>
                <option value="Bar/Restaurante" ${parsedLunch.type === 'Bar/Restaurante' ? 'selected' : ''}>🍽️ Bar/Restaurante</option>
                <option value="Picnic" ${parsedLunch.type === 'Picnic' ? 'selected' : ''}>🧺 Picnic</option>
                <option value="Barbacoa" ${parsedLunch.type === 'Barbacoa' ? 'selected' : ''}>🔥 Barbacoa</option>
                <option value="Otro" ${parsedLunch.type === 'Otro' ? 'selected' : ''}>🍴 Otro...</option>
              </select>
              <button type="button" class="btn-meal-bank-add" 
                onclick="goToMealBankForDay(${day._origIndex}, 'lunch')" 
                title="Acceder al Banco de comidas para inspirarte o asignar recetas">+</button>
            </div>
            <input type="text" class="inline-meal-detail" 
              id="inline_lunch_detail_${day._origIndex}"
              value="${escapeHtml(parsedLunch.detail)}" 
              placeholder="+ detalle / información..." 
              title="Escribir información adicional (Mediodía)"
              onchange="handleInlineMealDetailChange(${day._origIndex}, 'lunch', this.value)">
          </div>
        </td>
        <td style="vertical-align: top;">
          <div class="inline-meal-editor">
            <div class="inline-meal-row">
              <select class="inline-meal-select ${metaDinner.tagClass}" 
                id="inline_dinner_select_${day._origIndex}"
                title="Seleccionar tipo de comida (Cena)"
                onchange="handleInlineMealSelectChange(${day._origIndex}, 'dinner', this.value)">
                <option value="" ${parsedDinner.type === '' ? 'selected' : ''}>— Ninguno —</option>
                <option value="Alojamiento" ${parsedDinner.type === 'Alojamiento' ? 'selected' : ''}>🏠 Alojamiento</option>
                <option value="Bar/Restaurante" ${parsedDinner.type === 'Bar/Restaurante' ? 'selected' : ''}>🍽️ Bar/Restaurante</option>
                <option value="Barbacoa" ${parsedDinner.type === 'Barbacoa' ? 'selected' : ''}>🔥 Barbacoa</option>
                <option value="Tránsito" ${parsedDinner.type === 'Tránsito' ? 'selected' : ''}>🚗 Tránsito</option>
                <option value="Picnic" ${parsedDinner.type === 'Picnic' ? 'selected' : ''}>🧺 Picnic</option>
                <option value="Otro" ${parsedDinner.type === 'Otro' ? 'selected' : ''}>🍴 Otro...</option>
              </select>
              <button type="button" class="btn-meal-bank-add" 
                onclick="goToMealBankForDay(${day._origIndex}, 'dinner')" 
                title="Acceder al Banco de comidas para inspirarte o asignar recetas">+</button>
            </div>
            <input type="text" class="inline-meal-detail" 
              id="inline_dinner_detail_${day._origIndex}"
              value="${escapeHtml(parsedDinner.detail)}" 
              placeholder="+ detalle / información..." 
              title="Escribir información adicional (Cena)"
              onchange="handleInlineMealDetailChange(${day._origIndex}, 'dinner', this.value)">
          </div>
        </td>
        <td style="text-align: center; vertical-align: middle;" class="no-print">
          <button class="btn btn-secondary btn-sm" onclick="openDayRouteModal(${day._origIndex})" title="Establecer ruta y Google Maps">🗺️</button>
          <button class="btn btn-secondary btn-sm" onclick="openDayModal(${day._origIndex})" title="Abrir editor completo">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteDay(${day._origIndex})" title="Eliminar día">🗑️</button>
        </td>
      </tr>
    `);
  });

  tbody.innerHTML = rowsHtml.join("");
  initItineraryDragAndDrop();
}

let draggedDayIndex = null;
let draggedActInfo = null;

function attachItineraryActivityDragEvents() {
  const items = document.querySelectorAll(".day-activities-container .day-activity-item[draggable='true']");
  items.forEach(item => {
    item.addEventListener("dragstart", (e) => {
      const dayOrigIndex = parseInt(item.getAttribute("data-day-orig-index"), 10);
      const actIndex = parseInt(item.getAttribute("data-act-index"), 10);
      draggedActInfo = { dayOrigIndex, actIndex };
      item.classList.add("is-dragging");
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify(draggedActInfo));
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("is-dragging");
      document.querySelectorAll(".day-activity-item").forEach(it => it.classList.remove("drag-over-top", "drag-over-bottom"));
      draggedActInfo = null;
    });

    item.addEventListener("dragover", (e) => {
      if (!draggedActInfo) return;
      const targetDayOrig = parseInt(item.getAttribute("data-day-orig-index"), 10);
      const targetActIdx = parseInt(item.getAttribute("data-act-index"), 10);

      // Solo permitir mover actividades dentro del mismo día
      if (draggedActInfo.dayOrigIndex !== targetDayOrig || draggedActInfo.actIndex === targetActIdx) return;

      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = item.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        item.classList.add("drag-over-top");
        item.classList.remove("drag-over-bottom");
      } else {
        item.classList.add("drag-over-bottom");
        item.classList.remove("drag-over-top");
      }
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over-top", "drag-over-bottom");
    });

    item.addEventListener("drop", (e) => {
      if (!draggedActInfo) return;
      const targetDayOrig = parseInt(item.getAttribute("data-day-orig-index"), 10);
      const targetActIdx = parseInt(item.getAttribute("data-act-index"), 10);
      item.classList.remove("drag-over-top", "drag-over-bottom");

      if (draggedActInfo.dayOrigIndex !== targetDayOrig || draggedActInfo.actIndex === targetActIdx) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = item.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dropAfter = (e.clientY >= mid);

      handleReorderDayActivities(draggedActInfo.dayOrigIndex, draggedActInfo.actIndex, targetActIdx, dropAfter);
    });
  });
}

function handleReorderDayActivities(dayOrigIndex, fromIdx, toIdx, dropAfter = false) {
  const trip = getCurrentTrip();
  if (!trip) return;
  const targetDay = getDayObjectByIndex(trip, dayOrigIndex);
  if (!targetDay) return;

  const acts = getDayActivities(targetDay).slice();
  if (fromIdx < 0 || fromIdx >= acts.length || toIdx < 0 || toIdx >= acts.length || fromIdx === toIdx) return;

  const [movedAct] = acts.splice(fromIdx, 1);
  let insertAt = toIdx;
  if (fromIdx < toIdx) {
    insertAt = dropAfter ? toIdx : (toIdx - 1);
  } else {
    insertAt = dropAfter ? (toIdx + 1) : toIdx;
  }
  insertAt = Math.max(0, Math.min(acts.length, insertAt));
  acts.splice(insertAt, 0, movedAct);

  targetDay.activities = acts;
  targetDay.plan = acts.map(a => a.text).filter(Boolean).join("\n");
  if (acts[0]) {
    if (acts[0].origin !== undefined) targetDay.origin = acts[0].origin;
    if (acts[0].destination !== undefined) targetDay.destination = acts[0].destination;
    if (acts[0].departureTime !== undefined) targetDay.departureTime = acts[0].departureTime;
    if (acts[0].stopDurationMin !== undefined) targetDay.stopDurationMin = acts[0].stopDurationMin;
    if (acts[0].noDisplacement !== undefined) targetDay.noDisplacement = acts[0].noDisplacement;
  }

  saveDatabase(db);
  renderItineraryTab();
  showToast(`Actividades reordenadas en el Día ${targetDay.dayNum}.`, "success");
}

function initItineraryDragAndDrop() {
  const tbody = document.getElementById("itineraryDaysTbody");
  if (!tbody) return;

  const rows = tbody.querySelectorAll(".itinerary-drag-row");
  rows.forEach(row => {
    row.addEventListener("dragstart", (e) => {
      if (e.target.closest(".day-activity-item") || e.target.closest(".activity-drag-handle")) {
        return;
      }
      draggedDayIndex = parseInt(row.getAttribute("data-day-index"), 10);
      row.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", draggedDayIndex);
    });

    row.addEventListener("dragend", () => {
      row.classList.remove("is-dragging");
      rows.forEach(r => r.classList.remove("drag-over-top", "drag-over-bottom"));
      draggedDayIndex = null;
    });

    row.addEventListener("dragover", (e) => {
      if (draggedDayIndex === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const targetIdx = parseInt(row.getAttribute("data-day-index"), 10);
      if (draggedDayIndex === targetIdx) return;

      const rect = row.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        row.classList.add("drag-over-top");
        row.classList.remove("drag-over-bottom");
      } else {
        row.classList.add("drag-over-bottom");
        row.classList.remove("drag-over-top");
      }
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over-top", "drag-over-bottom");
    });

    row.addEventListener("drop", (e) => {
      if (draggedDayIndex === null) return;
      e.preventDefault();
      row.classList.remove("drag-over-top", "drag-over-bottom");
      const targetIdx = parseInt(row.getAttribute("data-day-index"), 10);
      if (isNaN(targetIdx) || draggedDayIndex === targetIdx) return;

      const rect = row.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dropAfter = (e.clientY >= mid);

      handleReorderItineraryDays(draggedDayIndex, targetIdx, dropAfter);
    });
  });

  attachItineraryActivityDragEvents();
}

function handleReorderItineraryDays(fromIdx, toIdx, dropAfter = false) {
  const trip = getCurrentTrip();
  if (!trip) return;

  if (trip.days && trip.days.length > 0) {
    if (fromIdx < 0 || fromIdx >= trip.days.length || toIdx < 0 || toIdx >= trip.days.length) return;

    const [movedDay] = trip.days.splice(fromIdx, 1);
    let insertAt = toIdx;
    if (fromIdx < toIdx) {
      insertAt = dropAfter ? toIdx : (toIdx - 1);
    } else {
      insertAt = dropAfter ? (toIdx + 1) : toIdx;
    }
    insertAt = Math.max(0, Math.min(trip.days.length, insertAt));
    trip.days.splice(insertAt, 0, movedDay);

    // Actualizar automáticamente el nº de día, el día de la semana y la fecha
    const baseStartDate = trip.startDate || trip.days[0]?.date || getTodayString();
    const baseDateObj = new Date(baseStartDate + "T00:00:00");

    trip.days.forEach((d, i) => {
      d.dayNum = i + 1;
      const curDateObj = new Date(baseDateObj);
      curDateObj.setDate(curDateObj.getDate() + i);
      const curIso = formatDateIso(curDateObj);
      d.date = curIso;
      d.weekDay = WEEKDAYS_MAP[curDateObj.getDay()];
    });

    saveDatabase(db);
    renderItineraryTab();
    showToast(`Día reordenado a la posición ${insertAt + 1}. Fechas y días de la semana recalculados.`, "success");
    return;
  }

  if (trip.stages && trip.stages.length > 0) {
    const allStageDays = [];
    const stageCounts = [];
    trip.stages.forEach(st => {
      const days = st.days || [];
      stageCounts.push(days.length);
      days.forEach(d => allStageDays.push(d));
    });

    if (fromIdx < 0 || fromIdx >= allStageDays.length || toIdx < 0 || toIdx >= allStageDays.length) return;

    const [movedDay] = allStageDays.splice(fromIdx, 1);
    let insertAt = toIdx;
    if (fromIdx < toIdx) {
      insertAt = dropAfter ? toIdx : (toIdx - 1);
    } else {
      insertAt = dropAfter ? (toIdx + 1) : toIdx;
    }
    insertAt = Math.max(0, Math.min(allStageDays.length, insertAt));
    allStageDays.splice(insertAt, 0, movedDay);

    const baseStartDate = trip.startDate || allStageDays[0]?.date || getTodayString();
    const baseDateObj = new Date(baseStartDate + "T00:00:00");

    allStageDays.forEach((d, i) => {
      d.dayNum = i + 1;
      const curDateObj = new Date(baseDateObj);
      curDateObj.setDate(curDateObj.getDate() + i);
      const curIso = formatDateIso(curDateObj);
      d.date = curIso;
      d.weekDay = WEEKDAYS_MAP[curDateObj.getDay()];
    });

    let cursor = 0;
    trip.stages.forEach((st, sIdx) => {
      const count = stageCounts[sIdx];
      st.days = allStageDays.slice(cursor, cursor + count);
      cursor += count;
    });

    saveDatabase(db);
    renderItineraryTab();
    showToast(`Día reordenado a la posición ${insertAt + 1}. Fechas y días de la semana recalculados.`, "success");
  }
}

function goToMealBankForDay(dayIndex, mealTime) {
  switchTab('tab-meals');
  const mealLabel = mealTime === 'lunch' ? 'Mediodía' : 'Cena';
  const currentTrip = getCurrentTrip();
  const day = currentTrip && currentTrip.itinerary ? currentTrip.itinerary[dayIndex] : null;
  const dayStr = day && day.dayNumber ? `Día ${day.dayNumber}` : (dayIndex !== undefined ? `Día ${Number(dayIndex) + 1}` : 'tu día seleccionado');
  showToast(`💡 Accediendo al Banco de comidas. Elige cualquier receta y pulsa "➡️ Asignar a mi viaje" para ${dayStr} (${mealLabel}).`);
  
  const container = document.getElementById("mealResourceCardsContainer");
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function getWeekDayBadgeColor(d) {
  if (!d) return "badge-gray";
  const upper = d.toUpperCase();
  if (upper === "S" || upper === "D") return "badge-amber";
  return "badge-blue";
}

function formatDateSpanish(str) {
  if (!str) return "-";
  if (str.includes("-")) {
    const parts = str.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return str;
}

function getMealTagMeta(type) {
  const lower = (type || "").toLowerCase().trim();
  if (!lower) {
    return { tagClass: "meal-tag-empty", icon: "⚪" };
  }
  if (lower.includes("picnic") || lower.includes("pícnic")) {
    return { tagClass: "meal-tag-picnic", icon: "🧺" };
  }
  if (lower.includes("tránsito") || lower.includes("transito")) {
    return { tagClass: "meal-tag-transit", icon: "🚗" };
  }
  if (lower.includes("barbacoa") || lower.includes("brasa")) {
    return { tagClass: "meal-tag-bbq", icon: "🔥" };
  }
  if (lower.includes("restaurante") || lower.includes("bar") || lower.includes("pintxos")) {
    return { tagClass: "meal-tag-restaurant", icon: "🍽️" };
  }
  if (lower.includes("alojamiento") || lower.includes("camping") || lower.includes("apartamento") || lower.includes("casa")) {
    return { tagClass: "meal-tag-lodging", icon: "🏠" };
  }
  return { tagClass: "meal-tag-sobras", icon: "🍴" };
}

function formatMealTag(text) {
  if (!text || text === "-" || String(text).trim() === "") return `<span style="color: #94a3b8; font-size: 0.825rem;">-</span>`;
  
  const parsed = parseMealString(text);
  if (!parsed.type && !parsed.detail) {
    return `<span style="color: #94a3b8; font-size: 0.825rem;">-</span>`;
  }

  const meta = getMealTagMeta(parsed.type);

  if (parsed.type && !parsed.detail) {
    return `
      <div class="meal-display">
        <span class="meal-tag ${meta.tagClass}">${meta.icon} ${escapeHtml(parsed.type)}</span>
      </div>
    `;
  }

  if (!parsed.type && parsed.detail) {
    return `
      <div class="meal-display">
        <span class="meal-detail-text">${escapeHtml(parsed.detail)}</span>
      </div>
    `;
  }

  return `
    <div class="meal-display">
      <span class="meal-tag ${meta.tagClass}">${meta.icon} ${escapeHtml(parsed.type)}</span>
      <span class="meal-detail-text">${escapeHtml(parsed.detail)}</span>
    </div>
  `;
}

function composeMealString(type, detail) {
  const cleanType = (type || "").trim();
  const cleanDetail = (detail || "").trim();

  if (!cleanType && !cleanDetail) return "";
  if (!cleanType) return cleanDetail;
  if (cleanType === "Otro") return cleanDetail || "Otro";
  if (cleanDetail) return `${cleanType} (${cleanDetail})`;
  return cleanType;
}

function normalizeMealType(str) {
  if (!str) return null;
  const lower = str.toLowerCase().trim();
  if (lower === "tránsito" || lower === "transito" || lower === "en ruta") return "Tránsito";
  if (lower === "alojamiento" || lower === "apartamento" || lower === "camping" || lower === "cámping" || lower === "casa") return "Alojamiento";
  if (lower === "bar/restaurante" || lower === "bar-restaurante" || lower === "restaurante" || lower === "bar") return "Bar/Restaurante";
  if (lower === "picnic" || lower === "pícnic") return "Picnic";
  if (lower === "barbacoa" || lower === "brasa") return "Barbacoa";
  if (lower === "otro") return "Otro";
  return null;
}

function parseMealString(str) {
  if (!str) return { type: "", detail: "" };
  if (typeof str === "object" && str.type !== undefined) {
    return { type: str.type || "", detail: str.detail || "" };
  }
  const raw = String(str).trim();
  if (!raw || raw === "-" || raw === "(Ninguno)" || raw === "Sin definir") {
    return { type: "", detail: "" };
  }

  // 1. Formato: "Tipo (Detalle)"
  const parenMatch = raw.match(/^([A-Za-záéíóúÁÉÍÓÚñÑ\/\-\s]+?)\s*\((.+)\)$/);
  if (parenMatch) {
    const norm = normalizeMealType(parenMatch[1].trim());
    if (norm) {
      return { type: norm, detail: parenMatch[2].trim() };
    }
  }

  // 2. Formato: "Tipo: Detalle" o "Tipo - Detalle"
  const colonMatch = raw.match(/^([A-Za-záéíóúÁÉÍÓÚñÑ\/\-\s]+?)\s*[:\-]\s*(.+)$/);
  if (colonMatch) {
    const norm = normalizeMealType(colonMatch[1].trim());
    if (norm) {
      return { type: norm, detail: colonMatch[2].trim() };
    }
  }

  // 3. Etiqueta exacta sin detalle
  const normExact = normalizeMealType(raw);
  if (normExact) {
    return { type: normExact, detail: (normExact === "Alojamiento" && raw.toLowerCase() === "casa") ? "En casa" : "" };
  }

  // 4. Comida sin etiqueta (ej. asignada del banco de comidas solo con su nombre)
  return { type: "", detail: raw };
}

function getDayObjectByIndex(trip, index) {
  if (!trip) return null;
  if (trip.days && trip.days[index]) {
    return trip.days[index];
  }
  if (trip.stages) {
    let count = 0;
    for (let s of trip.stages) {
      if (s.days) {
        if (index < count + s.days.length) {
          return s.days[index - count];
        }
        count += s.days.length;
      }
    }
  }
  return null;
}

function saveInlineDayPlan(index, value) {
  const trip = getCurrentTrip();
  if (!trip) return;
  const targetDay = getDayObjectByIndex(trip, index);
  if (targetDay) {
    targetDay.plan = (value || "").trim();
    saveDatabase(db);
    showToast("Plan del día guardado", "success");
  }
}

function saveTransitionStageDayPlan(stageIdx, localIdx, value) {
  const trip = getCurrentTrip();
  if (!trip || !trip.stages || !trip.stages[stageIdx]) return;
  const stage = trip.stages[stageIdx];
  if (!stage.days || !stage.days[localIdx]) return;
  stage.days[localIdx].plan = (value || "").trim();
  saveDatabase(db);
  showToast("Plan de etapa guardado", "success");
}

function handleInlineMealSelectChange(index, mealKey, newType) {
  const trip = getCurrentTrip();
  if (!trip) return;
  const targetDay = getDayObjectByIndex(trip, index);
  if (!targetDay) return;

  const selectEl = document.getElementById(`inline_${mealKey}_select_${index}`) ||
                   document.getElementById(`inline_meals_${mealKey}_select_${index}`);
  const detailEl = document.getElementById(`inline_${mealKey}_detail_${index}`) ||
                   document.getElementById(`inline_meals_${mealKey}_detail_${index}`);
  const detailVal = detailEl ? detailEl.value.trim() : "";

  if (selectEl) {
    if (selectEl.value !== newType) selectEl.value = newType;
    const meta = getMealTagMeta(newType);
    selectEl.className = `inline-meal-select ${meta.tagClass}`;
  }

  const combined = composeMealString(newType, detailVal);
  targetDay[mealKey] = combined;
  saveDatabase(db);
  showToast(`${mealKey === 'lunch' ? 'Mediodía' : 'Cena'} actualizado`, "success");
}

function handleInlineMealDetailChange(index, mealKey, newDetail) {
  const trip = getCurrentTrip();
  if (!trip) return;
  const targetDay = getDayObjectByIndex(trip, index);
  if (!targetDay) return;

  const selectEl = document.getElementById(`inline_${mealKey}_select_${index}`) ||
                   document.getElementById(`inline_meals_${mealKey}_select_${index}`);
  const typeVal = selectEl ? selectEl.value : "";

  const combined = composeMealString(typeVal, newDetail);
  targetDay[mealKey] = combined;
  saveDatabase(db);
  showToast(`Detalle de ${mealKey === 'lunch' ? 'mediodía' : 'cena'} guardado`, "success");
}

// ------------------------------------------------------------
// GESTIÓN DE DÍAS (MODAL Y CRUD)
// ------------------------------------------------------------
function openDayModal(index = -1) {
  const trip = getCurrentTrip();
  if (!trip) {
    alert("Debes seleccionar o crear un viaje primero.");
    return;
  }

  const modal = document.getElementById("modalDay");
  document.getElementById("dayEditIndex").value = index;

  const selectLunch = document.getElementById("selectDayLunchType");
  const inputLunchDetail = document.getElementById("inputDayLunchDetail");
  const selectDinner = document.getElementById("selectDayDinnerType");
  const inputDinnerDetail = document.getElementById("inputDayDinnerDetail");

  const targetDay = index >= 0 ? getDayObjectByIndex(trip, index) : null;
  const inputUrl = document.getElementById("inputDayUrl");
  const inputUrlTitle = document.getElementById("inputDayUrlTitle");
  const inputOrigin = document.getElementById("inputDayOrigin");
  const inputDestination = document.getElementById("inputDayDestination");
  const inputDepTime = document.getElementById("inputDayDepartureTime");
  const inputStopMinutes = document.getElementById("inputDayStopMinutes");

  if (targetDay) {
    document.getElementById("modalDayTitle").textContent = `Editar Día ${targetDay.dayNum}`;
    document.getElementById("inputDayNum").value = targetDay.dayNum;
    document.getElementById("inputDayWeekDay").value = targetDay.weekDay || "";
    document.getElementById("inputDayDate").value = targetDay.date || "";
    document.getElementById("inputDayPlan").value = targetDay.plan || "";
    modalDayActivitiesListState = JSON.parse(JSON.stringify(getDayActivities(targetDay)));
    renderModalActivitiesList();
    if (inputUrl) inputUrl.value = targetDay.url || "";
    if (inputUrlTitle) inputUrlTitle.value = targetDay.urlTitle || "";

    const routeInfo = getDayRouteMetrics(targetDay, trip);
    if (inputOrigin) inputOrigin.value = targetDay.origin || routeInfo.origin || "";
    if (inputDestination) inputDestination.value = targetDay.destination || routeInfo.destination || "";
    if (inputDepTime) inputDepTime.value = targetDay.departureTime || routeInfo.departureTime || "09:00";
    if (inputStopMinutes) inputStopMinutes.value = formatMinutesToHhMm((targetDay.stopDurationMin !== undefined && targetDay.stopDurationMin !== null) ? targetDay.stopDurationMin : routeInfo.stopDurationMin);

    updateModalRoutePreview();

    const parsedLunch = parseMealString(targetDay.lunch || "");
    if (selectLunch) selectLunch.value = parsedLunch.type;
    if (inputLunchDetail) inputLunchDetail.value = parsedLunch.detail;

    const parsedDinner = parseMealString(targetDay.dinner || "");
    if (selectDinner) selectDinner.value = parsedDinner.type;
    if (inputDinnerDetail) inputDinnerDetail.value = parsedDinner.detail;
  } else {
    const totalExisting = trip.days ? trip.days.length : (trip.stages ? trip.stages.reduce((acc, s) => acc + (s.days?.length || 0), 0) : 0);
    document.getElementById("modalDayTitle").textContent = "Añadir Nuevo Día de Itinerario";
    document.getElementById("inputDayNum").value = totalExisting + 1;

    // Calcular fecha por defecto: día siguiente al último existente o fecha de inicio del viaje
    let defaultDate = "";
    if (trip.days && trip.days.length > 0) {
      const last = trip.days[trip.days.length - 1];
      if (last && last.date) {
        const lastDate = new Date(last.date + "T00:00:00");
        lastDate.setDate(lastDate.getDate() + 1);
        defaultDate = formatDateIso(lastDate);
      }
    } else if (trip.stages && trip.stages.length > 0) {
      const lastStage = trip.stages[trip.stages.length - 1];
      const lastDay = lastStage.days && lastStage.days[lastStage.days.length - 1];
      if (lastDay && lastDay.date) {
        const lastDate = new Date(lastDay.date + "T00:00:00");
        lastDate.setDate(lastDate.getDate() + 1);
        defaultDate = formatDateIso(lastDate);
      }
    }
    if (!defaultDate) {
      defaultDate = trip.startDate || getTodayString();
    }

    document.getElementById("inputDayDate").value = defaultDate;

    // Día de la Semana, por defecto, corresponde al día marcado en el calendario
    const dObj = new Date(defaultDate + "T00:00:00");
    document.getElementById("inputDayWeekDay").value = !isNaN(dObj.getTime()) ? WEEKDAYS_MAP[dObj.getDay()] : "L";

    document.getElementById("inputDayPlan").value = "";
    modalDayActivitiesListState = [{
      text: "",
      origin: trip.origin ? cleanLocationName(trip.origin) : "Castellón",
      destination: trip.destination ? cleanLocationName(trip.destination) : "",
      departureTime: "09:00",
      stopCount: 0,
      stopDurationMin: 0,
      showRoute: false
    }];
    renderModalActivitiesList();
    if (inputUrl) inputUrl.value = "";
    if (inputUrlTitle) inputUrlTitle.value = "";

    if (inputOrigin) inputOrigin.value = trip.origin ? cleanLocationName(trip.origin) : "Castellón";
    if (inputDestination) inputDestination.value = trip.destination ? cleanLocationName(trip.destination) : "";
    if (inputDepTime) inputDepTime.value = "09:00";
    if (inputStopMinutes) inputStopMinutes.value = "00:00";

    updateModalRoutePreview();

    if (selectLunch) selectLunch.value = "Tránsito";
    if (inputLunchDetail) inputLunchDetail.value = "";

    if (selectDinner) selectDinner.value = "Alojamiento";
    if (inputDinnerDetail) inputDinnerDetail.value = "";
  }

  openModal("modalDay");
}

function handleSaveDay(e) {
  e.preventDefault();
  const trip = getCurrentTrip();
  if (!trip) return;

  const index = parseInt(document.getElementById("dayEditIndex").value);

  const selectLunch = document.getElementById("selectDayLunchType");
  const inputLunchDetail = document.getElementById("inputDayLunchDetail");
  const lunchType = selectLunch ? selectLunch.value : "";
  const lunchDetail = inputLunchDetail ? inputLunchDetail.value.trim() : "";
  const finalLunch = composeMealString(lunchType, lunchDetail);

  const selectDinner = document.getElementById("selectDayDinnerType");
  const inputDinnerDetail = document.getElementById("inputDayDinnerDetail");
  const dinnerType = selectDinner ? selectDinner.value : "";
  const dinnerDetail = inputDinnerDetail ? inputDinnerDetail.value.trim() : "";
  const finalDinner = composeMealString(dinnerType, dinnerDetail);

  const inputUrl = document.getElementById("inputDayUrl");
  const inputUrlTitle = document.getElementById("inputDayUrlTitle");
  const urlVal = inputUrl ? inputUrl.value.trim() : "";
  const urlTitleVal = inputUrlTitle ? inputUrlTitle.value.trim() : "";

  const inputOrigin = document.getElementById("inputDayOrigin");
  const inputDestination = document.getElementById("inputDayDestination");
  const inputDepTime = document.getElementById("inputDayDepartureTime");
  const inputStopMinutes = document.getElementById("inputDayStopMinutes");
  const originVal = inputOrigin ? inputOrigin.value.trim() : "";
  const destVal = inputDestination ? inputDestination.value.trim() : "";
  const depTimeVal = inputDepTime ? inputDepTime.value.trim() || "09:00" : "09:00";
  const stopMinVal = parseTimeToMinutes(inputStopMinutes ? inputStopMinutes.value : "00:00");

  const metrics = calculateRouteMetrics(originVal, destVal, depTimeVal, stopMinVal);
  const hasCompleteRoute = Boolean(originVal && destVal);

  // Persistir líneas de actividades y ruta asociada
  const activitiesData = (modalDayActivitiesListState && modalDayActivitiesListState.length > 0)
    ? modalDayActivitiesListState.map(a => ({
        text: a.text || "",
        noDisplacement: Boolean(a.noDisplacement),
        origin: a.noDisplacement ? "" : (a.origin || ""),
        destination: a.noDisplacement ? "" : (a.destination || ""),
        departureTime: a.departureTime || "09:00",
        stopCount: a.stopCount !== undefined ? parseInt(a.stopCount, 10) : ((a.stopDurationMin > 0) ? 1 : 0),
        stopDurationMin: parseInt(a.stopDurationMin, 10) || 0,
        customDist: a.customDist || null,
        customDuration: a.customDuration || null
      }))
    : [{
        text: document.getElementById("inputDayPlan").value.trim(),
        origin: originVal,
        destination: destVal,
        departureTime: depTimeVal,
        stopCount: parseInt(document.getElementById("inputDayStopCount")?.value, 10) || 0,
        stopDurationMin: stopMinVal
      }];

  const primaryAct = activitiesData[0] || {};
  if (!originVal && primaryAct.origin) originVal = primaryAct.origin;
  if (!destVal && primaryAct.destination) destVal = primaryAct.destination;

  const planVal = activitiesData.map(a => a.text).filter(Boolean).join("\n") || document.getElementById("inputDayPlan").value.trim();

  const dayData = {
    activities: activitiesData,
    dayNum: parseInt(document.getElementById("inputDayNum").value) || 1,
    weekDay: document.getElementById("inputDayWeekDay").value.trim().toUpperCase(),
    date: document.getElementById("inputDayDate").value,
    plan: document.getElementById("inputDayPlan").value.trim(),
    origin: originVal,
    destination: destVal,
    departureTime: depTimeVal,
    stopDurationMin: stopMinVal,
    distanceKm: hasCompleteRoute ? metrics.distanceKm : null,
    durationMin: hasCompleteRoute ? metrics.durationMin : null,
    estimatedTime: hasCompleteRoute ? metrics.durationFormatted : "",
    arrivalTime: hasCompleteRoute ? metrics.arrivalTime : "",
    arrivalWithStopsTime: hasCompleteRoute ? metrics.arrivalWithStopsTime : "",
    googleMapsUrl: metrics.googleMapsUrl,
    lunch: finalLunch,
    dinner: finalDinner,
    url: urlVal,
    urlTitle: urlTitleVal
  };

  const targetDay = index >= 0 ? getDayObjectByIndex(trip, index) : null;

  if (targetDay) {
    targetDay.dayNum = dayData.dayNum;
    targetDay.weekDay = dayData.weekDay;
    targetDay.date = dayData.date;
    targetDay.plan = planVal;
    targetDay.activities = activitiesData;
    targetDay.origin = originVal;
    targetDay.destination = destVal;
    targetDay.departureTime = depTimeVal;
    targetDay.stopDurationMin = stopMinVal;
    targetDay.distanceKm = hasCompleteRoute ? metrics.distanceKm : null;
    targetDay.durationMin = hasCompleteRoute ? metrics.durationMin : null;
    targetDay.estimatedTime = hasCompleteRoute ? metrics.durationFormatted : "";
    targetDay.arrivalTime = hasCompleteRoute ? metrics.arrivalTime : "";
    targetDay.arrivalWithStopsTime = hasCompleteRoute ? metrics.arrivalWithStopsTime : "";
    targetDay.googleMapsUrl = metrics.googleMapsUrl;
    targetDay.lunch = dayData.lunch;
    targetDay.dinner = dayData.dinner;
    targetDay.url = urlVal;
    targetDay.urlTitle = urlTitleVal;
    showToast("Día actualizado con éxito", "success");
  } else {
    // Añadir nuevo día al viaje
    if (trip.stages && trip.stages.length > 0) {
      const lastStage = trip.stages[trip.stages.length - 1];
      if (!lastStage.days) lastStage.days = [];
      lastStage.days.push(dayData);
    } else {
      if (!trip.days) trip.days = [];
      trip.days.push(dayData);
    }
    showToast("Nuevo día añadido al itinerario", "success");
  }

  saveDatabase(db);
  closeModal("modalDay");
  renderItineraryTab();
  renderMealsTab();
}

function deleteDay(index) {
  const trip = getCurrentTrip();
  if (!trip) return;
  const targetDay = getDayObjectByIndex(trip, index);
  if (!targetDay) return;

  if (confirm(`¿Estás seguro de que deseas eliminar el día ${targetDay.dayNum}?`)) {
    if (trip.days && trip.days[index]) {
      trip.days.splice(index, 1);
    } else if (trip.stages) {
      let count = 0;
      for (let s of trip.stages) {
        if (s.days) {
          if (index < count + s.days.length) {
            s.days.splice(index - count, 1);
            break;
          }
          count += s.days.length;
        }
      }
    }
    saveDatabase(db);
    renderItineraryTab();
    renderMealsTab();
    showToast("Día eliminado", "warning");
  }
}

// ------------------------------------------------------------
// PESTAÑA: BANCO DE COMIDAS Y RECURSOS
// ------------------------------------------------------------
let currentMealResourceFilter = 'all';
let currentMealTagFilter = null;
let currentHistoricalTripKey = 'asturias';
let newMealSelectedTags = [];

function isRestaurantMeal(text) {
  if (!text || text === "-" || text.trim() === "") return false;
  const lower = text.toLowerCase().trim();
  if (lower.includes("tránsito") || lower.includes("transito") || lower.includes("bocadillo") || 
      lower.includes("ensalada") || lower.includes("pasta") || lower.includes("tortellini") || 
      lower.includes("barbacoa") || lower.includes("brasa") || lower.includes("sobras") || 
      lower.includes("alojamiento") || lower.includes("apartamento") || lower.includes("cámping") || 
      lower.includes("camping") || lower.includes("picnic") || lower.includes("pícnic") || 
      lower.includes("fajitas") || lower.includes("san jacobo") || lower.includes("quiche") || 
      lower.includes("hamburguesa") || lower.includes("perrito") || lower.includes("canelones") || 
      lower.includes("pescado") || lower.includes("sopa") || lower.includes("tortilla") ||
      lower.includes("pizza") || lower.includes("empanada") || lower.includes("casa")) {
    return false;
  }
  if (lower.includes("restaurante") || lower.includes("bar") || lower.includes("sidrería") || 
      lower.includes("asador") || lower.includes("mesón") || lower.includes("menú del día")) {
    return true;
  }
  return true;
}

function getAvailableMealTags() {
  const catList = (typeof STANDARD_MEAL_CATEGORIES !== "undefined" ? STANDARD_MEAL_CATEGORIES : ["Tránsito", "Alojamiento", "Bar/Restaurante", "Picnic", "Barbacoa", "Otro"]);
  const tagsSet = new Set(db.mealTags || []);
  if (db.mealCatalog) {
    db.mealCatalog.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => {
          const clean = String(t).trim();
          if (clean && !catList.includes(clean)) {
            tagsSet.add(clean);
          }
        });
      }
    });
  }
  // Excluir categorías de la lista de etiquetas
  catList.forEach(c => tagsSet.delete(c));
  return Array.from(tagsSet).sort((a, b) => a.localeCompare(b, 'es'));
}

function renderMealsTab() {
  renderMealTagsFilterBar();
  renderMealResourceBank();
  renderHistoricalMeals(currentHistoricalTripKey);
}

function renderMealTagsFilterBar() {
  const bar = document.getElementById("mealTagFilterBar");
  if (!bar) return;

  const availableTags = getAvailableMealTags();

  let pillsHtml = `
    <span style="font-size: 0.8rem; color: #64748b; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem;">
      🏷️ Filtrar por etiquetas:
    </span>
    <button class="tag-filter-pill ${currentMealTagFilter === null ? 'active' : ''}" onclick="setMealTagFilter(null)">
      🌟 Todas
    </button>
  `;

  if (availableTags.length === 0) {
    pillsHtml += `<span style="font-size: 0.775rem; color: #94a3b8; font-style: italic;">(Crea tus etiquetas en "+ Añadir Plato" o "⚙️ Gestionar")</span>`;
  } else {
    pillsHtml += availableTags.map(tag => {
      return `
        <button class="tag-filter-pill ${currentMealTagFilter === tag ? 'active' : ''}" onclick="setMealTagFilter('${escapeHtml(tag)}')">
          🏷️ ${escapeHtml(tag)}
        </button>
      `;
    }).join("");
  }

  pillsHtml += `
    <button type="button" class="btn btn-secondary btn-sm" onclick="openManageMealTagsModal()" style="font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 9999px; margin-left: auto; font-weight: 700;" title="Modificar o suprimir etiquetas ya creadas">
      ⚙️ Gestionar etiquetas
    </button>
  `;

  bar.innerHTML = pillsHtml;
}

function openManageMealTagsModal() {
  renderManageTagsList();
  const input = document.getElementById("inputModalCreateTag");
  if (input) input.value = "";
  openModal("modalManageMealTags");
}

function renderManageTagsList() {
  const container = document.getElementById("manageTagsListContainer");
  if (!container) return;

  const availableTags = getAvailableMealTags();

  if (availableTags.length === 0) {
    container.innerHTML = `<p style="color: #64748b; font-size: 0.85rem; text-align: center; padding: 1.5rem;">No hay etiquetas creadas todavía.</p>`;
    return;
  }

  // Contar cuántos platos usan cada etiqueta
  const tagCounts = {};
  if (db.mealCatalog) {
    db.mealCatalog.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });
  }

  container.innerHTML = availableTags.map(tag => {
    const count = tagCounts[tag] || 0;
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.55rem 0.85rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 700; color: #1e293b; font-size: 0.9rem;">🏷️ ${escapeHtml(tag)}</span>
          <span style="font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 0.15rem 0.45rem; border-radius: 9999px;">
            ${count} plato${count === 1 ? '' : 's'}
          </span>
        </div>
        <div style="display: flex; gap: 0.35rem;">
          <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.55rem;" onclick="editMealTag('${escapeHtml(tag)}')">
            ✏️ Modificar
          </button>
          <button class="btn btn-danger btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.55rem;" onclick="deleteMealTag('${escapeHtml(tag)}')">
            🗑️ Suprimir
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function handleCreateTagFromManageModal() {
  const input = document.getElementById("inputModalCreateTag");
  if (!input) return;
  const newTag = input.value.trim();
  if (!newTag) return;

  const catList = (typeof STANDARD_MEAL_CATEGORIES !== "undefined" ? STANDARD_MEAL_CATEGORIES : ["Tránsito", "Alojamiento", "Bar/Restaurante", "Picnic", "Barbacoa", "Otro"]);
  if (catList.includes(newTag)) {
    alert(`"${newTag}" es una categoría fija. Usa las categorías para clasificar platos.`);
    return;
  }

  if (!db.mealTags) db.mealTags = [];
  if (db.mealTags.includes(newTag)) {
    alert(`La etiqueta "${newTag}" ya existe.`);
    return;
  }

  db.mealTags.push(newTag);
  db.mealTags.sort((a, b) => a.localeCompare(b, 'es'));
  saveDatabase(db);
  input.value = "";
  renderManageTagsList();
  renderMealTagsFilterBar();
  showToast(`Etiqueta "${newTag}" creada con éxito`, "success");
}

function editMealTag(oldTag) {
  const newTag = prompt(`Modificar nombre de la etiqueta "${oldTag}":`, oldTag);
  if (newTag === null) return;
  const trimmed = newTag.trim();
  if (!trimmed) {
    alert("El nombre de la etiqueta no puede estar vacío.");
    return;
  }
  if (trimmed === oldTag) return;

  const catList = (typeof STANDARD_MEAL_CATEGORIES !== "undefined" ? STANDARD_MEAL_CATEGORIES : ["Tránsito", "Alojamiento", "Bar/Restaurante", "Picnic", "Barbacoa", "Otro"]);
  if (catList.includes(trimmed)) {
    alert(`"${trimmed}" es una categoría principal fija.`);
    return;
  }

  // Actualizar en db.mealTags
  if (!db.mealTags) db.mealTags = [];
  const idx = db.mealTags.indexOf(oldTag);
  if (idx >= 0) {
    db.mealTags[idx] = trimmed;
  } else {
    db.mealTags.push(trimmed);
  }

  db.mealTags = Array.from(new Set(db.mealTags)).sort((a, b) => a.localeCompare(b, 'es'));

  // Actualizar en todos los platos del catálogo
  if (db.mealCatalog) {
    db.mealCatalog.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags = m.tags.map(t => t === oldTag ? trimmed : t);
        m.tags = Array.from(new Set(m.tags)).sort((a, b) => a.localeCompare(b, 'es'));
      }
    });
  }

  if (currentMealTagFilter === oldTag) {
    currentMealTagFilter = trimmed;
  }

  saveDatabase(db);
  renderManageTagsList();
  renderMealTagsFilterBar();
  renderMealResourceBank();
  showToast(`Etiqueta modificada: "${oldTag}" → "${trimmed}"`, "success");
}

function deleteMealTag(tagToDelete) {
  if (!confirm(`¿Estás seguro de que deseas suprimir la etiqueta "${tagToDelete}"?\nSe desvinculará de todos los platos del banco.`)) {
    return;
  }

  // Eliminar de db.mealTags
  if (db.mealTags) {
    db.mealTags = db.mealTags.filter(t => t !== tagToDelete);
  }

  // Eliminar de todos los platos del catálogo
  if (db.mealCatalog) {
    db.mealCatalog.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags = m.tags.filter(t => t !== tagToDelete);
      }
    });
  }

  if (currentMealTagFilter === tagToDelete) {
    currentMealTagFilter = null;
  }

  saveDatabase(db);
  renderManageTagsList();
  renderMealTagsFilterBar();
  renderMealResourceBank();
  showToast(`Etiqueta "${tagToDelete}" suprimida con éxito`, "warning");
}

function setMealTagFilter(tag) {
  currentMealTagFilter = tag;
  renderMealTagsFilterBar();
  renderMealResourceBank();
}

function setMealResourceFilter(cat) {
  currentMealResourceFilter = cat;
  document.querySelectorAll(".resource-filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-cat") === cat);
  });
  renderMealResourceBank();
}

function filterMealResources() {
  renderMealResourceBank();
}

function renderMealResourceBank() {
  const container = document.getElementById("mealResourceCardsContainer");
  const countBadge = document.getElementById("mealResourceCountBadge");
  if (!container) return;

  const catalog = db.mealCatalog || (typeof INITIAL_TRIP_DATABASE !== "undefined" ? INITIAL_TRIP_DATABASE.mealCatalog : []) || [];
  const searchVal = (document.getElementById("inputSearchMeals") ? document.getElementById("inputSearchMeals").value : "").toLowerCase().trim();

  // Filtrar platos del banco
  let filtered = catalog.filter(item => {
    const typeLower = (item.type || "").toLowerCase();
    const nameLower = (item.name || "").toLowerCase();

    // Filtro por categoría seleccionada (botones de filtro superior)
    if (currentMealResourceFilter !== 'all') {
      const targetFilter = currentMealResourceFilter;
      const isBarRest = (targetFilter === 'Bar/Restaurante' || targetFilter === 'Bar-Restaurante');
      
      const hasTypeMatch = item.type === targetFilter ||
        (isBarRest && (typeLower.includes('restaurante') || typeLower.includes('bar'))) ||
        (targetFilter === 'Tránsito' && (typeLower.includes('tránsito') || typeLower.includes('transito') || typeLower.includes('en ruta'))) ||
        (targetFilter === 'Picnic' && (typeLower.includes('picnic') || typeLower.includes('pícnic'))) ||
        (targetFilter === 'Alojamiento' && (typeLower.includes('alojamiento') || typeLower.includes('cocina'))) ||
        (targetFilter === 'Barbacoa' && (typeLower.includes('barbacoa') || typeLower.includes('brasa'))) ||
        (targetFilter === 'Otro' && item.type === 'Otro');

      if (!hasTypeMatch) return false;
    } else {
      // Por defecto en 'all', si no se busca restaurante expresamente, centrarse en recursos autogestionados
      const isRestaurante = typeLower.includes("restaurante") || nameLower.includes("restaurante");
      if (isRestaurante && !searchVal.includes("restaurante") && !searchVal.includes("bar")) {
        return false;
      }
    }

    // Filtro por etiqueta (Tag) seleccionada
    if (currentMealTagFilter) {
      const tagTarget = currentMealTagFilter.toLowerCase();
      const hasTag = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase() === tagTarget);
      if (!hasTag) {
        return false;
      }
    }

    // Filtro por texto de búsqueda (nombre, notas, tipo o etiquetas)
    if (searchVal) {
      const matchName = nameLower.includes(searchVal);
      const matchNote = (item.note || "").toLowerCase().includes(searchVal);
      const matchType = typeLower.includes(searchVal);
      const matchTags = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(searchVal));
      if (!matchName && !matchNote && !matchType && !matchTags) return false;
    }

    return true;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} idea${filtered.length === 1 ? '' : 's'} disponible${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <span style="font-size: 2rem;">🔍</span>
        <h4 style="margin: 0.5rem 0 0.25rem; color: #334155;">No se encontraron ideas con ese filtro</h4>
        <p style="font-size: 0.85rem; margin: 0;">Prueba a buscar con otra palabra, selecciona otra etiqueta o añade una nueva idea al banco.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    if (!item.id) item.id = 'meal_' + Math.random().toString(36).substr(2, 9);
    const meta = getMealTagMeta(item.type);
    const itemTags = Array.isArray(item.tags) ? item.tags : [];

    return `
      <div class="meal-resource-card">
        <div>
          <div class="resource-header">
            <span class="meal-tag ${meta.tagClass}">${meta.icon} ${escapeHtml(item.type || 'Casero')}</span>
            <div class="resource-actions" style="display: flex; gap: 0.35rem; align-items: center;">
              <button class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="openEditMealResourceModal('${item.id}')" title="Modificar este plato">✏️</button>
              <button class="btn btn-danger btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="deleteMealResource('${item.id}')" title="Borrar este plato del banco">🗑️</button>
            </div>
          </div>
          <div class="resource-title">${escapeHtml(item.name)}</div>
          
          ${itemTags.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.4rem 0 0.5rem;">
              ${itemTags.map(t => `
                <span class="meal-chip-tag" onclick="setMealTagFilter('${escapeHtml(t)}')" title="Filtrar por etiqueta '${escapeHtml(t)}'">
                  🏷️ ${escapeHtml(t)}
                </span>
              `).join("")}
            </div>
          ` : ''}

          <div class="resource-note">${escapeHtml(item.note || 'Plato probado y práctico para viaje')}</div>
        </div>
        <div class="resource-footer">
          <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.55rem;" onclick="copyMealItemToClipboard('${escapeHtml(item.name)}')">
            📋 Copiar
          </button>
          <button class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="openAssignMealModal('${escapeHtml(item.name)}', '${escapeHtml(item.type)}')">
            ➡️ Asignar a mi viaje
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function switchHistoricalTrip(tripKey) {
  currentHistoricalTripKey = tripKey;
  ['asturias', 'disney', 'girona'].forEach(k => {
    const btn = document.getElementById(`btnHist_${k}`);
    if (btn) {
      if (k === tripKey) {
        btn.className = "btn btn-primary btn-sm";
      } else {
        btn.className = "btn btn-secondary btn-sm";
      }
    }
  });
  renderHistoricalMeals(tripKey);
}

function toggleHistoricalRestaurantFilter() {
  renderHistoricalMeals(currentHistoricalTripKey);
}

function renderHistoricalMeals(tripKey) {
  const container = document.getElementById("historicalMealsContainer");
  if (!container) return;

  const menusBank = db.historicalMenus || (typeof INITIAL_TRIP_DATABASE !== "undefined" ? INITIAL_TRIP_DATABASE.historicalMenus : null) || {};
  const historicalTrip = menusBank[tripKey];

  if (!historicalTrip || !historicalTrip.days) {
    container.innerHTML = `<p style="padding: 1rem; color: #64748b;">No se encontraron datos para este histórico.</p>`;
    return;
  }

  const hideRestaurants = document.getElementById("chkFilterOnlyNonRestaurant") ? document.getElementById("chkFilterOnlyNonRestaurant").checked : true;

  // Filtrar los días según la preferencia:
  let displayDays = historicalTrip.days;
  if (hideRestaurants) {
    // Mostrar los días que tengan al menos una comida casera/en ruta
    displayDays = historicalTrip.days.filter(d => {
      const lunchIsRest = isRestaurantMeal(d.lunch);
      const dinnerIsRest = isRestaurantMeal(d.dinner);
      return (!lunchIsRest || !dinnerIsRest);
    });
  }

  container.innerHTML = `
    <div style="margin-top: 0.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        <h4 style="font-size: 0.95rem; color: #1e293b; font-weight: 700;">
          📜 Menús reales de: ${historicalTrip.name} (${displayDays.length} días mostrados)
        </h4>
        <span style="font-size: 0.8rem; color: #64748b;">
          💡 Haz clic en <strong>📋 Copiar al Viaje</strong> para asignar cualquier menú a un día de tu viaje actual.
        </span>
      </div>
      <div class="table-responsive">
        <table class="custom-table" style="font-size: 0.825rem;">
          <thead>
            <tr>
              <th style="width: 45px;">Día</th>
              <th style="width: 45px;">D.S.</th>
              <th>Actividad / Lugar</th>
              <th style="width: 250px;">Mediodía</th>
              <th style="width: 250px;">Cena</th>
              <th style="width: 140px; text-align: center;">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${displayDays.map((hd, hidx) => {
              const lunchIsRest = isRestaurantMeal(hd.lunch);
              const dinnerIsRest = isRestaurantMeal(hd.dinner);

              const lunchDisplay = lunchIsRest 
                ? `<div class="meal-display"><span class="badge badge-gray" style="font-size: 0.75rem;">🍽️ Fuera / Restaurante: ${escapeHtml(hd.lunch)}</span></div>`
                : formatMealTag(hd.lunch);

              const dinnerDisplay = dinnerIsRest
                ? `<div class="meal-display"><span class="badge badge-gray" style="font-size: 0.75rem;">🍽️ Fuera / Restaurante: ${escapeHtml(hd.dinner)}</span></div>`
                : formatMealTag(hd.dinner);

              return `
                <tr>
                  <td style="font-weight: 700;">${hd.dayNum}</td>
                  <td><span class="badge ${getWeekDayBadgeColor(hd.weekDay)}">${hd.weekDay || '-'}</span></td>
                  <td><strong>${escapeHtml(hd.plan)}</strong></td>
                  <td>${lunchDisplay}</td>
                  <td>${dinnerDisplay}</td>
                  <td style="text-align: center;">
                    <button class="btn btn-secondary btn-sm" onclick="copyHistoricalMealToCurrent('${escapeHtml(hd.lunch)}', '${escapeHtml(hd.dinner)}')">
                      📋 Copiar al Viaje
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function copyHistoricalMealToCurrent(lunch, dinner) {
  const trip = getCurrentTrip();
  if (!trip || !trip.days || trip.days.length === 0) {
    alert("Crea primero días en tu itinerario actual para poder asignarles este menú.");
    return;
  }

  const dayOptions = trip.days.map((d, i) => `${d.dayNum}: Día ${d.dayNum} (${d.plan ? d.plan.substring(0, 22) + '...' : 'Sin plan'})`).join("\n");
  const chosenDay = prompt(`Selecciona el número de día de tu viaje actual donde quieres copiar este menú:\n\n- Mediodía: ${lunch}\n- Cena: ${dinner}\n\nDías disponibles:\n${dayOptions}\n\nEscribe el número de día:`, "1");

  if (chosenDay) {
    const num = parseInt(chosenDay);
    const targetDay = trip.days.find(d => d.dayNum === num);
    if (targetDay) {
      if (lunch && !isRestaurantMeal(lunch)) targetDay.lunch = lunch;
      else if (lunch) targetDay.lunch = lunch;

      if (dinner && !isRestaurantMeal(dinner)) targetDay.dinner = dinner;
      else if (dinner) targetDay.dinner = dinner;

      saveDatabase(db);
      renderItineraryTab();
      renderMealsTab();
      showToast(`¡Menú copiado al Día ${num} de ${trip.name}!`, "success");
    } else {
      alert("Número de día no encontrado en el viaje actual.");
    }
  }
}

function openNewMealResourceModal() {
  document.getElementById("formNewMealResource").reset();
  const editIdInput = document.getElementById("inputEditMealResourceId");
  if (editIdInput) editIdInput.value = "";
  const titleEl = document.getElementById("modalMealResourceTitle");
  if (titleEl) titleEl.textContent = "💡 Añadir Plato al Banco de Comidas";
  newMealSelectedTags = [];
  renderNewMealModalTags();
  openModal("modalNewMealResource");
}

function openEditMealResourceModal(mealId) {
  if (!db.mealCatalog) db.mealCatalog = [];
  const item = db.mealCatalog.find(m => m.id === mealId);
  if (!item) return;

  const editIdInput = document.getElementById("inputEditMealResourceId");
  if (editIdInput) editIdInput.value = item.id;

  const titleEl = document.getElementById("modalMealResourceTitle");
  if (titleEl) titleEl.textContent = "✏️ Modificar Plato del Banco";

  const nameInput = document.getElementById("inputNewResourceName");
  if (nameInput) nameInput.value = item.name || "";

  const typeSelect = document.getElementById("selectNewResourceType");
  if (typeSelect) typeSelect.value = item.type || "Alojamiento";

  const noteInput = document.getElementById("inputNewResourceNote");
  if (noteInput) noteInput.value = item.note || "";

  newMealSelectedTags = Array.isArray(item.tags) ? [...item.tags] : [];
  renderNewMealModalTags();

  openModal("modalNewMealResource");
}

function deleteMealResource(mealId) {
  if (!db.mealCatalog) db.mealCatalog = [];
  const item = db.mealCatalog.find(m => m.id === mealId);
  if (!item) return;

  if (!confirm(`¿Estás seguro de que deseas eliminar "${item.name}" del banco de comidas?`)) {
    return;
  }

  db.mealCatalog = db.mealCatalog.filter(m => m.id !== mealId);
  saveDatabase(db);
  renderMealTagsFilterBar();
  renderMealResourceBank();
  showToast(`Plato "${item.name}" eliminado del Banco de Comidas`, "success");
}

function renderNewMealModalTags() {
  const suggestedContainer = document.getElementById("suggestedMealTagsContainer");
  if (!suggestedContainer) return;

  const availableTags = getAvailableMealTags();
  newMealSelectedTags.forEach(t => {
    if (!availableTags.includes(t)) availableTags.push(t);
  });

  if (availableTags.length === 0) {
    suggestedContainer.innerHTML = `<span style="font-size: 0.8rem; color: #94a3b8; font-style: italic;">Escribe una etiqueta arriba y pulsa "+ Añadir Etiqueta" para clasificar este plato.</span>`;
    return;
  }

  suggestedContainer.innerHTML = availableTags.map(t => {
    const isSelected = newMealSelectedTags.includes(t);
    return `
      <button type="button" 
        class="suggested-tag-btn ${isSelected ? 'selected' : ''}" 
        style="${isSelected ? 'background: #4f46e5; color: white; border-color: #4338ca; font-weight: 700;' : 'background: #f8fafc; color: #334155; border: 1px solid #cbd5e1;'} padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.825rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;"
        onclick="toggleSuggestedMealTag('${escapeHtml(t)}')">
        <span>${isSelected ? '✓' : '+'}</span>
        <span>🏷️ ${escapeHtml(t)}</span>
      </button>
    `;
  }).join("");
}

function createAndSelectMealTag() {
  const input = document.getElementById("inputNewCustomTag");
  if (!input) return;
  const tagVal = input.value.trim();
  if (!tagVal) return;

  if (!newMealSelectedTags.includes(tagVal)) {
    newMealSelectedTags.push(tagVal);
  }

  if (!db.mealTags) db.mealTags = [];
  if (!db.mealTags.includes(tagVal)) {
    db.mealTags.push(tagVal);
    saveDatabase(db);
    renderMealTagsFilterBar();
  }

  input.value = "";
  renderNewMealModalTags();
}

function toggleSuggestedMealTag(tag) {
  if (newMealSelectedTags.includes(tag)) {
    newMealSelectedTags = newMealSelectedTags.filter(t => t !== tag);
  } else {
    newMealSelectedTags.push(tag);
  }
  renderNewMealModalTags();
}

function removeSelectedMealTag(tag) {
  newMealSelectedTags = newMealSelectedTags.filter(t => t !== tag);
  renderNewMealModalTags();
}

function handleSaveMealResource(e) {
  e.preventDefault();
  const name = document.getElementById("inputNewResourceName").value.trim();
  const type = document.getElementById("selectNewResourceType").value;
  const note = document.getElementById("inputNewResourceNote").value.trim();
  const editId = document.getElementById("inputEditMealResourceId") ? document.getElementById("inputEditMealResourceId").value : "";

  if (!name) return;

  if (!db.mealCatalog) db.mealCatalog = [];

  const tagsToSave = [...newMealSelectedTags];
  if (!db.mealTags) db.mealTags = [];
  tagsToSave.forEach(t => {
    if (!db.mealTags.includes(t)) db.mealTags.push(t);
  });

  if (editId) {
    const existingIndex = db.mealCatalog.findIndex(m => m.id === editId);
    if (existingIndex >= 0) {
      db.mealCatalog[existingIndex] = {
        ...db.mealCatalog[existingIndex],
        name,
        type,
        note,
        tags: tagsToSave
      };
      showToast(`¡"${name}" actualizado en el Banco de Comidas!`, "success");
    }
  } else {
    db.mealCatalog.unshift({
      id: 'meal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      type,
      note,
      tags: tagsToSave
    });
    showToast(`¡"${name}" añadido al Banco de Comidas!`, "success");
  }

  saveDatabase(db);
  closeModal("modalNewMealResource");
  renderMealTagsFilterBar();
  renderMealResourceBank();
}

function openAssignMealModal(dishName, dishType) {
  const yearData = db.years[currentYear];
  if (!yearData || !yearData.trips || yearData.trips.length === 0) {
    alert("No hay viajes configurados en el año actual para asignar platos.");
    return;
  }

  // Ordenar viajes cronológicamente: el próximo viaje primero, los pasados al final
  const todayStr = getTodayString();
  const sortedTrips = [...yearData.trips].sort((a, b) => {
    const rA = getTripDateRange(a);
    const rB = getTripDateRange(b);
    const aPast = rA.end < todayStr;
    const bPast = rB.end < todayStr;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return rA.start.localeCompare(rB.start);
  });

  const tripSelect = document.getElementById("selectAssignMealTrip");
  if (tripSelect) {
    tripSelect.innerHTML = sortedTrips.map((t, idx) => {
      const range = getTripDateRange(t);
      const isPast = range.end < todayStr;
      const isOngoing = range.start <= todayStr && todayStr <= range.end;
      let badgeText = "";
      if (isOngoing) badgeText = " [🟢 En curso]";
      else if (!isPast && idx === 0) badgeText = " [⭐ Próximo]";
      else if (isPast) badgeText = " [✓ Pasado]";

      const datesLabel = range.start ? ` (${formatDateSpanish(range.start)} al ${formatDateSpanish(range.end)})` : "";
      return `<option value="${t.id}">${escapeHtml(t.title || t.name)}${datesLabel}${badgeText}</option>`;
    }).join("");
  }

  const nameEl = document.getElementById("assignMealDishName");
  if (nameEl) nameEl.textContent = dishName;
  const hiddenName = document.getElementById("assignMealHiddenName");
  if (hiddenName) hiddenName.value = dishName;
  const hiddenType = document.getElementById("assignMealHiddenType");
  if (hiddenType) hiddenType.value = dishType || "Alojamiento";

  const meta = getMealTagMeta(dishType);
  const catEl = document.getElementById("assignMealDishCategory");
  if (catEl) catEl.innerHTML = `<span class="meal-tag ${meta.tagClass}">${meta.icon} ${escapeHtml(dishType || 'Casero')}</span>`;

  // Disparar carga de etapas y días del viaje seleccionado
  handleAssignMealTripChange();

  openModal("modalAssignMealToTrip");
}

function handleAssignMealTripChange() {
  const tripSelect = document.getElementById("selectAssignMealTrip");
  const stageGroup = document.getElementById("assignMealStageGroup");
  const stageSelect = document.getElementById("selectAssignMealStage");
  if (!tripSelect) return;

  const tripId = tripSelect.value;
  const yearData = db.years[currentYear];
  if (!yearData || !yearData.trips) return;
  const trip = yearData.trips.find(t => t.id === tripId);
  if (!trip) return;

  if (trip.stages && trip.stages.length > 0) {
    if (stageGroup) stageGroup.style.display = "block";
    if (stageSelect) {
      stageSelect.innerHTML = `<option value="ALL">Todas las etapas del viaje</option>` +
        trip.stages.map((st, i) => `<option value="${st.id || ('st_' + i)}">📍 ${escapeHtml(st.name || ('Etapa ' + (i + 1)))}${st.accommodationName ? ' (' + escapeHtml(st.accommodationName) + ')' : ''}</option>`).join("");
    }
  } else {
    if (stageGroup) stageGroup.style.display = "none";
  }

  handleAssignMealStageChange();
}

function handleAssignMealStageChange() {
  const tripSelect = document.getElementById("selectAssignMealTrip");
  const stageSelect = document.getElementById("selectAssignMealStage");
  const daySelect = document.getElementById("selectAssignMealDay");
  if (!tripSelect || !daySelect) return;

  const tripId = tripSelect.value;
  const yearData = db.years[currentYear];
  if (!yearData || !yearData.trips) return;
  const trip = yearData.trips.find(t => t.id === tripId);
  if (!trip) return;

  const selectedStageId = (stageSelect && trip.stages && trip.stages.length > 0) ? stageSelect.value : "ALL";

  let daysList = [];

  if (trip.stages && trip.stages.length > 0) {
    let dayCount = 1;
    trip.stages.forEach((st, stIdx) => {
      const thisStageId = st.id || ('st_' + stIdx);
      if (selectedStageId === "ALL" || selectedStageId === thisStageId) {
        if (st.days && Array.isArray(st.days)) {
          st.days.forEach((d, dIdx) => {
            daysList.push({
              stageId: thisStageId,
              stageName: st.name,
              dayIndex: dIdx,
              globalDayNum: dayCount,
              day: d
            });
            dayCount++;
          });
        }
      } else {
        dayCount += (st.days ? st.days.length : 0);
      }
    });
  } else if (trip.days && Array.isArray(trip.days)) {
    trip.days.forEach((d, dIdx) => {
      daysList.push({
        stageId: null,
        stageName: null,
        dayIndex: dIdx,
        globalDayNum: d.dayNum || (dIdx + 1),
        day: d
      });
    });
  }

  if (daysList.length === 0) {
    daySelect.innerHTML = `<option value="">(No hay días configurados en este itinerario)</option>`;
    daySelect.disabled = true;
  } else {
    daySelect.disabled = false;
    daySelect.innerHTML = daysList.map(item => {
      const d = item.day;
      const stageBadge = item.stageName ? ` [${item.stageName}]` : '';
      const planPreview = d.plan ? ` - ${escapeHtml(d.plan.substring(0, 35))}${d.plan.length > 35 ? '...' : ''}` : '';
      const valStr = JSON.stringify({
        tripId: trip.id,
        stageId: item.stageId,
        dayIndex: item.dayIndex,
        date: d.date || ''
      });

      return `<option value="${escapeHtml(valStr)}">
        Día ${item.globalDayNum}${d.date ? ' (' + formatDateSpanish(d.date) + ')' : ''}${stageBadge}${planPreview}
      </option>`;
    }).join("");
  }
}

function handleConfirmAssignMeal(e) {
  if (e) e.preventDefault();
  const daySelect = document.getElementById("selectAssignMealDay");
  if (!daySelect || !daySelect.value) {
    alert("Por favor, selecciona un día válido.");
    return;
  }

  let targetInfo;
  try {
    targetInfo = JSON.parse(daySelect.value);
  } catch (err) {
    alert("Error al resolver el día seleccionado.");
    return;
  }

  const mealTimeRadio = document.querySelector('input[name="assignMealTime"]:checked');
  const mealTime = mealTimeRadio ? mealTimeRadio.value : 'lunch';
  const dishName = document.getElementById("assignMealHiddenName").value;
  const dishType = document.getElementById("assignMealHiddenType").value;

  const yearData = db.years[currentYear];
  if (!yearData || !yearData.trips) return;
  const trip = yearData.trips.find(t => t.id === targetInfo.tripId);
  if (!trip) return;

  let targetDay = null;
  if (targetInfo.stageId && trip.stages) {
    const stage = trip.stages.find((st, idx) => (st.id === targetInfo.stageId || ('st_' + idx) === targetInfo.stageId));
    if (stage && stage.days && stage.days[targetInfo.dayIndex]) {
      targetDay = stage.days[targetInfo.dayIndex];
    }
  } else if (trip.days && trip.days[targetInfo.dayIndex]) {
    targetDay = trip.days[targetInfo.dayIndex];
  }

  // Fallback por fecha si el índice se desplazase
  if (!targetDay && targetInfo.date) {
    if (trip.stages) {
      for (const st of trip.stages) {
        if (st.days) {
          const d = st.days.find(x => x.date === targetInfo.date);
          if (d) { targetDay = d; break; }
        }
      }
    } else if (trip.days) {
      targetDay = trip.days.find(x => x.date === targetInfo.date);
    }
  }

  if (!targetDay) {
    alert("No se pudo localizar el día seleccionado en el viaje.");
    return;
  }

  // Mantener la selección del desplegable de comida del día (o categoría del plato si no tenía)
  const currentParsed = parseMealString(targetDay[mealTime] || "");
  const selectedType = currentParsed.type || normalizeMealType(dishType) || "";
  targetDay[mealTime] = composeMealString(selectedType, dishName);

  saveDatabase(db);
  closeModal("modalAssignMealToTrip");
  renderItineraryTab();
  showToast(`¡"${dishName}" asignado al itinerario de ${trip.title || trip.name} (${mealTime === 'lunch' ? 'Mediodía' : 'Cena'})!`, "success");
}

function copyMealItemToClipboard(dishName) {
  navigator.clipboard.writeText(dishName);
  showToast(`Copiado al portapapeles: ${dishName}`, "success");
}

// ------------------------------------------------------------
// PESTAÑA: ENTRADAS Y ACTIVIDADES
// ------------------------------------------------------------
let currentTicketsTripFilter = 'ALL';

function handleTicketsTripFilterChange(val) {
  currentTicketsTripFilter = val;
  renderTicketsTab();
}

function handleTicketTripChange() {
  const tripSelect = document.getElementById("inputTicketTripId");
  const stageSelect = document.getElementById("inputTicketStageId");
  const stageGroup = document.getElementById("ticketStageGroup");
  if (!tripSelect || !stageSelect) return;

  const tripId = tripSelect.value;
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];
  const trip = trips.find(t => t.id === tripId);

  if (trip && trip.stages && trip.stages.length > 0) {
    stageSelect.innerHTML = `<option value="">— Sin etapa / General del viaje —</option>` +
      trip.stages.map((st, i) => `<option value="${st.id || ('st_' + i)}">📍 ${escapeHtml(st.name || ('Etapa ' + (i + 1)))}</option>`).join("");
    if (stageGroup) stageGroup.style.display = "block";
    stageSelect.disabled = false;
  } else {
    stageSelect.innerHTML = `<option value="">— Sin etapas / Viaje único —</option>`;
    if (stageGroup) stageGroup.style.display = "none";
    stageSelect.disabled = true;
  }
}

function renderTicketsTab() {
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];
  const tbody = document.getElementById("ticketsTbody");
  const totalAmountEl = document.getElementById("totalTicketsAmount");
  const filterSelect = document.getElementById("filterTicketsTripSelect");

  if (filterSelect) {
    filterSelect.innerHTML = `<option value="ALL">Mostrar todos los viajes (${trips.length})</option>` +
      trips.map(t => `<option value="${t.id}" ${t.id === currentTicketsTripFilter ? 'selected' : ''}>${escapeHtml(t.title || t.name)}</option>`).join("");
    filterSelect.value = currentTicketsTripFilter;
  }

  // Recolectar entradas según el filtro
  let allTickets = [];
  trips.forEach(t => {
    if (currentTicketsTripFilter === 'ALL' || currentTicketsTripFilter === t.id) {
      const tickets = t.tickets || [];
      tickets.forEach((tk, idx) => {
        if (!tk.id) tk.id = 't_' + t.id + '_' + (idx + 1);
        allTickets.push({
          ...tk,
          _tripId: t.id,
          _tripTitle: t.title || t.name
        });
      });
    }
  });

  if (!tbody || !totalAmountEl) return;

  if (allTickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">No hay entradas registradas para la selección actual.</td></tr>`;
    totalAmountEl.textContent = "0,00 €";
    return;
  }

  let totalCost = 0;
  tbody.innerHTML = allTickets.map((t, idx) => {
    totalCost += (t.cost || 0);
    const isBought = t.status === 'Comprada';
    return `
      <tr>
        <td style="font-size: 0.85rem; vertical-align: middle;">
          <span style="font-weight: 700; color: #1e293b;">${escapeHtml(t._tripTitle)}</span>
          ${t.stageName ? `<div style="color: #6366f1; font-size: 0.75rem; font-weight: 600;">📍 ${escapeHtml(t.stageName)}</div>` : ''}
        </td>
        <td style="font-weight: 600; color: #0f172a; vertical-align: middle;">${escapeHtml(t.name)}</td>
        <td style="font-size: 0.825rem; font-family: monospace; vertical-align: middle;">${formatDateSpanish(t.purchaseDate)}</td>
        <td style="font-size: 0.825rem; font-family: monospace; vertical-align: middle;">${formatDateSpanish(t.visitDate)}</td>
        <td style="font-weight: 700; color: #059669; vertical-align: middle;">${formatCurrency(t.cost)}</td>
        <td style="vertical-align: middle; white-space: nowrap;">
          <span class="badge ${isBought ? 'badge-emerald' : 'badge-amber'}" style="cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 0.35rem;" onclick="toggleTicketStatusById('${t.id}')">
            ${isBought ? '✓ Comprada' : '⏳ Pendiente'}
          </span>
        </td>
        <td style="font-size: 0.825rem; vertical-align: middle;">
          ${t.link ? `<a href="${escapeHtml(t.link)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Ver Reserva ↗</a>` : '<span style="color: #94a3b8;">-</span>'}
        </td>
        <td style="text-align: center; vertical-align: middle;" class="no-print">
          <button class="btn btn-secondary btn-sm" onclick="openTicketModal('${t.id}')" title="Editar">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTicketById('${t.id}')" title="Eliminar">🗑️</button>
        </td>
      </tr>
    `;
  }).join("");

  totalAmountEl.textContent = formatCurrency(totalCost);
}

function openTicketModal(ticketId = null) {
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];
  if (trips.length === 0) {
    alert("No hay viajes en el año actual.");
    return;
  }

  const tripSelect = document.getElementById("inputTicketTripId");
  if (tripSelect) {
    tripSelect.innerHTML = trips.map(t => `<option value="${t.id}">${escapeHtml(t.title || t.name)}</option>`).join("");
  }

  document.getElementById("ticketEditId").value = ticketId || "";

  if (ticketId) {
    let foundTicket = null;
    let foundTrip = null;
    for (const tr of trips) {
      if (tr.tickets) {
        const found = tr.tickets.find(tk => tk.id === ticketId);
        if (found) {
          foundTicket = found;
          foundTrip = tr;
          break;
        }
      }
    }

    if (foundTicket && foundTrip) {
      document.getElementById("modalTicketTitle").textContent = "Editar Entrada";
      if (tripSelect) tripSelect.value = foundTrip.id;
      handleTicketTripChange();
      const stageSelect = document.getElementById("inputTicketStageId");
      if (stageSelect && foundTicket.stageId) stageSelect.value = foundTicket.stageId;

      document.getElementById("inputTicketName").value = foundTicket.name || "";
      document.getElementById("inputTicketPurchaseDate").value = foundTicket.purchaseDate || "";
      document.getElementById("inputTicketVisitDate").value = foundTicket.visitDate || "";
      document.getElementById("inputTicketCost").value = foundTicket.cost || 0;
      document.getElementById("inputTicketStatus").value = foundTicket.status || "Pendiente";
      document.getElementById("inputTicketLink").value = foundTicket.link || "";
    }
  } else {
    document.getElementById("modalTicketTitle").textContent = "Añadir Entrada / Actividad";
    const defaultTripId = (currentTicketsTripFilter !== 'ALL' && trips.some(t => t.id === currentTicketsTripFilter))
      ? currentTicketsTripFilter
      : (currentTripId || trips[0].id);
    if (tripSelect) tripSelect.value = defaultTripId;
    handleTicketTripChange();

    document.getElementById("inputTicketName").value = "";
    document.getElementById("inputTicketPurchaseDate").value = "";
    document.getElementById("inputTicketVisitDate").value = "";
    document.getElementById("inputTicketCost").value = "";
    document.getElementById("inputTicketStatus").value = "Pendiente";
    document.getElementById("inputTicketLink").value = "";
  }

  openModal("modalTicket");
}

function handleSaveTicket(e) {
  if (e) e.preventDefault();
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];
  const selectedTripId = document.getElementById("inputTicketTripId").value;
  const destTrip = trips.find(t => t.id === selectedTripId);

  if (!destTrip) {
    alert("Debes seleccionar un viaje válido.");
    return;
  }
  if (!destTrip.tickets) destTrip.tickets = [];

  const stageSelect = document.getElementById("inputTicketStageId");
  const stageId = stageSelect && !stageSelect.disabled ? stageSelect.value : "";
  let stageName = "";
  if (stageId && destTrip.stages) {
    const st = destTrip.stages.find((s, idx) => (s.id === stageId || ('st_' + idx) === stageId));
    if (st) stageName = st.name || "";
  }

  const nameVal = document.getElementById("inputTicketName").value.trim();
  if (!nameVal) {
    alert("Por favor, introduce el nombre del monumento o actividad.");
    return;
  }

  const ticketEditId = document.getElementById("ticketEditId").value;
  const ticketData = {
    id: ticketEditId || ('t_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
    tripId: destTrip.id,
    tripTitle: destTrip.title || destTrip.name,
    stageId: stageId || null,
    stageName: stageName || null,
    name: nameVal,
    purchaseDate: document.getElementById("inputTicketPurchaseDate").value,
    visitDate: document.getElementById("inputTicketVisitDate").value,
    cost: parseFloat(document.getElementById("inputTicketCost").value) || 0,
    status: document.getElementById("inputTicketStatus").value,
    link: document.getElementById("inputTicketLink").value.trim()
  };

  if (ticketEditId) {
    // Si se editó, puede que se haya cambiado de viaje
    trips.forEach(tr => {
      if (tr.tickets) {
        tr.tickets = tr.tickets.filter(tk => tk.id !== ticketEditId);
      }
    });
    destTrip.tickets.push(ticketData);
    showToast("Entrada actualizada correctamente", "success");
  } else {
    destTrip.tickets.push(ticketData);
    showToast("Entrada guardada en " + (destTrip.title || destTrip.name), "success");
  }

  saveDatabase(db);
  recalculateAllTripFinancials();
  closeModal("modalTicket");
  renderTicketsTab();
  renderExpensesTab();
  renderPendingExpensesSection();
  renderBudgetTab();
  renderOverviewTab();
  renderOverviewPayments();
}

function toggleTicketStatusById(ticketId) {
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];
  let found = null;
  for (const tr of trips) {
    if (tr.tickets) {
      found = tr.tickets.find(tk => tk.id === ticketId);
      if (found) break;
    }
  }
  if (!found) return;

  found.status = found.status === 'Comprada' ? 'Pendiente' : 'Comprada';
  saveDatabase(db);
  recalculateAllTripFinancials();
  renderTicketsTab();
  renderExpensesTab();
  renderPendingExpensesSection();
  renderBudgetTab();
  renderOverviewTab();
  renderOverviewPayments();
  showToast(`Estado de "${found.name}" cambiado a ${found.status}`, "success");
}

function deleteTicketById(ticketId) {
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];
  let found = null;
  let ownerTrip = null;
  for (const tr of trips) {
    if (tr.tickets) {
      found = tr.tickets.find(tk => tk.id === ticketId);
      if (found) { ownerTrip = tr; break; }
    }
  }
  if (!found || !ownerTrip) return;

  if (confirm(`¿Eliminar la entrada "${found.name}"?`)) {
    ownerTrip.tickets = ownerTrip.tickets.filter(tk => tk.id !== ticketId);
    saveDatabase(db);
    recalculateAllTripFinancials();
    renderTicketsTab();
    renderExpensesTab();
    renderPendingExpensesSection();
    renderBudgetTab();
    renderOverviewTab();
    renderOverviewPayments();
    showToast("Entrada eliminada", "warning");
  }
}

function toggleTicketStatus(idx) {
  const trip = getCurrentTrip();
  if (trip && trip.tickets && trip.tickets[idx]) {
    toggleTicketStatusById(trip.tickets[idx].id);
  }
}

function deleteTicket(idx) {
  const trip = getCurrentTrip();
  if (trip && trip.tickets && trip.tickets[idx]) {
    deleteTicketById(trip.tickets[idx].id);
  }
}

// ------------------------------------------------------------
// GESTIÓN DE BORRADO DE VIAJES (CON CONFIRMACIÓN DE SEGURIDAD)
// ------------------------------------------------------------
function promptDeleteTrip(tripId) {
  if (!tripId) {
    tripId = currentTripId;
  }
  let yearData = db.years[currentYear];
  let trip = yearData && yearData.trips ? yearData.trips.find(t => String(t.id) === String(tripId)) : null;

  // Si no se encuentra en el año activo, buscar en todos los años
  if (!trip) {
    for (const y of Object.keys(db.years)) {
      const found = db.years[y]?.trips?.find(t => String(t.id) === String(tripId));
      if (found) {
        currentYear = parseInt(y);
        yearData = db.years[currentYear];
        trip = found;
        break;
      }
    }
  }

  if (!trip) {
    showToast("No se encontró el viaje seleccionado", "warning");
    return;
  }

  document.getElementById("deleteTripTargetId").value = trip.id;
  const destText = trip.destination ? ` - ${trip.destination}` : '';
  const periodText = trip.period ? ` (${trip.period})` : ` (${currentYear})`;
  document.getElementById("deleteTripTargetName").textContent = `"${trip.name}${destText}"${periodText}`;

  openModal("modalDeleteTrip");
}

function handleConfirmDeleteTrip() {
  const tripId = document.getElementById("deleteTripTargetId").value;
  if (!tripId) return;

  let yearData = db.years[currentYear];
  let tripIndex = yearData && yearData.trips ? yearData.trips.findIndex(t => String(t.id) === String(tripId)) : -1;

  if (tripIndex === -1) {
    for (const y of Object.keys(db.years)) {
      const idx = db.years[y]?.trips?.findIndex(t => String(t.id) === String(tripId));
      if (idx !== -1 && idx !== undefined) {
        currentYear = parseInt(y);
        yearData = db.years[currentYear];
        tripIndex = idx;
        break;
      }
    }
  }

  if (tripIndex === -1 || !yearData || !yearData.trips) return;

  const deletedTripName = yearData.trips[tripIndex].name;
  yearData.trips.splice(tripIndex, 1);

  if (String(currentTripId) === String(tripId)) {
    currentTripId = yearData.trips.length > 0 ? yearData.trips[0].id : null;
  }

  saveDatabase(db);
  closeModal("modalDeleteTrip");
  initApp();
  showToast(`El viaje "${deletedTripName}" ha sido eliminado permanentemente`, "warning");
}

// ------------------------------------------------------------
// PESTAÑA: CONTROL DE GASTOS Y ANTICIPOS DE PAGO
// ------------------------------------------------------------
function getMethodBadge(method) {
  const m = (method || '').toLowerCase();
  let badgeClass = "badge-method-other";
  let icon = "💳";
  if (m.includes("tpv")) {
    badgeClass = "badge-method-tpv";
    icon = "💻";
  } else if (m.includes("tarjeta")) {
    badgeClass = "badge-method-tarjeta";
    icon = "💳";
  } else if (m.includes("transferencia")) {
    badgeClass = "badge-method-transferencia";
    icon = "🏦";
  } else if (m.includes("bizum")) {
    badgeClass = "badge-method-bizum";
    icon = "📱";
  } else if (m.includes("efectivo") || m.includes("metálico") || m.includes("metalico")) {
    badgeClass = "badge-method-efectivo";
    icon = "💵";
  } else if (m.includes("airbnb") || m.includes("booking") || m.includes("plataforma")) {
    badgeClass = "badge-method-platform";
    icon = "🌐";
  } else if (m.includes("presencial") || m.includes("mano")) {
    badgeClass = "badge-method-presencial";
    icon = "🤝";
  }
  return `<span class="badge-method ${badgeClass}">${icon} ${escapeHtml(method || 'Otro')}</span>`;
}

function renderAdvancesSection() {
  const yearData = db.years[currentYear];
  const tbody = document.getElementById("advancesTbody");
  const filterSelect = document.getElementById("filterAdvanceTripSelect");
  const totalAdvancesEl = document.getElementById("totalAdvancesAmount");
  const statTotalAdvances = document.getElementById("statTotalAdvances");
  const statAdvancesCount = document.getElementById("statAdvancesCount");

  if (!tbody || !yearData) return;

  const trips = yearData.trips || [];

  // Actualizar selector de filtro de viajes
  const currentFilter = filterSelect ? filterSelect.value : "ALL";
  if (filterSelect) {
    const tripOptions = trips.map(t => 
      `<option value="${t.id}" ${currentFilter === t.id ? 'selected' : ''}>${escapeHtml(t.name)}${t.destination ? ' (' + escapeHtml(t.destination) + ')' : ''}</option>`
    ).join("");
    filterSelect.innerHTML = `<option value="ALL" ${currentFilter === 'ALL' ? 'selected' : ''}>Mostrar todos los viajes (${trips.length})</option>` + tripOptions;
  }

  // Recopilar todos los anticipos con información del viaje
  const allAdvances = [];
  trips.forEach(t => {
    if (!Array.isArray(t.advances)) t.advances = [];
    t.advances.forEach(adv => {
      allAdvances.push({
        ...adv,
        tripId: t.id,
        tripName: t.name,
        tripDestination: t.destination || "",
        tripCategory: t.category || ""
      });
    });
  });

  const totalAllYearAdvances = allAdvances.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  if (statTotalAdvances) statTotalAdvances.textContent = formatCurrency(totalAllYearAdvances);
  if (statAdvancesCount) statAdvancesCount.textContent = `${allAdvances.length} anticipo${allAdvances.length === 1 ? '' : 's'} en ${currentYear}`;

  // Filtrar según selector
  const activeFilter = filterSelect ? filterSelect.value : "ALL";
  const displayedAdvances = activeFilter === "ALL" 
    ? allAdvances 
    : allAdvances.filter(a => a.tripId === activeFilter);

  // Ordenar por fecha descendente
  displayedAdvances.sort((a, b) => {
    const da = a.date || "";
    const db = b.date || "";
    return db.localeCompare(da);
  });

  const totalFilteredAdvances = displayedAdvances.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  if (totalAdvancesEl) totalAdvancesEl.textContent = formatCurrency(totalFilteredAdvances);

  if (displayedAdvances.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1.5rem; color: #64748b;">No hay anticipos de pagos registrados ${activeFilter !== 'ALL' ? 'para este viaje' : 'en ' + currentYear}. Haz clic en "+ Registrar Anticipo" para anotar una señal o pago adelantado.</td></tr>`;
    return;
  }

  tbody.innerHTML = displayedAdvances.map(adv => `
    <tr>
      <td>
        <span style="font-weight: 700; color: #1e293b;">${escapeHtml(adv.tripName)}</span>
        ${adv.tripDestination ? `<div style="font-size: 0.75rem; color: #64748b;">📍 ${escapeHtml(adv.tripDestination)}</div>` : ''}
      </td>
      <td style="font-weight: 600; color: #0f172a;">${escapeHtml(adv.concept || 'Anticipo')}</td>
      <td style="font-family: monospace; font-size: 0.85rem; color: #334155;">${formatDateSpanish(adv.date)}</td>
      <td>${getMethodBadge(adv.method)}</td>
      <td style="font-weight: 800; color: #059669; font-size: 0.95rem;">${formatCurrency(adv.amount)}</td>
      <td style="font-size: 0.825rem; color: #64748b; max-width: 220px;">${escapeHtml(adv.notes || '—')}</td>
      <td style="text-align: center;" class="no-print">
        <button class="btn btn-secondary btn-sm" onclick="openAdvanceModal('${adv.tripId}', '${adv.id}')" title="Editar este anticipo">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAdvance('${adv.tripId}', '${adv.id}')" title="Eliminar anticipo">🗑️</button>
      </td>
    </tr>
  `).join("");
}

function openAdvanceModal(tripId = "", advanceId = "") {
  const yearData = db.years[currentYear];
  if (!yearData) return;
  const trips = yearData.trips || [];

  const selectTrip = document.getElementById("inputAdvanceTripId");
  if (selectTrip) {
    selectTrip.innerHTML = trips.map(t => 
      `<option value="${t.id}">${escapeHtml(t.name)}${t.destination ? ' (' + escapeHtml(t.destination) + ')' : ''}</option>`
    ).join("");
  }

  document.getElementById("advanceEditId").value = advanceId || "";

  if (advanceId && tripId) {
    const trip = trips.find(t => t.id === tripId);
    const adv = trip && trip.advances ? trip.advances.find(a => a.id === advanceId) : null;
    if (adv) {
      document.getElementById("modalAdvanceTitle").textContent = "Editar Anticipo de Pago";
      if (selectTrip) selectTrip.value = tripId;
      document.getElementById("inputAdvanceConcept").value = adv.concept || "";
      document.getElementById("inputAdvanceDate").value = adv.date || "";
      document.getElementById("inputAdvanceMethod").value = adv.method || "TPV virtual";
      document.getElementById("inputAdvanceAmount").value = adv.amount || 0;
      document.getElementById("inputAdvanceNotes").value = adv.notes || "";
    }
  } else {
    document.getElementById("modalAdvanceTitle").textContent = "Registrar Anticipo de Pago";
    const currentFilterVal = document.getElementById("filterAdvanceTripSelect")?.value;
    const defaultTripId = tripId || (currentFilterVal && currentFilterVal !== "ALL" ? currentFilterVal : currentTripId) || (trips[0] ? trips[0].id : "");
    if (selectTrip && defaultTripId) selectTrip.value = defaultTripId;
    document.getElementById("inputAdvanceConcept").value = "";
    document.getElementById("inputAdvanceDate").value = new Date().toISOString().split("T")[0];
    document.getElementById("inputAdvanceMethod").value = "TPV virtual";
    document.getElementById("inputAdvanceAmount").value = "";
    document.getElementById("inputAdvanceNotes").value = "";
  }

  openModal("modalAdvance");
}

function handleSaveAdvance(e) {
  if (e) e.preventDefault();
  const yearData = db.years[currentYear];
  if (!yearData) return;

  const trips = yearData.trips || [];
  const selectedTripId = document.getElementById("inputAdvanceTripId").value;
  const advanceId = document.getElementById("advanceEditId").value;
  const concept = document.getElementById("inputAdvanceConcept").value.trim();
  const date = document.getElementById("inputAdvanceDate").value;
  const method = document.getElementById("inputAdvanceMethod").value;
  const amount = parseFloat(document.getElementById("inputAdvanceAmount").value) || 0;
  const notes = document.getElementById("inputAdvanceNotes").value.trim();

  if (!selectedTripId) {
    alert("Por favor, selecciona el viaje al que corresponde el anticipo.");
    return;
  }

  if (!concept) {
    alert("Por favor, introduce el concepto o motivo del anticipo.");
    return;
  }

  if (amount <= 0) {
    alert("Por favor, introduce una cantidad válida superior a 0 €.");
    return;
  }

  const targetTrip = trips.find(t => t.id === selectedTripId);
  if (!targetTrip) {
    alert("Viaje seleccionado no encontrado.");
    return;
  }
  if (!Array.isArray(targetTrip.advances)) targetTrip.advances = [];

  if (advanceId) {
    // Si se está editando, comprobar si se cambió de viaje
    let foundOld = false;
    for (const t of trips) {
      if (Array.isArray(t.advances)) {
        const idx = t.advances.findIndex(a => a.id === advanceId);
        if (idx !== -1) {
          if (t.id === selectedTripId) {
            t.advances[idx] = { id: advanceId, concept, date, method, amount, notes };
          } else {
            t.advances.splice(idx, 1);
            targetTrip.advances.push({ id: advanceId, concept, date, method, amount, notes });
          }
          foundOld = true;
          break;
        }
      }
    }
    if (!foundOld) {
      targetTrip.advances.push({ id: advanceId, concept, date, method, amount, notes });
    }
    showToast("Anticipo de pago actualizado con éxito", "success");
  } else {
    // Nuevo anticipo
    const newAdv = {
      id: 'adv_' + Date.now(),
      concept,
      date: date || new Date().toISOString().split("T")[0],
      method,
      amount,
      notes
    };
    targetTrip.advances.push(newAdv);
    showToast("Anticipo de pago registrado con éxito", "success");
  }

  // Recalcular todo lo relacionado con este viaje (saldos, pendientes, etapas, presupuesto)
  recalculateAllTripFinancials(targetTrip);

  saveDatabase(db);
  closeModal("modalAdvance");
  renderExpensesTab();
  renderStats();
  renderOverviewTab();
  renderItineraryTab();
  renderBudgetTab();
}

function deleteAdvance(tripId, advanceId) {
  const yearData = db.years[currentYear];
  if (!yearData || !yearData.trips) return;

  const trip = yearData.trips.find(t => t.id === tripId);
  if (!trip || !Array.isArray(trip.advances)) return;

  const advIndex = trip.advances.findIndex(a => a.id === advanceId);
  if (advIndex === -1) return;

  const adv = trip.advances[advIndex];
  if (confirm(`¿Eliminar el anticipo de ${formatCurrency(adv.amount)} para "${trip.name}" (${adv.concept})?`)) {
    trip.advances.splice(advIndex, 1);

    // Recalcular todo lo relacionado con este viaje
    recalculateAllTripFinancials(trip);

    saveDatabase(db);
    renderExpensesTab();
    renderStats();
    renderOverviewTab();
    renderItineraryTab();
    renderBudgetTab();
    showToast("Anticipo eliminado correctamente", "warning");
  }
}

// ------------------------------------------------------------
// SECCIÓN 3: GASTOS PENDIENTES (ENTRADAS Y ACTIVIDADES PENDIENTES)
// ------------------------------------------------------------
function renderPendingExpensesSection() {
  const yearData = db.years[currentYear];
  const tbody = document.getElementById("pendingExpensesTbody");
  const filterSelect = document.getElementById("filterPendingExpensesTripSelect");
  const totalPendingEl = document.getElementById("totalPendingExpensesAmount");
  const statTotalPending = document.getElementById("statTotalPendingExpenses");
  const statPendingCount = document.getElementById("statPendingExpensesCount");

  if (!tbody || !yearData) return;

  const trips = yearData.trips || [];

  // Actualizar selector de filtro de viajes
  const currentFilter = filterSelect ? filterSelect.value : "ALL";
  if (filterSelect) {
    const tripOptions = trips.map(t => 
      `<option value="${t.id}" ${currentFilter === t.id ? 'selected' : ''}>${escapeHtml(t.name)}${t.destination ? ' (' + escapeHtml(t.destination) + ')' : ''}</option>`
    ).join("");
    filterSelect.innerHTML = `<option value="ALL" ${currentFilter === 'ALL' ? 'selected' : ''}>Mostrar todos los viajes (${trips.length})</option>` + tripOptions;
  }

  // Recopilar todas las entradas y actividades que aparezcan como pendientes
  const allPendingTickets = [];
  trips.forEach(t => {
    const tickets = t.tickets || [];
    tickets.forEach((tk, idx) => {
      const isPaid = (tk.status === "Comprada" || tk.status === "pagado");
      if (!isPaid) {
        allPendingTickets.push({
          tripId: t.id,
          tripName: t.name,
          tripDestination: t.destination || "",
          ticketIndex: idx,
          id: tk.id || ('tk_' + idx),
          name: tk.name || "Actividad / Entrada",
          cost: parseFloat(tk.cost) || 0,
          purchaseDate: tk.purchaseDate || "",
          visitDate: tk.visitDate || "",
          status: tk.status || "Pendiente",
          link: tk.link || ""
        });
      }
    });
  });

  const totalAllYearPending = allPendingTickets.reduce((acc, curr) => acc + curr.cost, 0);
  if (statTotalPending) statTotalPending.textContent = formatCurrency(totalAllYearPending);
  if (statPendingCount) statPendingCount.textContent = `${allPendingTickets.length} gasto${allPendingTickets.length === 1 ? '' : 's'} pendiente${allPendingTickets.length === 1 ? '' : 's'}`;

  // Filtrar según selector
  const activeFilter = filterSelect ? filterSelect.value : "ALL";
  const displayedPending = activeFilter === "ALL" 
    ? allPendingTickets 
    : allPendingTickets.filter(p => p.tripId === activeFilter);

  // Ordenar por fecha prevista o nombre
  displayedPending.sort((a, b) => {
    const da = a.visitDate || a.purchaseDate || "";
    const db = b.visitDate || b.purchaseDate || "";
    if (da && db) return da.localeCompare(db);
    return a.name.localeCompare(b.name);
  });

  const totalFilteredPending = displayedPending.reduce((acc, curr) => acc + curr.cost, 0);
  if (totalPendingEl) totalPendingEl.textContent = formatCurrency(totalFilteredPending);

  if (displayedPending.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1.5rem; color: #64748b;">🎉 ¡Genial! No hay gastos o entradas pendientes ${activeFilter !== 'ALL' ? 'para este viaje' : 'en ' + currentYear}. Todas las actividades están compradas o no hay entradas pendientes.</td></tr>`;
    return;
  }

  tbody.innerHTML = displayedPending.map(p => {
    const dateDisplay = p.visitDate ? formatDateSpanish(p.visitDate) : (p.purchaseDate ? formatDateSpanish(p.purchaseDate) : '—');
    return `
      <tr>
        <td>
          <a href="javascript:void(0)" onclick="selectTripAndGoToTickets('${p.tripId}')" style="font-weight: 700; color: #1e293b; text-decoration: none;" title="Ver viaje en Entradas y Actividades">
            ${escapeHtml(p.tripName)} ↗
          </a>
          ${p.tripDestination ? `<div style="font-size: 0.75rem; color: #64748b;">📍 ${escapeHtml(p.tripDestination)}</div>` : ''}
        </td>
        <td style="font-weight: 600; color: #0f172a;">
          ${escapeHtml(p.name)}
        </td>
        <td style="font-family: monospace; font-size: 0.85rem; color: #334155;">
          ${dateDisplay}
        </td>
        <td style="font-weight: 800; color: #b45309; font-size: 0.95rem;">
          ${formatCurrency(p.cost)}
        </td>
        <td>
          <span class="badge badge-amber" style="font-size: 0.78rem;">
            ⏳ ${escapeHtml(p.status)}
          </span>
        </td>
        <td style="font-size: 0.825rem;">
          ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Ver Reserva ↗</a>` : '<span style="color: #94a3b8;">—</span>'}
        </td>
        <td style="text-align: center;" class="no-print">
          <button class="btn btn-accent btn-sm" onclick="markPendingTicketAsBought('${p.tripId}', ${p.ticketIndex})" title="Marcar como Comprada / Pagada">
            ✓ Marcar Comprada
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function markPendingTicketAsBought(tripId, ticketIndex) {
  const yearData = db.years[currentYear];
  if (!yearData) return;
  const trip = (yearData.trips || []).find(t => t.id === tripId);
  if (!trip || !trip.tickets || !trip.tickets[ticketIndex]) return;

  const tk = trip.tickets[ticketIndex];
  tk.status = 'Comprada';
  saveDatabase(db);
  recalculateAllTripFinancials();
  renderExpensesTab();
  renderTicketsTab();
  renderOverviewTab();
  renderBudgetTab();
  renderOverviewPayments();
  showToast(`"${tk.name}" marcada como Comprada. Se ha recalculado el presupuesto.`, "success");
}

function selectTripAndGoToTickets(tripId) {
  if (tripId) {
    currentTripId = tripId;
  }
  renderTicketsTab();
  renderExpensesTab();
  switchTab('tab-tickets');
}

function handleExpenseTripChange() {
  const tripSelect = document.getElementById("inputExpenseTripId");
  const stageSelect = document.getElementById("inputExpenseStageId");
  const stageGroup = document.getElementById("expenseStageGroup");
  if (!tripSelect || !stageSelect) return;

  const tripId = tripSelect.value;
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];
  const trip = trips.find(t => t.id === tripId);

  if (trip && trip.stages && trip.stages.length > 0) {
    stageSelect.innerHTML = `<option value="">— Sin etapa / General del viaje —</option>` +
      trip.stages.map((st, i) => `<option value="${st.id || ('st_' + i)}">📍 ${escapeHtml(st.name || ('Etapa ' + (i + 1)))}</option>`).join("");
    if (stageGroup) stageGroup.style.display = "block";
    stageSelect.disabled = false;
  } else {
    stageSelect.innerHTML = `<option value="">— Sin etapas / Viaje único —</option>`;
    if (stageGroup) stageGroup.style.display = "none";
    stageSelect.disabled = true;
  }
}

function renderExpensesTab() {
  const yearData = db.years[currentYear];
  const trips = (yearData && yearData.trips) || [];
  const tbody = document.getElementById("expensesTbody");
  const totalAmountEl = document.getElementById("totalExpensesAmount");
  const categoriesGrid = document.getElementById("expenseCategoriesGrid");
  const filterSelect = document.getElementById("filterRouteExpensesTripSelect");
  const statRouteExpenses = document.getElementById("statTotalRouteExpenses");
  const statRouteCount = document.getElementById("statRouteExpensesCount");
  const statTotalAllExpenses = document.getElementById("statTotalAllExpenses");

  // Actualizar tabla de anticipos
  renderAdvancesSection();

  // Actualizar sección de gastos pendientes (entradas y actividades)
  renderPendingExpensesSection();

  // Actualizar selector de filtro de viajes para separar los gastos en ruta
  const currentFilter = filterSelect ? filterSelect.value : "ALL";
  if (filterSelect) {
    const tripOptions = trips.map(t => 
      `<option value="${t.id}" ${currentFilter === t.id ? 'selected' : ''}>${escapeHtml(t.name)}${t.destination ? ' (' + escapeHtml(t.destination) + ')' : ''}</option>`
    ).join("");
    filterSelect.innerHTML = `<option value="ALL" ${currentFilter === 'ALL' ? 'selected' : ''}>Mostrar todos los viajes (${trips.length})</option>` + tripOptions;
  }

  // Recopilar todos los gastos según el viaje seleccionado o todos
  const allRouteExpenses = [];
  trips.forEach(t => {
    const exps = t.expenses || [];
    exps.forEach(e => {
      let stName = e.stageName || "";
      if (!stName && e.stageId && t.stages) {
        const foundSt = t.stages.find(s => s.id === e.stageId);
        if (foundSt) stName = foundSt.name;
      }
      allRouteExpenses.push({
        ...e,
        tripId: t.id,
        tripName: t.name,
        stageName: stName
      });
    });
  });

  const activeFilter = filterSelect ? filterSelect.value : "ALL";
  const displayedExpenses = activeFilter === "ALL" 
    ? allRouteExpenses 
    : allRouteExpenses.filter(e => e.tripId === activeFilter);

  // Ordenar por fecha descendente
  displayedExpenses.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  let totalRouteCost = 0;
  const categoryTotals = {
    Gasolina: 0,
    Peajes: 0,
    Compras: 0,
    Restaurantes: 0,
    Efectivo: 0,
    Otros: 0
  };

  displayedExpenses.forEach(e => {
    const amt = parseFloat(e.amount) || 0;
    totalRouteCost += amt;
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += amt;
    } else {
      categoryTotals.Otros += amt;
    }
  });

  if (statRouteExpenses) statRouteExpenses.textContent = formatCurrency(totalRouteCost);
  if (statRouteCount) {
    if (activeFilter === "ALL") {
      statRouteCount.textContent = `${displayedExpenses.length} gastos en todos los viajes`;
    } else {
      const activeTrip = trips.find(t => t.id === activeFilter);
      statRouteCount.textContent = `${displayedExpenses.length} gastos en "${activeTrip ? activeTrip.name : 'Viaje'}"`;
    }
  }

  // Calcular total global financiado/pagado
  let totalAdvancesAllYear = 0;
  if (yearData && yearData.trips) {
    yearData.trips.forEach(t => {
      if (Array.isArray(t.advances)) {
        t.advances.forEach(a => totalAdvancesAllYear += (parseFloat(a.amount) || 0));
      }
    });
  }
  if (statTotalAllExpenses) {
    statTotalAllExpenses.textContent = formatCurrency(totalAdvancesAllYear + totalRouteCost);
  }

  // Renderizar tarjetas de categorías rápidas
  const catIcons = {
    Gasolina: "⛽",
    Peajes: "🛣️",
    Compras: "🛒",
    Restaurantes: "🍽️",
    Efectivo: "💵",
    Otros: "☕"
  };

  if (categoriesGrid) {
    categoriesGrid.innerHTML = Object.keys(categoryTotals).map(cat => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.75rem;">
        <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;">
          ${catIcons[cat] || '📦'} ${cat}
        </div>
        <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-top: 0.2rem;">
          ${formatCurrency(categoryTotals[cat])}
        </div>
      </div>
    `).join("");
  }

  if (displayedExpenses.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: #64748b;">No hay gastos en ruta registrados ${activeFilter !== 'ALL' ? 'para este viaje' : 'en este año'}. Haz clic en "+ Registrar Gasto" para añadir uno.</td></tr>`;
    if (totalAmountEl) totalAmountEl.textContent = "0,00 €";
    return;
  }

  if (tbody) {
    tbody.innerHTML = displayedExpenses.map(exp => `
      <tr>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${escapeHtml(exp.tripName)}</div>
          ${exp.stageName ? `<div style="font-size: 0.75rem; color: #4338ca; font-weight: 600;">📍 ${escapeHtml(exp.stageName)}</div>` : ''}
        </td>
        <td style="font-weight: 600; color: #1e293b;">${escapeHtml(exp.concept)}</td>
        <td><span class="badge badge-gray">${catIcons[exp.category] || ''} ${escapeHtml(exp.category)}</span></td>
        <td style="font-family: monospace; font-size: 0.825rem;">${formatDateSpanish(exp.date)}</td>
        <td style="font-weight: 800; color: #0f172a;">${formatCurrency(exp.amount)}</td>
        <td style="text-align: center;" class="no-print">
          <button class="btn btn-secondary btn-sm" onclick="openExpenseModal('${exp.tripId}', '${exp.id}')" title="Editar">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteExpense('${exp.tripId}', '${exp.id}')" title="Eliminar">🗑️</button>
        </td>
      </tr>
    `).join("");
  }

  if (totalAmountEl) totalAmountEl.textContent = formatCurrency(totalRouteCost);

  // Asegurar que solo el apartado activo esté visible
  switchExpensesSection(currentExpensesSection);
}

let currentExpensesSection = 'route';

function switchExpensesSection(sectionKey) {
  currentExpensesSection = sectionKey;
  const secAdvances = document.getElementById("expensesSectionAdvances");
  const secRoute = document.getElementById("expensesSectionRoute");
  const secPending = document.getElementById("expensesSectionPending");

  const btnAdvances = document.getElementById("btnExpSectionAdvances");
  const btnRoute = document.getElementById("btnExpSectionRoute");
  const btnPending = document.getElementById("btnExpSectionPending");
  const btnAll = document.getElementById("btnExpSectionAll");

  if (btnAdvances) btnAdvances.className = (sectionKey === 'advances') ? 'btn btn-primary' : 'btn btn-secondary';
  if (btnRoute) btnRoute.className = (sectionKey === 'route') ? 'btn btn-primary' : 'btn btn-secondary';
  if (btnPending) btnPending.className = (sectionKey === 'pending') ? 'btn btn-primary' : 'btn btn-secondary';
  if (btnAll) btnAll.className = (sectionKey === 'all') ? 'btn btn-primary' : 'btn btn-secondary';

  if (secAdvances) secAdvances.style.display = (sectionKey === 'advances' || sectionKey === 'all') ? 'block' : 'none';
  if (secRoute) secRoute.style.display = (sectionKey === 'route' || sectionKey === 'all') ? 'block' : 'none';
  if (secPending) secPending.style.display = (sectionKey === 'pending' || sectionKey === 'all') ? 'block' : 'none';
}

function openExpenseModal(targetTripId = null, expIdOrIdx = null) {
  const yearData = db.years[currentYear];
  if (!yearData) return;
  const trips = yearData.trips || [];
  if (trips.length === 0) {
    alert("No hay viajes configurados en el año activo.");
    return;
  }

  const tripSelect = document.getElementById("inputExpenseTripId");
  const stageSelect = document.getElementById("inputExpenseStageId");
  const editIdInput = document.getElementById("expenseEditId");

  // Resolver viaje a seleccionar
  let chosenTripId = (typeof targetTripId === "string" && trips.some(t => t.id === targetTripId))
    ? targetTripId 
    : (currentTripId || trips[0].id);

  if (tripSelect) {
    tripSelect.innerHTML = trips.map(t => 
      `<option value="${t.id}" ${t.id === chosenTripId ? 'selected' : ''}>${escapeHtml(t.title || t.name || 'Viaje')}${t.destination ? ' (' + escapeHtml(t.destination) + ')' : ''}</option>`
    ).join("");
  }

  handleExpenseTripChange();

  if (editIdInput) {
    editIdInput.value = (expIdOrIdx !== null && expIdOrIdx !== undefined) ? expIdOrIdx : "";
  }

  // Si estamos editando un gasto existente
  if (expIdOrIdx !== null && expIdOrIdx !== "" && expIdOrIdx !== -1) {
    const trip = trips.find(t => t.id === chosenTripId);
    let exp = null;
    if (trip && trip.expenses) {
      exp = trip.expenses.find(e => e.id === expIdOrIdx);
      if (!exp && typeof expIdOrIdx === "number") exp = trip.expenses[expIdOrIdx];
    }
    if (exp) {
      const titleEl = document.getElementById("modalExpenseTitle");
      if (titleEl) titleEl.textContent = "Editar Gasto";
      const conceptEl = document.getElementById("inputExpenseConcept");
      if (conceptEl) conceptEl.value = exp.concept || "";
      const catEl = document.getElementById("inputExpenseCategory");
      if (catEl) catEl.value = exp.category || "Gasolina";
      const amountEl = document.getElementById("inputExpenseAmount");
      if (amountEl) amountEl.value = exp.amount || 0;
      const dateEl = document.getElementById("inputExpenseDate");
      if (dateEl) dateEl.value = exp.date || "";
      if (tripSelect) tripSelect.value = chosenTripId;
      handleExpenseTripChange();
      if (stageSelect && exp.stageId) stageSelect.value = exp.stageId;
      openModal("modalExpense");
      return;
    }
  }

  // Registrar un nuevo gasto
  const titleEl = document.getElementById("modalExpenseTitle");
  if (titleEl) titleEl.textContent = "Registrar Gasto";
  const conceptEl = document.getElementById("inputExpenseConcept");
  if (conceptEl) conceptEl.value = "";
  const catEl = document.getElementById("inputExpenseCategory");
  if (catEl) catEl.value = "Gasolina";
  const amountEl = document.getElementById("inputExpenseAmount");
  if (amountEl) amountEl.value = "";
  const dateEl = document.getElementById("inputExpenseDate");
  if (dateEl) dateEl.value = new Date().toISOString().split("T")[0];
  openModal("modalExpense");
}

function handleSaveExpense(e) {
  if (e) e.preventDefault();
  const yearData = db.years[currentYear];
  if (!yearData) return;
  const trips = yearData.trips || [];

  const tripId = document.getElementById("inputExpenseTripId") ? document.getElementById("inputExpenseTripId").value : currentTripId;
  const trip = trips.find(t => t.id === tripId) || getCurrentTrip();
  if (!trip) {
    alert("Por favor, selecciona un viaje.");
    return;
  }
  if (!trip.expenses) trip.expenses = [];

  const stageId = document.getElementById("inputExpenseStageId") ? document.getElementById("inputExpenseStageId").value : "";
  let stageName = "";
  if (stageId && trip.stages) {
    const stObj = trip.stages.find(s => s.id === stageId);
    if (stObj) stageName = stObj.name;
  }

  const editId = document.getElementById("expenseEditId").value;
  let existingIndex = -1;
  if (editId !== "" && editId !== "-1") {
    existingIndex = trip.expenses.findIndex(x => x.id === editId);
    if (existingIndex === -1 && !isNaN(parseInt(editId))) {
      existingIndex = parseInt(editId);
    }
  }

  const expenseData = {
    id: existingIndex >= 0 && trip.expenses[existingIndex] ? trip.expenses[existingIndex].id : 'e_' + Date.now(),
    tripId: trip.id,
    tripName: trip.name,
    stageId: stageId || null,
    stageName: stageName || null,
    concept: document.getElementById("inputExpenseConcept").value.trim(),
    category: document.getElementById("inputExpenseCategory").value,
    amount: parseFloat(document.getElementById("inputExpenseAmount").value) || 0,
    date: document.getElementById("inputExpenseDate").value
  };

  if (!expenseData.concept) {
    alert("Por favor, introduce el concepto del gasto.");
    return;
  }

  if (existingIndex >= 0 && trip.expenses[existingIndex]) {
    trip.expenses[existingIndex] = expenseData;
    showToast("Gasto actualizado", "success");
  } else {
    trip.expenses.push(expenseData);
    showToast("Gasto registrado con éxito", "success");
  }

  recalculateAllTripFinancials();
  saveDatabase(db);
  closeModal("modalExpense");
  renderExpensesTab();
  renderStats();
  renderOverviewTab();
  renderOverviewPayments();
  renderBudgetTab();
  renderItineraryTab();
}

function deleteExpense(tripIdOrIdx, expId) {
  const yearData = db.years[currentYear];
  if (!yearData) return;
  const trips = yearData.trips || [];

  let targetTrip = null;
  let expIndex = -1;

  if (typeof tripIdOrIdx === "string" && trips.some(t => t.id === tripIdOrIdx)) {
    targetTrip = trips.find(t => t.id === tripIdOrIdx);
    if (targetTrip && targetTrip.expenses) {
      expIndex = targetTrip.expenses.findIndex(e => e.id === expId);
    }
  } else {
    targetTrip = getCurrentTrip();
    if (targetTrip && targetTrip.expenses) {
      expIndex = parseInt(tripIdOrIdx);
    }
  }

  if (!targetTrip || !targetTrip.expenses || expIndex === -1 || !targetTrip.expenses[expIndex]) return;

  const exp = targetTrip.expenses[expIndex];
  if (confirm(`¿Eliminar el gasto "${exp.concept}" de ${formatCurrency(exp.amount)}?`)) {
    targetTrip.expenses.splice(expIndex, 1);
    recalculateAllTripFinancials();
    saveDatabase(db);
    renderExpensesTab();
    renderStats();
    renderOverviewTab();
    renderOverviewPayments();
    renderBudgetTab();
    renderItineraryTab();
    showToast("Gasto eliminado", "warning");
  }
}

// ------------------------------------------------------------
// PESTAÑA: PRESUPUESTO Y MATRIZ DE PAGOS
// ------------------------------------------------------------
let currentBudgetView = 'summary';

function switchBudgetView(view) {
  currentBudgetView = view || 'summary';
  const sectionSummary = document.getElementById("budgetSectionSummary");
  const sectionPayments = document.getElementById("budgetSectionPayments");
  const sectionYearPayments = document.getElementById("budgetSectionYearPayments");
  const sectionFuel = document.getElementById("budgetSectionFuel");

  const btnSummary = document.getElementById("btnBudgetShowSummary");
  const btnPayments = document.getElementById("btnBudgetShowPayments");
  const btnYearPayments = document.getElementById("btnBudgetShowYearPayments");
  const btnFuel = document.getElementById("btnBudgetShowFuel");

  const sections = {
    summary: sectionSummary,
    payments: sectionPayments,
    yearPayments: sectionYearPayments,
    fuel: sectionFuel
  };

  const buttons = {
    summary: btnSummary,
    payments: btnPayments,
    yearPayments: btnYearPayments,
    fuel: btnFuel
  };

  Object.keys(sections).forEach(k => {
    if (sections[k]) {
      sections[k].style.display = (k === currentBudgetView) ? 'block' : 'none';
    }
    if (buttons[k]) {
      buttons[k].className = (k === currentBudgetView) ? 'btn btn-primary' : 'btn btn-secondary';
    }
  });

  if (currentBudgetView === 'yearPayments') {
    renderOverviewPayments();
  }
}

function renderBudgetTab() {
  const yearData = db.years[currentYear];
  if (!yearData) return;

  const btnPaymentsYear = document.getElementById("budgetBtnPaymentsYear");
  if (btnPaymentsYear) btnPaymentsYear.textContent = currentYear;

  const yearSpan = document.getElementById("budgetPaymentsYear");
  if (yearSpan) yearSpan.textContent = currentYear;

  const btnYearPayments = document.getElementById("budgetBtnOverviewPaymentsYear");
  if (btnYearPayments) btnYearPayments.textContent = currentYear;

  const budgetTitleSpan = document.getElementById("budgetOverviewPaymentsTitleYear");
  if (budgetTitleSpan) budgetTitleSpan.textContent = currentYear;

  const matrixContainer = document.getElementById("budgetScheduleMatrix");
  if (!matrixContainer) return;
  const targetAccommodations = (yearData.budgetSettings && yearData.budgetSettings.targetAccommodations) || [];

  if (targetAccommodations.length === 0) {
    matrixContainer.innerHTML = `<p style="color: #64748b; font-size: 0.9rem; padding: 1.5rem; text-align: center;">No hay pagos programados configurados para este año.</p>`;
    renderBudgetSummaryTable();
    renderOverviewPayments();
    renderFuelCalculator();
    switchBudgetView(currentBudgetView);
    return;
  }

  const monthOrderMap = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
    "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
  };

  // 1. Agrupar los pagos de un mismo mes
  const grouped = {};
  targetAccommodations.forEach((item, originalIndex) => {
    let m = (item.month || "").trim();
    if (!m && item.dueDate) {
      m = getMonthFromDate(item.dueDate);
    }
    if (!m) m = "Otros";
    const mLower = m.toLowerCase();
    const canonMonth = Object.keys(monthOrderMap).find(k => k === mLower);
    const displayMonth = canonMonth ? (canonMonth.charAt(0).toUpperCase() + canonMonth.slice(1)) : m;

    if (!grouped[displayMonth]) {
      grouped[displayMonth] = {
        name: displayMonth,
        monthNum: monthOrderMap[mLower] || 99,
        items: []
      };
    }
    grouped[displayMonth].items.push({ ...item, _idx: originalIndex });
  });

  // 2. Orden cronológico con desplazamiento al final de los meses pasados
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1; // 1 to 12
  const todayDay = now.getDate();
  const todayStr = `${todayYear}-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
  const currentYearNum = parseInt(currentYear, 10) || todayYear;

  function isMonthPassed(g) {
    if (g.monthNum > 12) return false;
    if (currentYearNum < todayYear) return true;
    if (currentYearNum > todayYear) return false;
    // currentYearNum === todayYear
    if (g.monthNum < todayMonth) return true;
    if (g.monthNum > todayMonth) return false;
    // g.monthNum === todayMonth:
    // Si todos los pagos del mes ya vencieron o están pagados, se considera completado/pasado
    return g.items.length > 0 && g.items.every(it => {
      if (it.status === 'pagado') return true;
      if (it.dueDate && it.dueDate < todayStr) return true;
      return false;
    });
  }

  const upcomingMonths = [];
  const pastMonths = [];

  Object.values(grouped).forEach(g => {
    // Ordenar los pagos dentro del mismo mes cronológicamente por dueDate
    g.items.sort((a, b) => {
      const dateA = a.dueDate || "9999-99-99";
      const dateB = b.dueDate || "9999-99-99";
      return dateA.localeCompare(dateB);
    });

    if (isMonthPassed(g)) {
      pastMonths.push(g);
    } else {
      upcomingMonths.push(g);
    }
  });

  // Orden cronológico para ambos grupos
  upcomingMonths.sort((a, b) => a.monthNum - b.monthNum);
  pastMonths.sort((a, b) => a.monthNum - b.monthNum);

  // La primera tarjeta corresponderá al próximo mes con pagos
  const orderedMonthGroups = upcomingMonths.length > 0 
    ? [...upcomingMonths, ...pastMonths]
    : pastMonths;

  matrixContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;">
      ${orderedMonthGroups.map(g => {
        const isPast = isMonthPassed(g);
        const monthTotal = g.items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const monthPending = g.items.filter(i => i.status !== 'pagado').reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const monthPaid = g.items.filter(i => i.status === 'pagado').reduce((acc, curr) => acc + (curr.amount || 0), 0);

        return `
          <div class="budget-month-card" style="background: white; border: 1px solid ${isPast ? '#cbd5e1' : '#e2e8f0'}; border-radius: 12px; padding: 1.15rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between; opacity: ${isPast ? '0.88' : '1'};">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; flex-wrap: wrap; gap: 0.4rem;">
                <div style="display: flex; align-items: center; gap: 0.45rem;">
                  <h4 style="font-size: 1.12rem; font-weight: 800; color: #1e293b; margin: 0;">📅 ${escapeHtml(g.name)}</h4>
                  ${isPast ? '<span class="badge" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; font-size: 0.72rem;">✓ Mes Pasado</span>' : ''}
                </div>
                <!-- Solo se muestra en verde 'Todo pagado' cuando se completen los pagos (sin etiqueta amarilla de Pendiente para evitar duplicidad) -->
                ${monthPending === 0 ? '<span class="badge badge-emerald">✓ Todo Pagado</span>' : ''}
              </div>

              <!-- Lista de pagos agrupados del mes (sin botón marcar pagado) -->
              <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.85rem;">
                ${g.items.map(item => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: ${item.status === 'pagado' ? '#f0fdf4' : '#f8fafc'}; padding: 0.65rem 0.75rem; border-radius: 8px; font-size: 0.85rem; border: 1px solid ${item.status === 'pagado' ? '#bbf7d0' : '#e2e8f0'};">
                    <div style="flex: 1; min-width: 0; padding-right: 0.5rem;">
                      <strong style="color: #0f172a; font-size: 0.9rem; display: block; word-break: break-word;">${escapeHtml(item.accommodationName || item.name || 'Alojamiento')}</strong>
                      ${item.dueDate ? `<div style="font-size: 0.75rem; color: #dc2626; font-weight: 600; margin-top: 2px;">📅 Vence: ${formatDueDateDayMonth(item.dueDate, g.name)}</div>` : ''}
                      ${item.url ? `<div><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-size: 0.75rem; text-decoration: underline; font-weight: 600;">🌐 Web alojamiento</a></div>` : ''}
                      ${item.note ? `<div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">${escapeHtml(item.note)}</div>` : ''}
                    </div>
                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; flex-shrink: 0;">
                      <div style="font-weight: 800; color: #0f172a; font-size: 0.95rem;">${formatCurrency(item.amount)}</div>
                      ${item.status === 'pagado' ? '<span style="font-size: 0.72rem; color: #16a34a; font-weight: 700;">✓ Pagado</span>' : ''}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Total PENDIENTE del mes -->
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 0.65rem; margin-top: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 0.95rem; color: #0f172a;">
                <span>Total PENDIENTE ${escapeHtml(g.name)}:</span>
                <span style="color: #2563eb; font-size: 1.08rem;">${formatCurrency(monthPending)}</span>
              </div>
              ${monthTotal > monthPending && monthPaid > 0 ? `
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #64748b; margin-top: 0.25rem;">
                  <span>Total estimado: ${formatCurrency(monthTotal)}</span>
                  <span>Pagado: <strong style="color: #16a34a;">${formatCurrency(monthPaid)}</strong></span>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  // Renderizar tabla de presupuesto resumen y calendario anual
  renderBudgetSummaryTable();
  renderOverviewPayments();
  renderFuelCalculator();

  // Asegurar vista sin scroll seleccionada
  switchBudgetView(currentBudgetView);
}

function renderBudgetSummaryTable() {
  const tbody = document.getElementById("budgetSummaryTbody");
  const tfoot = document.getElementById("budgetSummaryTfoot");
  const select = document.getElementById("filterBudgetTripSelect");
  const yearData = db.years[currentYear];
  if (!yearData || !tbody) return;

  const trips = yearData.trips || [];

  // Sincronizar opciones del selector de viajes
  if (select) {
    const currentVal = select.value || "ALL";
    const currentOpts = Array.from(select.options).map(o => o.value);
    const expectedOpts = ["ALL", ...trips.map(t => t.id)];
    
    // Solo repoblar si cambiaron los viajes
    if (currentOpts.join(",") !== expectedOpts.join(",")) {
      select.innerHTML = `<option value="ALL">Mostrar todos los viajes</option>` +
        trips.map(t => `<option value="${t.id}">${escapeHtml(t.title || t.name)}</option>`).join("");
      if (expectedOpts.includes(currentVal)) {
        select.value = currentVal;
      } else {
        select.value = "ALL";
      }
    }
  }

  const selectedTripId = select ? select.value : "ALL";
  const targetTrips = selectedTripId === "ALL" 
    ? trips 
    : trips.filter(t => t.id === selectedTripId);

  // 1. Alojamiento
  let accNights = 0;
  let accTotal = 0;
  let accPaid = 0;
  let accPending = 0;
  let accDetail = "";

  targetTrips.forEach(t => {
    if (t.stages && t.stages.length > 0) {
      t.stages.forEach(st => {
        accNights += (st.nights || 0);
        accTotal += (st.cost || 0);
        accPaid += (st.paid || 0);
        accPending += (st.pending || 0);
      });
      if (targetTrips.length === 1) {
        accDetail = `${t.stages.length} etapas: ${t.stages.map(s => s.accommodationName || s.name).join(", ")}`;
      }
    } else if (t.accommodation) {
      const cost = t.accommodation.totalCost || 0;
      const paid = getTripTotalPaid(t);
      const pending = Math.max(0, cost - paid);
      accNights += (t.accommodation.nights || 0);
      accTotal += cost;
      accPaid += paid;
      accPending += pending;
      if (targetTrips.length === 1) {
        accDetail = t.accommodation.name || "Alojamiento";
      }
    }
  });

  if (targetTrips.length > 1) {
    accDetail = `${targetTrips.length} viajes planificados (${accNights} noches en total)`;
  } else if (!accDetail && targetTrips.length === 1) {
    accDetail = targetTrips[0].title || "Alojamiento del viaje";
  }

  // 2. Gastos en ruta clasificados en los 6 conceptos restantes
  let totalGasolina = 0;
  let totalPeajes = 0;
  let totalCompras = 0;
  let totalRestaurantes = 0;
  let totalEfectivo = 0;
  let totalOtros = 0;

  targetTrips.forEach(t => {
    if (t.expenses && Array.isArray(t.expenses)) {
      t.expenses.forEach(exp => {
        const amt = parseFloat(exp.amount) || 0;
        const cat = (exp.category || "").toLowerCase();
        if (cat.includes("gasolina") || cat.includes("combustible")) {
          totalGasolina += amt;
        } else if (cat.includes("peaje") || cat.includes("autopista")) {
          totalPeajes += amt;
        } else if (cat.includes("compra") || cat.includes("super")) {
          totalCompras += amt;
        } else if (cat.includes("restaurante") || cat.includes("bar") || cat.includes("comida")) {
          totalRestaurantes += amt;
        } else if (cat.includes("efectivo")) {
          totalEfectivo += amt;
        } else {
          totalOtros += amt;
        }
      });
    }
  });

  const avgPerDay = (amt) => accNights > 0 ? (amt / accNights).toFixed(2) + " €/día" : "-";

  // Los 7 apartados solicitados expresamente
  const rows = [
    {
      name: "Alojamiento",
      detail: accDetail || "Estancias, apartamentos y campings",
      nights: accNights,
      total: accTotal,
      avg: avgPerDay(accTotal),
      paid: accPaid,
      pending: accPending,
      status: accPending === 0 ? "Completado" : "Pendiente"
    },
    {
      name: "Gasolina",
      detail: "Combustible y repostajes en ruta",
      nights: "-",
      total: totalGasolina,
      avg: avgPerDay(totalGasolina),
      paid: totalGasolina,
      pending: 0,
      status: totalGasolina > 0 ? "Pagado" : "Sin gastos"
    },
    {
      name: "Peajes",
      detail: "Peajes de autopistas y vías rápidas",
      nights: "-",
      total: totalPeajes,
      avg: avgPerDay(totalPeajes),
      paid: totalPeajes,
      pending: 0,
      status: totalPeajes > 0 ? "Pagado" : "Sin gastos"
    },
    {
      name: "Compras/Supermercados",
      detail: "Supermercados, provisiones y víveres",
      nights: "-",
      total: totalCompras,
      avg: avgPerDay(totalCompras),
      paid: totalCompras,
      pending: 0,
      status: totalCompras > 0 ? "Pagado" : "Sin gastos"
    },
    {
      name: "Restaurantes",
      detail: "Restaurantes, bares, menús y tapeo",
      nights: "-",
      total: totalRestaurantes,
      avg: avgPerDay(totalRestaurantes),
      paid: totalRestaurantes,
      pending: 0,
      status: totalRestaurantes > 0 ? "Pagado" : "Sin gastos"
    },
    {
      name: "Efectivo",
      detail: "Retiradas y pagos en metálico",
      nights: "-",
      total: totalEfectivo,
      avg: avgPerDay(totalEfectivo),
      paid: totalEfectivo,
      pending: 0,
      status: totalEfectivo > 0 ? "Pagado" : "Sin gastos"
    },
    {
      name: "Otros (cafés, recuerdos…)",
      detail: "Cafeterías, recuerdos, transportes y varios",
      nights: "-",
      total: totalOtros,
      avg: avgPerDay(totalOtros),
      paid: totalOtros,
      pending: 0,
      status: totalOtros > 0 ? "Pagado" : "Sin gastos"
    }
  ];

  let grandTotal = 0;
  let grandPaid = 0;
  let grandPending = 0;

  rows.forEach(r => {
    grandTotal += r.total;
    grandPaid += r.paid;
    grandPending += r.pending;
  });

  const grandAvg = accNights > 0 ? (grandTotal / accNights).toFixed(2) + " €/día" : "-";

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>
        <div style="font-weight: 700; color: #1e293b;">${escapeHtml(r.name)}</div>
        <div style="font-size: 0.75rem; color: #64748b;">${escapeHtml(r.detail)}</div>
      </td>
      <td style="text-align: center; font-weight: 600;">${r.nights}</td>
      <td style="font-weight: 700; color: #0f172a;">${formatCurrency(r.total)}</td>
      <td style="color: #64748b;">${r.avg}</td>
      <td style="color: #059669; font-weight: 600;">${formatCurrency(r.paid)}</td>
      <td style="color: #d97706; font-weight: 600;">${formatCurrency(r.pending)}</td>
    </tr>
  `).join("");

  const tfootContent = `
    <tr class="highlight" style="font-size: 0.95rem; border-top: 2px solid #cbd5e1; background: #f8fafc;">
      <td style="font-weight: 800; color: #1e3a8a;">
        ${selectedTripId === "ALL" ? 'TOTAL GENERAL DE GASTOS' : 'TOTAL GASTOS (' + escapeHtml(targetTrips[0]?.title || targetTrips[0]?.name || 'VIAJE') + ')'}
      </td>
      <td style="text-align: center; font-weight: 800; color: #1e3a8a;">${accNights}</td>
      <td style="color: #1e3a8a; font-weight: 800;">${formatCurrency(grandTotal)}</td>
      <td style="color: #64748b; font-weight: 700;">${grandAvg}</td>
      <td style="color: #059669; font-weight: 800;">${formatCurrency(grandPaid)}</td>
      <td style="color: #dc2626; font-weight: 800;">${formatCurrency(grandPending)}</td>
    </tr>
  `;

  if (tfoot) {
    tfoot.innerHTML = tfootContent;
  }
}

// ------------------------------------------------------------
// CALCULADORA DE GASTO EN COMBUSTIBLE
// ------------------------------------------------------------
function initFuelCalculator() {
  const fuelSelect = document.getElementById("filterFuelTripSelect");
  if (fuelSelect) {
    fuelSelect.removeEventListener("change", handleFuelTripChange);
    fuelSelect.addEventListener("change", handleFuelTripChange);
  }
  renderFuelCalculator();
}

function renderFuelCalculator() {
  const select = document.getElementById("filterFuelTripSelect");
  const yearData = db.years[currentYear];
  if (!yearData) return;

  const trips = yearData.trips || [];

  if (select) {
    const currentVal = select.value || "ALL";
    const currentOpts = Array.from(select.options).map(o => o.value);
    const expectedOpts = ["ALL", ...trips.map(t => t.id)];

    if (currentOpts.join(",") !== expectedOpts.join(",")) {
      select.innerHTML = `<option value="ALL">Mostrar todos los viajes</option>` +
        trips.map(t => `<option value="${t.id}">${escapeHtml(t.title || t.name)} (${t.distanceKm || 0} km)</option>`).join("");
      if (expectedOpts.includes(currentVal)) {
        select.value = currentVal;
      } else {
        select.value = "ALL";
      }
    }
  }

  handleFuelTripChange();
}

function handleFuelTripChange() {
  const select = document.getElementById("filterFuelTripSelect");
  const yearData = db.years[currentYear];
  if (!yearData) return;

  const trips = yearData.trips || [];
  const selectedTripId = select ? select.value : "ALL";

  const calcKmInput = document.getElementById("calcKm");
  const calcConsInput = document.getElementById("calcConsumption");
  const calcPriceInput = document.getElementById("calcPrice");

  if (!calcKmInput) return;

  if (selectedTripId === "ALL") {
    const sumKm = trips.reduce((acc, t) => acc + (parseFloat(t.distanceKm) || 0), 0);
    const defaultKm = sumKm > 0 ? sumKm : ((yearData.generalBudget && yearData.generalBudget.fuelEstimate && yearData.generalBudget.fuelEstimate.totalTripKm) || 2430);
    calcKmInput.value = defaultKm;
  } else {
    const trip = trips.find(t => t.id === selectedTripId);
    if (trip) {
      calcKmInput.value = parseFloat(trip.distanceKm) || 0;
    }
  }

  if (calcConsInput && (!calcConsInput.value || parseFloat(calcConsInput.value) === 0)) {
    calcConsInput.value = (yearData.generalBudget && yearData.generalBudget.fuelEstimate && yearData.generalBudget.fuelEstimate.consumptionPer100) || 7.2;
  }
  if (calcPriceInput && (!calcPriceInput.value || parseFloat(calcPriceInput.value) === 0)) {
    calcPriceInput.value = (yearData.generalBudget && yearData.generalBudget.fuelEstimate && yearData.generalBudget.fuelEstimate.pricePerLiter) || 1.65;
  }

  updateFuelCalculation();
}

function updateFuelCalculation() {
  const kmEl = document.getElementById("calcKm");
  const consEl = document.getElementById("calcConsumption");
  const priceEl = document.getElementById("calcPrice");
  if (!kmEl || !consEl || !priceEl) return;

  const km = parseFloat(kmEl.value) || 0;
  const consumption = parseFloat(consEl.value) || 0;
  const price = parseFloat(priceEl.value) || 0;

  const totalLiters = (km * consumption) / 100;
  const totalCost = totalLiters * price;

  const costEl = document.getElementById("calcTotalFuelCost");
  const litersEl = document.getElementById("calcLiters");
  if (costEl) costEl.textContent = formatCurrency(totalCost);
  if (litersEl) litersEl.textContent = `Consumo total estimado: ~${Math.round(totalLiters)} litros (${km} km)`;
}

// ------------------------------------------------------------
// GESTIÓN DE VIAJES (CREAR / EDITAR DATOS GENERALES Y ETAPAS)
// ------------------------------------------------------------
let currentModalStages = [];

function renderTripStagesEditorInModal() {
  const container = document.getElementById("tripAccommodationFieldsContainer");
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
      <div>
        <strong style="color: #1e3a8a; font-size: 0.95rem;">📍 Estancias y Etapas del Viaje (${currentModalStages.length} etapas):</strong>
        <p style="font-size: 0.8rem; color: #64748b; margin: 0.2rem 0 0;">Configura cada etapa con su propio alojamiento, noches y presupuesto:</p>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" onclick="addNewStageToModal()" style="font-size: 0.8rem; font-weight: 700; color: #4338ca; border-color: #c7d2fe; background: #e0e7ff;">
        ➕ Añadir Etapa
      </button>
    </div>
    <div id="modalStagesCardList" style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 320px; overflow-y: auto; padding-right: 0.25rem;">
      ${currentModalStages.map((st, sIdx) => {
        const pal = STAGE_COLOR_PALETTES[sIdx % STAGE_COLOR_PALETTES.length];
        return `
          <div class="stage-editor-card" id="stage_editor_card_${sIdx}" style="background: #f8fafc; border: 1.5px solid ${pal.badgeBorder}; border-left: 6px solid ${pal.border}; border-radius: 8px; padding: 0.75rem; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <strong style="font-size: 0.85rem; color: #0f172a;">${pal.icon} Etapa ${sIdx + 1}</strong>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge" style="background:${pal.badgeBg}; color:${pal.badgeText}; font-size: 0.7rem;">Etapa ${sIdx + 1}</span>
                ${currentModalStages.length > 1 ? `
                  <button type="button" class="btn btn-sm" onclick="removeStageFromModal(${sIdx})" title="Eliminar esta etapa" style="padding: 0.15rem 0.45rem; font-size: 0.75rem; color: #e11d48; background: #ffe4e6; border: 1px solid #fecdd3; border-radius: 4px; cursor: pointer;">
                    🗑️
                  </button>
                ` : ''}
              </div>
            </div>
            <div class="form-row" style="margin-bottom: 0.4rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.75rem;">Nombre Etapa:</label>
                <input type="text" id="stage_name_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${escapeHtml(st.name || `Etapa ${sIdx + 1}`)}" oninput="syncStageFromInput(${sIdx}, 'name', this.value)">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.75rem;">Destino Etapa:</label>
                <input type="text" id="stage_destination_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${escapeHtml(st.destination || '')}" placeholder="Ej. Potes (Cantabria)" oninput="syncStageFromInput(${sIdx}, 'destination', this.value)">
              </div>
            </div>
            <div class="form-row" style="margin-bottom: 0.4rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.75rem;">Alojamiento / Camping:</label>
                <input type="text" id="stage_accom_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${escapeHtml(st.accommodationName || '')}" placeholder="Ej. Camping La Viorna" oninput="syncStageFromInput(${sIdx}, 'accommodationName', this.value)">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.75rem;">Plataforma / Modo:</label>
                <input type="text" id="stage_platform_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${escapeHtml(st.platform || 'Booking / Web')}" oninput="syncStageFromInput(${sIdx}, 'platform', this.value)">
              </div>
            </div>
            <div class="form-row" style="margin-bottom: 0.4rem;">
              <div class="form-group" style="margin-bottom: 0; flex: 2;">
                <label class="form-label" style="font-size: 0.75rem;">🌐 Enlace Web Alojamiento:</label>
                <input type="url" id="stage_url_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${escapeHtml(st.url || '')}" placeholder="https://..." oninput="syncStageFromInput(${sIdx}, 'url', this.value)">
              </div>
              <div class="form-group" style="margin-bottom: 0; flex: 1;">
                <label class="form-label" style="font-size: 0.75rem;">📅 Próximo Pago (Día y Mes):</label>
                <input type="date" id="stage_due_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${st.dueDate || ''}" onchange="syncStageFromInput(${sIdx}, 'dueDate', this.value); handleDueDateChange(this, 'stage_month_${sIdx}')">
              </div>
              <div class="form-group" style="margin-bottom: 0; flex: 1;">
                <label class="form-label" style="font-size: 0.75rem;">Mes de Pago:</label>
                <input type="text" id="stage_month_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${escapeHtml(st.paymentMonth || 'Julio')}" oninput="syncStageFromInput(${sIdx}, 'paymentMonth', this.value)">
              </div>
            </div>
            <div class="form-row" style="margin-bottom: 0;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.75rem;">Noches:</label>
                <input type="number" id="stage_nights_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${st.nights || 0}" min="0" oninput="syncStageFromInput(${sIdx}, 'nights', this.value)">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.75rem;">Coste (€):</label>
                <input type="number" id="stage_cost_${sIdx}" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;" value="${st.cost || 0}" step="0.5" min="0" oninput="syncStageFromInput(${sIdx}, 'cost', this.value)">
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function syncStageFromInput(sIdx, field, val) {
  if (!currentModalStages || !currentModalStages[sIdx]) return;
  if (field === 'nights') {
    currentModalStages[sIdx].nights = parseInt(val) || 0;
  } else if (field === 'cost') {
    currentModalStages[sIdx].cost = parseFloat(val) || 0;
  } else {
    currentModalStages[sIdx][field] = val;
  }
}

function addNewStageToModal() {
  const nextNum = (currentModalStages.length + 1);
  currentModalStages.push({
    name: `Etapa ${nextNum}`,
    destination: "",
    accommodationName: "",
    platform: "Booking / Airbnb",
    nights: 3,
    cost: 0,
    paymentMonth: "Julio"
  });
  renderTripStagesEditorInModal();
}

function removeStageFromModal(sIdx) {
  if (currentModalStages.length <= 1) {
    alert("Un viaje por etapas debe tener al menos una etapa.");
    return;
  }
  currentModalStages.splice(sIdx, 1);
  renderTripStagesEditorInModal();
}

function handleTripModeChange(mode) {
  const container = document.getElementById("tripAccommodationFieldsContainer");
  if (!container) return;

  if (mode === 'stages') {
    if (!currentModalStages || currentModalStages.length === 0) {
      currentModalStages = [
        {
          name: "Etapa 1",
          destination: "",
          accommodationName: "",
          platform: "Booking / Airbnb",
          nights: 4,
          cost: 0,
          paymentMonth: "Julio"
        },
        {
          name: "Etapa 2",
          destination: "",
          accommodationName: "",
          platform: "Camping / Bungalow",
          nights: 4,
          cost: 0,
          paymentMonth: "Agosto"
        }
      ];
    }
    renderTripStagesEditorInModal();
  } else {
    container.innerHTML = `
      <div style="margin-bottom: 0.5rem;">
        <strong style="color: #065f46; font-size: 0.95rem;">🏠 Datos de Alojamiento / Estancia Única:</strong>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nombre Alojamiento / Camping:</label>
          <input type="text" id="inputTripAccomName" class="form-control" placeholder="Ej. Apartamento Galdakao" value="">
        </div>
        <div class="form-group">
          <label class="form-label">Plataforma / Modo Reserva:</label>
          <input type="text" id="inputTripPlatform" class="form-control" placeholder="Ej. Airbnb, Booking, Camping" value="Booking / Airbnb">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" style="flex: 2;">
          <label class="form-label">🌐 Enlace Web del Alojamiento:</label>
          <input type="url" id="inputTripAccomUrl" class="form-control" placeholder="https://booking.com/... o web camping" value="">
        </div>
        <div class="form-group" style="flex: 1;">
          <label class="form-label">📅 Próximo Pago (Día y Mes):</label>
          <input type="date" id="inputTripDueDate" class="form-control" value="" onchange="handleDueDateChange(this, 'inputTripPaymentMonth')">
        </div>
        <div class="form-group" style="flex: 1;">
          <label class="form-label">Mes de Pago Previsto:</label>
          <input type="text" id="inputTripPaymentMonth" class="form-control" placeholder="Ej. Marzo, Julio" value="">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Noches:</label>
          <input type="number" id="inputTripNights" class="form-control" min="0" value="${(() => {
            const sVal = document.getElementById('inputTripStartDate')?.value;
            const eVal = document.getElementById('inputTripEndDate')?.value;
            if (sVal && eVal) {
              const s = new Date(sVal + 'T00:00:00');
              const e = new Date(eVal + 'T00:00:00');
              return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
            }
            return 1;
          })()}">
        </div>
        <div class="form-group">
          <label class="form-label">Coste Estancia (€):</label>
          <input type="number" id="inputTripCost" class="form-control" min="0" step="0.5" value="0">
        </div>
      </div>
    `;
  }
}

function openTripModal(tripToEdit = null) {
  const modal = document.getElementById("modalTrip");
  document.getElementById("tripEditId").value = tripToEdit ? tripToEdit.id : "";

  const radioSingle = document.getElementById("radioTripModeSingle");
  const radioStages = document.getElementById("radioTripModeStages");

  if (tripToEdit) {
    const range = getTripDateRange(tripToEdit);
    document.getElementById("modalTripTitle").textContent = "✏️ Modificar Datos Generales del Viaje";
    document.getElementById("inputTripName").value = tripToEdit.name || "";
    document.getElementById("inputTripCategory").value = tripToEdit.category || "";
    document.getElementById("inputTripPeriod").value = tripToEdit.period || "";
    document.getElementById("inputTripStartDate").value = tripToEdit.startDate || range.start || "";
    document.getElementById("inputTripEndDate").value = tripToEdit.endDate || range.end || "";
    document.getElementById("inputTripOrigin").value = tripToEdit.origin || "";
    document.getElementById("inputTripDestination").value = tripToEdit.destination || "";
    document.getElementById("inputTripDistanceKm").value = tripToEdit.distanceKm || "";
    document.getElementById("inputTripEstimatedTime").value = tripToEdit.estimatedTime || "";

    if (tripToEdit.stages && tripToEdit.stages.length > 0) {
      if (radioStages) radioStages.checked = true;
      if (radioSingle) radioSingle.checked = false;
      currentModalStages = JSON.parse(JSON.stringify(tripToEdit.stages));
      renderTripStagesEditorInModal();
    } else {
      if (radioSingle) radioSingle.checked = true;
      if (radioStages) radioStages.checked = false;
      currentModalStages = [];
      const acc = tripToEdit.accommodation || {};
      const container = document.getElementById("tripAccommodationFieldsContainer");
      container.innerHTML = `
        <div style="margin-bottom: 0.5rem;">
          <strong style="color: #065f46; font-size: 0.95rem;">🏠 Datos de Alojamiento / Estancia Única:</strong>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre Alojamiento / Camping:</label>
            <input type="text" id="inputTripAccomName" class="form-control" placeholder="Ej. Apartamento Galdakao" value="${escapeHtml(acc.name || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Plataforma / Modo Reserva:</label>
            <input type="text" id="inputTripPlatform" class="form-control" placeholder="Ej. Airbnb, Booking, Camping" value="${escapeHtml(acc.platform || '')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label">🌐 Enlace Web del Alojamiento:</label>
            <input type="url" id="inputTripAccomUrl" class="form-control" placeholder="https://booking.com/... o web camping" value="${escapeHtml(acc.url || '')}">
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">📅 Próximo Pago (Día y Mes):</label>
            <input type="date" id="inputTripDueDate" class="form-control" value="${acc.dueDate || ''}" onchange="handleDueDateChange(this, 'inputTripPaymentMonth')">
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Mes de Pago Previsto:</label>
            <input type="text" id="inputTripPaymentMonth" class="form-control" placeholder="Ej. Marzo, Julio" value="${escapeHtml(acc.paymentMonth || '')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Noches:</label>
            <input type="number" id="inputTripNights" class="form-control" min="0" value="${acc.nights || 7}">
          </div>
          <div class="form-group">
            <label class="form-label">Coste Estancia (€):</label>
            <input type="number" id="inputTripCost" class="form-control" min="0" step="0.5" value="${acc.totalCost || 0}">
          </div>
        </div>
      `;
    }
  } else {
    const todayStr = getTodayString();
    const startDateObj = new Date(todayStr + "T00:00:00");
    const nextDayObj = new Date(startDateObj);
    nextDayObj.setDate(nextDayObj.getDate() + 1);
    const nextDayStr = formatDateIso(nextDayObj);

    document.getElementById("modalTripTitle").textContent = "➕ Añadir Nuevo Viaje";
    document.getElementById("inputTripName").value = "";
    document.getElementById("inputTripCategory").value = "Vacaciones";
    document.getElementById("inputTripPeriod").value = "";
    document.getElementById("inputTripStartDate").value = todayStr;
    document.getElementById("inputTripEndDate").value = nextDayStr;
    document.getElementById("inputTripOrigin").value = "Castellón";
    document.getElementById("inputTripDestination").value = "";
    document.getElementById("inputTripDistanceKm").value = "";
    document.getElementById("inputTripEstimatedTime").value = "";

    if (radioSingle) radioSingle.checked = true;
    if (radioStages) radioStages.checked = false;
    currentModalStages = [];
    handleTripModeChange('single');

    // Noches según fechas introducidas: 1 noche por defecto
    const nightsInput = document.getElementById("inputTripNights");
    if (nightsInput) nightsInput.value = 1;

    // Mes de pago previsto en blanco
    const payMonthInput = document.getElementById("inputTripPaymentMonth");
    if (payMonthInput) payMonthInput.value = "";
  }

  const btnDeleteModal = document.getElementById("btnDeleteTripFromModal");
  if (btnDeleteModal) {
    btnDeleteModal.style.display = tripToEdit ? "inline-flex" : "none";
    btnDeleteModal.onclick = () => {
      closeModal("modalTrip");
      promptDeleteTrip(tripToEdit.id);
    };
  }

  openModal("modalTrip");
}

function handleSaveTrip(e) {
  if (e && e.preventDefault) e.preventDefault();
  const yearData = db.years[currentYear];
  if (!yearData) return;
  if (!yearData.trips) yearData.trips = [];

  const tripId = document.getElementById("tripEditId").value;
  const name = document.getElementById("inputTripName").value.trim();

  if (!name) {
    alert("Por favor, introduce el nombre del viaje.");
    return;
  }

  const startDate = document.getElementById("inputTripStartDate").value;
  const endDate = document.getElementById("inputTripEndDate").value || startDate;
  const category = document.getElementById("inputTripCategory").value.trim() || "Vacaciones";
  const period = document.getElementById("inputTripPeriod").value.trim() || `${startDate} - ${endDate}`;
  const origin = document.getElementById("inputTripOrigin").value.trim() || "Castellón";
  const destination = document.getElementById("inputTripDestination").value.trim();
  const distanceKm = parseInt(document.getElementById("inputTripDistanceKm").value) || 0;
  const estimatedTime = document.getElementById("inputTripEstimatedTime").value.trim();

  const radioStages = document.getElementById("radioTripModeStages");
  const isStagesMode = radioStages && radioStages.checked;

  if (tripId) {
    // Editar viaje existente
    const trip = yearData.trips.find(t => t.id === tripId);
    if (trip) {
      trip.name = name;
      trip.category = category;
      trip.period = period;
      trip.startDate = startDate;
      trip.endDate = endDate;
      trip.origin = origin;
      trip.destination = destination;
      trip.distanceKm = distanceKm;
      trip.estimatedTime = estimatedTime;

      if (isStagesMode) {
        if (!trip.stages) trip.stages = [];
        
        currentModalStages.forEach((st, sIdx) => {
          const nameEl = document.getElementById(`stage_name_${sIdx}`);
          const destEl = document.getElementById(`stage_destination_${sIdx}`);
          const accomEl = document.getElementById(`stage_accom_${sIdx}`);
          const platEl = document.getElementById(`stage_platform_${sIdx}`);
          const nightsEl = document.getElementById(`stage_nights_${sIdx}`);
          const costEl = document.getElementById(`stage_cost_${sIdx}`);
          const monthEl = document.getElementById(`stage_month_${sIdx}`);
          const urlEl = document.getElementById(`stage_url_${sIdx}`);
          const dueEl = document.getElementById(`stage_due_${sIdx}`);

          const stName = nameEl ? nameEl.value.trim() : (st.name || `Etapa ${sIdx + 1}`);
          const stDest = destEl ? destEl.value.trim() : (st.destination || '');
          const stAccom = accomEl ? accomEl.value.trim() : (st.accommodationName || '');
          const stPlat = platEl ? platEl.value.trim() : (st.platform || 'Booking / Airbnb');
          const stNights = nightsEl ? parseInt(nightsEl.value) || 0 : (st.nights || 0);
          const stCost = costEl ? parseFloat(costEl.value) || 0 : (st.cost || 0);
          const stMonth = monthEl ? monthEl.value.trim() : (st.paymentMonth || '');
          const stUrl = urlEl ? urlEl.value.trim() : (st.url || '');
          const stDue = dueEl ? dueEl.value.trim() : (st.dueDate || '');

          if (trip.stages[sIdx]) {
            trip.stages[sIdx].name = stName;
            trip.stages[sIdx].destination = stDest;
            trip.stages[sIdx].accommodationName = stAccom;
            trip.stages[sIdx].platform = stPlat;
            trip.stages[sIdx].nights = stNights;
            trip.stages[sIdx].cost = stCost;
            trip.stages[sIdx].paymentMonth = stMonth;
            trip.stages[sIdx].url = stUrl;
            trip.stages[sIdx].dueDate = stDue;
            trip.stages[sIdx].pending = Math.max(0, stCost - (trip.stages[sIdx].paid || 0));
          } else {
            // Nueva etapa añadida al viaje existente
            trip.stages.push({
              id: `stage_${Date.now()}_${sIdx}`,
              name: stName,
              destination: stDest,
              accommodationName: stAccom,
              platform: stPlat,
              nights: stNights,
              cost: stCost,
              paid: 0,
              pending: stCost,
              paymentMonth: stMonth,
              url: stUrl,
              dueDate: stDue,
              days: []
            });
          }
        });

        // Si se eliminaron etapas
        if (trip.stages.length > currentModalStages.length) {
          trip.stages.splice(currentModalStages.length);
        }
      } else {
        delete trip.stages;
        const inputAccomName = document.getElementById("inputTripAccomName");
        const inputPlatform = document.getElementById("inputTripPlatform");
        const inputNights = document.getElementById("inputTripNights");
        const inputCost = document.getElementById("inputTripCost");
        const inputMonth = document.getElementById("inputTripPaymentMonth");
        const inputUrl = document.getElementById("inputTripAccomUrl");
        const inputDue = document.getElementById("inputTripDueDate");

        if (!trip.accommodation) trip.accommodation = {};
        if (inputAccomName) trip.accommodation.name = inputAccomName.value.trim();
        if (inputPlatform) trip.accommodation.platform = inputPlatform.value.trim();
        const nights = inputNights ? parseInt(inputNights.value) || 0 : (trip.accommodation.nights || 0);
        const cost = inputCost ? parseFloat(inputCost.value) || 0 : (trip.accommodation.totalCost || 0);
        trip.accommodation.nights = nights;
        trip.accommodation.totalCost = cost;
        if (inputMonth) trip.accommodation.paymentMonth = inputMonth.value.trim();
        if (inputUrl) trip.accommodation.url = inputUrl.value.trim();
        if (inputDue) trip.accommodation.dueDate = inputDue.value.trim();
        const totalPaid = (trip.advances || []).reduce((acc, a) => acc + (a.amount || 0), 0);
        trip.accommodation.paidCost = totalPaid;
        trip.accommodation.pendingCost = Math.max(0, cost - totalPaid);
      }

      recalculateAllTripFinancials(trip);
      showToast("Datos generales del viaje actualizados con éxito", "success");
    }
  } else {
    // CREAR NUEVO VIAJE
    const newId = 'trip_' + Date.now();
    let newTrip = {
      id: newId,
      name: name,
      category: category,
      period: period,
      startDate: startDate,
      endDate: endDate,
      status: "Planificado",
      badgeColor: "blue",
      origin: origin,
      destination: destination,
      distanceKm: distanceKm,
      estimatedTime: estimatedTime,
      days: [],
      tickets: [],
      expenses: [],
      advances: []
    };

    if (isStagesMode && currentModalStages && currentModalStages.length > 0) {
      newTrip.stages = currentModalStages.map((st, sIdx) => {
        const nameEl = document.getElementById(`stage_name_${sIdx}`);
        const destEl = document.getElementById(`stage_destination_${sIdx}`);
        const accomEl = document.getElementById(`stage_accom_${sIdx}`);
        const platEl = document.getElementById(`stage_platform_${sIdx}`);
        const nightsEl = document.getElementById(`stage_nights_${sIdx}`);
        const costEl = document.getElementById(`stage_cost_${sIdx}`);
        const monthEl = document.getElementById(`stage_month_${sIdx}`);
        const urlEl = document.getElementById(`stage_url_${sIdx}`);
        const dueEl = document.getElementById(`stage_due_${sIdx}`);

        const stName = nameEl ? nameEl.value.trim() : (st.name || `Etapa ${sIdx + 1}`);
        const stDest = destEl ? destEl.value.trim() : (st.destination || '');
        const stAccom = accomEl ? accomEl.value.trim() : (st.accommodationName || '');
        const stPlat = platEl ? platEl.value.trim() : (st.platform || 'Booking / Airbnb');
        const stNights = nightsEl ? parseInt(nightsEl.value) || 0 : (st.nights || 0);
        const stCost = costEl ? parseFloat(costEl.value) || 0 : (st.cost || 0);
        const stMonth = monthEl ? monthEl.value.trim() : (st.paymentMonth || 'Julio');
        const stUrl = urlEl ? urlEl.value.trim() : (st.url || '');
        const stDue = dueEl ? dueEl.value.trim() : (st.dueDate || '');

        return {
          id: `stage_${Date.now()}_${sIdx}`,
          name: stName,
          destination: stDest,
          accommodationName: stAccom,
          platform: stPlat,
          nights: stNights,
          cost: stCost,
          paid: 0,
          pending: stCost,
          paymentMonth: stMonth,
          url: stUrl,
          dueDate: stDue,
          days: []
        };
      });

      const totalNights = newTrip.stages.reduce((acc, s) => acc + (s.nights || 0), 0);
      const totalCost = newTrip.stages.reduce((acc, s) => acc + (s.cost || 0), 0);
      newTrip.accommodation = {
        name: `Ruta en ${newTrip.stages.length} etapas`,
        platform: "Varios",
        nights: totalNights,
        totalCost: totalCost,
        pendingCost: totalCost,
        paidCost: 0,
        paymentMonth: newTrip.stages[0]?.paymentMonth || "Julio",
        dueDate: newTrip.stages[0]?.dueDate || "",
        url: newTrip.stages[0]?.url || ""
      };
    } else {
      const inputAccomName = document.getElementById("inputTripAccomName");
      const inputPlatform = document.getElementById("inputTripPlatform");
      const inputNights = document.getElementById("inputTripNights");
      const inputCost = document.getElementById("inputTripCost");
      const inputMonth = document.getElementById("inputTripPaymentMonth");
      const inputUrl = document.getElementById("inputTripAccomUrl");
      const inputDue = document.getElementById("inputTripDueDate");

      const nights = inputNights ? parseInt(inputNights.value) || 0 : 7;
      const cost = inputCost ? parseFloat(inputCost.value) || 0 : 0;
      const month = inputMonth ? inputMonth.value.trim() : "Julio";

      newTrip.accommodation = {
        name: inputAccomName ? inputAccomName.value.trim() : "",
        platform: inputPlatform ? inputPlatform.value.trim() : "Booking / Airbnb",
        nights: nights,
        totalCost: cost,
        pendingCost: cost,
        paidCost: 0,
        paymentMonth: month,
        url: inputUrl ? inputUrl.value.trim() : "",
        dueDate: inputDue ? inputDue.value.trim() : ""
      };
    }

    yearData.trips.push(newTrip);
    currentTripId = newId;
    recalculateAllTripFinancials(newTrip);
    showToast("¡Nuevo viaje creado con éxito!", "success");
  }

  saveDatabase(db);
  closeModal("modalTrip");
  initApp();
}

function recalculateTripTotals(trip) {
  recalculateAllTripFinancials(trip);
}

// ------------------------------------------------------------
// EXPORTACIÓN E IMPORTACIÓN JSON (BACKUP)
// ------------------------------------------------------------
function exportDatabaseToJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `planificador_viajes_backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Copia de seguridad descargada en archivo JSON", "success");
}

function importDatabaseFromJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && imported.years) {
        db = imported;
        saveDatabase(db);
        closeModal("modalBackup");
        initApp();
        showToast("¡Base de datos restaurada correctamente desde el archivo JSON!", "success");
      } else {
        alert("El archivo JSON no tiene el formato esperado.");
      }
    } catch (err) {
      alert("Error al leer el archivo JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ------------------------------------------------------------
// UTILIDADES: MODALES, TOASTS, FORMATOS
// ------------------------------------------------------------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("open");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("open");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>ℹ️</span> <div>${escapeHtml(message)}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function formatCurrency(val) {
  if (isNaN(val)) return "0,00 €";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(val);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Exponer funciones necesarias al objeto global window
window.switchTab = switchTab;
window.selectTripAndGoTab = selectTripAndGoTab;
window.changeActiveTrip = changeActiveTrip;
window.openDayModal = openDayModal;
window.deleteDay = deleteDay;
window.openTicketModal = openTicketModal;
window.deleteTicket = deleteTicket;
window.toggleTicketStatus = toggleTicketStatus;
window.openExpenseModal = openExpenseModal;
window.deleteExpense = deleteExpense;
window.openTripModal = openTripModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleTargetPaymentStatus = toggleTargetPaymentStatus;
window.renderHistoricalMeals = renderHistoricalMeals;
window.copyHistoricalMealToCurrent = copyHistoricalMealToCurrent;
window.copyMealItemToClipboard = copyMealItemToClipboard;
window.promptDeleteTrip = promptDeleteTrip;
window.handleConfirmDeleteTrip = handleConfirmDeleteTrip;
window.openAdvanceModal = openAdvanceModal;
window.deleteAdvance = deleteAdvance;
window.handleSaveAdvance = handleSaveAdvance;
window.renderAdvancesSection = renderAdvancesSection;
window.saveInlineDayPlan = saveInlineDayPlan;
window.handleInlineMealSelectChange = handleInlineMealSelectChange;
window.handleInlineMealDetailChange = handleInlineMealDetailChange;
window.setMealResourceFilter = setMealResourceFilter;
window.filterMealResources = filterMealResources;
window.switchHistoricalTrip = switchHistoricalTrip;
window.toggleHistoricalRestaurantFilter = toggleHistoricalRestaurantFilter;
window.openNewMealResourceModal = openNewMealResourceModal;
window.handleSaveMealResource = handleSaveMealResource;
window.setMealTagFilter = setMealTagFilter;
window.createAndSelectMealTag = createAndSelectMealTag;
window.toggleSuggestedMealTag = toggleSuggestedMealTag;
window.removeSelectedMealTag = removeSelectedMealTag;
window.renderMealTagsFilterBar = renderMealTagsFilterBar;
window.openAssignMealModal = openAssignMealModal;
window.handleAssignMealTripChange = handleAssignMealTripChange;
window.handleAssignMealStageChange = handleAssignMealStageChange;
window.handleConfirmAssignMeal = handleConfirmAssignMeal;
window.getCurrentTrip = getCurrentTrip;
window.handleTripModeChange = handleTripModeChange;
window.addNewStageToModal = addNewStageToModal;
window.removeStageFromModal = removeStageFromModal;
window.syncStageFromInput = syncStageFromInput;
window.saveTransitionStageDayPlan = saveTransitionStageDayPlan;
window.handleSaveTrip = handleSaveTrip;
window.recalculateTripTotals = recalculateTripTotals;
window.recalculateAllTripFinancials = recalculateAllTripFinancials;
window.handleDueDateChange = handleDueDateChange;
window.formatDueDateDayMonth = formatDueDateDayMonth;
window.syncYearScheduledPayments = syncYearScheduledPayments;
window.renderPendingExpensesSection = renderPendingExpensesSection;
window.markPendingTicketAsBought = markPendingTicketAsBought;
window.selectTripAndGoToTickets = selectTripAndGoToTickets;
window.handleExpenseTripChange = handleExpenseTripChange;
window.renderBudgetSummaryTable = renderBudgetSummaryTable;
window.switchOverviewView = switchOverviewView;
window.goToMealBankForDay = goToMealBankForDay;
window.openEditMealResourceModal = openEditMealResourceModal;
window.deleteMealResource = deleteMealResource;
window.handleTicketsTripFilterChange = handleTicketsTripFilterChange;
window.handleTicketTripChange = handleTicketTripChange;
window.toggleTicketStatusById = toggleTicketStatusById;
window.deleteTicketById = deleteTicketById;
window.switchExpensesSection = switchExpensesSection;
window.openManageMealTagsModal = openManageMealTagsModal;
window.renderManageTagsList = renderManageTagsList;
window.handleCreateTagFromManageModal = handleCreateTagFromManageModal;
window.editMealTag = editMealTag;
window.deleteMealTag = deleteMealTag;
window.promptDeleteYear = promptDeleteYear;
window.openDeleteYearModal = openDeleteYearModal;
window.handleDeleteYearInputCheck = handleDeleteYearInputCheck;
window.executeSafeDeleteYear = executeSafeDeleteYear;
window.handleReorderItineraryDays = handleReorderItineraryDays;
window.switchBudgetView = switchBudgetView;
window.handleFuelTripChange = handleFuelTripChange;
window.renderFuelCalculator = renderFuelCalculator;
window.updateFuelCalculation = updateFuelCalculation;
window.WEEKDAYS_MAP = WEEKDAYS_MAP;
window.closeModal = closeModal;
window.ROUTE_CACHE_GOOGLE_MAPS = ROUTE_CACHE_GOOGLE_MAPS;
window.KNOWN_LOCATIONS_COORDS = KNOWN_LOCATIONS_COORDS;
window.getDayRoutePoints = getDayRoutePoints;
window.calculateRouteMetrics = calculateRouteMetrics;
window.getDayRouteMetrics = getDayRouteMetrics;
window.updateItineraryDistancesDynamically = updateItineraryDistancesDynamically;
window.syncItineraryWithGoogleMaps = syncItineraryWithGoogleMaps;
window.openDayRouteModal = openDayRouteModal;
window.saveDayRouteFromDedicatedModal = saveDayRouteFromDedicatedModal;
window.updateModalRoutePreview = updateModalRoutePreview;
window.updateDedicatedRouteModalPreview = updateDedicatedRouteModalPreview;
window.clearRouteField = clearRouteField;
window.openMapPickerModal = openMapPickerModal;
window.initOrUpdatePickerMap = initOrUpdatePickerMap;
window.handleMapPickerClick = handleMapPickerClick;
window.handleMapPickerSearch = handleMapPickerSearch;
window.applyNamedLocationToPicker = applyNamedLocationToPicker;
window.selectMapPreset = selectMapPreset;
window.clearMapPickerSelection = clearMapPickerSelection;
window.confirmMapPickerSelection = confirmMapPickerSelection;
window.toggleMapPickerMode = toggleMapPickerMode;
window.getDayActivities = getDayActivities;
window.renderModalActivitiesList = renderModalActivitiesList;
window.addModalActivityLine = addModalActivityLine;
window.removeModalActivityLine = removeModalActivityLine;
window.toggleModalActRouteSection = toggleModalActRouteSection;
window.updateModalActivityText = updateModalActivityText;
window.updateModalActivityRouteField = updateModalActivityRouteField;
window.updateModalActivityStopCount = updateModalActivityStopCount;
window.handleStopCountChange = handleStopCountChange;
window.handleCustomRouteMetricChange = handleCustomRouteMetricChange;
window.switchRouteModalActivity = switchRouteModalActivity;
window.renderDayLinksHtml = renderDayLinksHtml;
window.formatMinutesToHhMm = formatMinutesToHhMm;
window.parseTimeToMinutes = parseTimeToMinutes;
window.updateModalActivityStopDuration = updateModalActivityStopDuration;
window.renderDayRouteBoxHtml = renderDayRouteBoxHtml;
window.renderDayActivitiesCell = renderDayActivitiesCell;
window.updateMapPickerUI = updateMapPickerUI;
window.getCurrentPickedLocation = () => currentPickedLocation;

Object.defineProperty(window, 'db', {
  get: () => db,
  set: (val) => { db = val; }
});

Object.defineProperty(window, 'currentTripId', {
  get: () => currentTripId,
  set: (val) => { currentTripId = val; }
});

Object.defineProperty(window, 'currentYear', {
  get: () => currentYear,
  set: (val) => { currentYear = val; }
});



Object.defineProperty(window, 'currentPickedLocation', {
  get: () => currentPickedLocation,
  set: (val) => { currentPickedLocation = val; }
});



window.setMapTileLayer = setMapTileLayer;
window.updateRouteModalMiniMap = updateRouteModalMiniMap;

window.handleReorderDayActivities = handleReorderDayActivities;
window.handleReorderModalActivities = handleReorderModalActivities;
window.getModalActivitiesState = () => modalDayActivitiesListState;
window.setModalActivitiesState = (val) => { modalDayActivitiesListState = val; };
window.getModalDayActivitiesListState = () => modalDayActivitiesListState;
window.attachItineraryActivityDragEvents = attachItineraryActivityDragEvents;
window.attachModalActivityDragEvents = attachModalActivityDragEvents;
window.toggleActivityNoDisplacement = toggleActivityNoDisplacement;
window.toggleRouteModalNoDisplacement = toggleRouteModalNoDisplacement;
window.updateModalActivityRowMetrics = updateModalActivityRowMetrics;
window.TRAVEL_QUOTES = TRAVEL_QUOTES;
window.getDailyQuoteIndex = getDailyQuoteIndex;
window.getDailyTravelQuote = getDailyTravelQuote;
window.renderDailyTravelQuote = renderDailyTravelQuote;
window.cycleTravelQuote = cycleTravelQuote;
