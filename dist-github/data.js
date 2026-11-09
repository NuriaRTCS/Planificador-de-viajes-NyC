// Datos iniciales basados fielmente en el documento "2027. VIAJES. Propuesta de viaje.xlsx"
// Diseñado para soportar múltiples años y personalización completa

const INITIAL_TRIP_DATABASE = {
  activeYear: 2027,
  years: {
    2027: {
      id: 2027,
      name: "Año 2027 - Propuesta de Viajes",
      notes: "Propuestas de Semana Santa (País Vasco) y Verano (Opción Camping Bonterra vs Ruta Itinerante Viana - Potes - León).",
      trips: [
        {
          id: "ss27-pais-vasco",
          name: "País Vasco (SS27)",
          category: "Semana Santa",
          period: "Semana Santa 2027 (26/03/2027 - 03/04/2027)",
          startDate: "2027-03-26",
          endDate: "2027-04-03",
          status: "Propuesta Confirmada",
          badgeColor: "emerald",
          origin: "Castellón",
          destination: "Galdakao (Vizcaya)",
          route: "Castellón -> Teruel -> Zaragoza -> Logroño -> Galdakao",
          distanceKm: 580,
          estimatedTime: "5h 45min",
          accommodation: {
            name: "Apartamento en Galdakao",
            platform: "Airbnb (27/08/2026)",
            nights: 8,
            totalCost: 950.00,
            payments: [
              { label: "PAGADO (1)", date: "", amount: 0, status: "pendiente" },
              { label: "PAGADO (2)", date: "", amount: 0, status: "pendiente" },
              { label: "PAGADO (3)", date: "", amount: 0, status: "pendiente" }
            ],
            pendingCost: 950.00,
            dueDate: "2027-03-15",
            paymentMonth: "Marzo"
          },
          days: [
            { dayNum: 1, weekDay: "V", date: "2027-03-26", plan: "Salida desde Castellón, llegada e instalación en apartamento de Galdakao", lunch: "Tránsito (Bocadillos / pasta)", dinner: "Alojamiento (Cena rápida)" },
            { dayNum: 2, weekDay: "S", date: "2027-03-27", plan: "Visita a Bilbao (Casco Viejo, Guggenheim y ría)", lunch: "Alojamiento", dinner: "Alojamiento" },
            { dayNum: 3, weekDay: "D", date: "2027-03-28", plan: "Excursión Costa de Vizcaya: San Juan de Gaztelugatxe y Bermeo", lunch: "Tránsito", dinner: "Alojamiento" },
            { dayNum: 4, weekDay: "L", date: "2027-03-29", plan: "Excursión a San Sebastián (Playa de la Concha, Monte Igueldo)", lunch: "Tránsito", dinner: "Alojamiento" },
            { dayNum: 5, weekDay: "M", date: "2027-03-30", plan: "Visita a Guernica y Reserva de Urdaibai", lunch: "Tránsito", dinner: "Alojamiento" },
            { dayNum: 6, weekDay: "X", date: "2027-03-31", plan: "Excursión a Vitoria-Gasteiz y Valle Salado de Añana", lunch: "Tránsito", dinner: "Alojamiento" },
            { dayNum: 7, weekDay: "J", date: "2027-04-01", plan: "Paseo por Getxo, Puente Colgante y costa cantábrica", lunch: "Tránsito", dinner: "Alojamiento" },
            { dayNum: 8, weekDay: "V", date: "2027-04-02", plan: "Día tranquilo de relax, compras y últimos paseos", lunch: "Tránsito", dinner: "Alojamiento" },
            { dayNum: 9, weekDay: "S", date: "2027-04-03", plan: "Salida y vuelta a casa hacia Castellón", lunch: "Tránsito (En ruta)", dinner: "Casa" }
          ],
          tickets: [
            { id: "t1", name: "Museo Guggenheim Bilbao", purchaseDate: "2027-02-15", visitDate: "2027-03-27", cost: 52.00, status: "Pendiente", link: "https://www.guggenheim-bilbao.eus" },
            { id: "t2", name: "Funicular de Artxanda", purchaseDate: "", visitDate: "2027-03-27", cost: 14.00, status: "Pendiente", link: "" },
            { id: "t3", name: "Ticket San Juan de Gaztelugatxe (Reserva)", purchaseDate: "2027-02-01", visitDate: "2027-03-28", cost: 0.00, status: "Pendiente", link: "" }
          ],
          expenses: [
            { id: "e1", concept: "Gasolina ida y desplazamientos SS", category: "Gasolina", amount: 160.00, date: "2027-03-26" },
            { id: "e2", concept: "Peajes AP-68 / autopistas", category: "Peajes", amount: 45.00, date: "2027-03-26" },
            { id: "e3", concept: "Compra inicial supermercado", category: "Compras", amount: 120.00, date: "2027-03-26" },
            { id: "e4", concept: "Comida pintxos casco viejo", category: "Restaurantes", amount: 75.00, date: "2027-03-27" }
          ],
          advances: []
        },
        {
          id: "verano27-bonterra",
          name: "Opción A: BONTERRA (Verano27)",
          category: "Verano (Camping)",
          period: "Verano 2027 (Estancia larga de 27 noches)",
          startDate: "2027-07-03",
          endDate: "2027-07-30",
          status: "Opción Alternativa",
          badgeColor: "amber",
          origin: "Castellón",
          destination: "Benicàssim (Castellón)",
          route: "Castellón -> Benicàssim (N-340 / CV-149)",
          distanceKm: 15,
          estimatedTime: "20 min",
          accommodation: {
            name: "Camping Bonterra Resort",
            platform: "Presencial - Mail 29/08/2026",
            nights: 27,
            totalCost: 2209.30,
            payments: [
              { label: "PAGADO (1)", date: "01/09/2026", method: "TPV virtual", amount: 552.32, status: "pagado" },
              { label: "PAGADO (2)", date: "", method: "", amount: 0, status: "pendiente" },
              { label: "PAGADO (3)", date: "", method: "", amount: 0, status: "pendiente" }
            ],
            pendingCost: 1656.98,
            dueDate: "2027-07-01",
            paymentMonth: "Julio"
          },
          days: [
            { dayNum: 1, weekDay: "S", date: "2027-07-03", plan: "Llegada, montaje e instalación en parcela", lunch: "Tránsito", dinner: "Càmping (Barbacoa bienvenida)" },
            { dayNum: 2, weekDay: "D", date: "2027-07-04", plan: "Playa de Benicàssim y piscina", lunch: "Càmping", dinner: "Càmping" },
            { dayNum: 3, weekDay: "L", date: "2027-07-05", plan: "Día en camping / Vía Verde", lunch: "Tránsito / Ensalada", dinner: "Càmping" },
            { dayNum: 4, weekDay: "M", date: "2027-07-06", plan: "Relax y actividades del camping", lunch: "Càmping", dinner: "Càmping" }
          ],
          tickets: [
            { id: "tb1", name: "Aquarama Benicàssim (Pack Familiar)", purchaseDate: "", visitDate: "2027-07-15", cost: 110.00, status: "Pendiente", link: "https://www.aquarama.net" }
          ],
          expenses: [
            { id: "eb1", concept: "Anticipo reserva Camping Bonterra", category: "Efectivo", amount: 552.32, date: "2026-09-01" },
            { id: "eb2", concept: "Supermercado compras camping", category: "Compras", amount: 200.00, date: "2027-07-03" }
          ],
          advances: [
            {
              id: "adv_bonterra_1",
              concept: "Señal y reserva Camping Bonterra (Primer pago)",
              date: "2026-09-01",
              method: "TPV virtual",
              amount: 552.32,
              notes: "Presencial/Mail 29/08/2026 - TPV virtual 01/09/2026"
            }
          ]
        },
        {
          id: "verano27-ruta-norte",
          name: "Opción B: Ruta Norte Itinerante (Viana - Potes - León)",
          category: "Verano (Ruta por Etapas)",
          period: "Verano 2027 (12/08/2027 - 29/08/2027)",
          startDate: "2027-08-12",
          endDate: "2027-08-29",
          status: "Opción Principal",
          badgeColor: "indigo",
          origin: "Castellón",
          destination: "Navarra / Cantabria / León",
          route: "Castellón -> Viana -> Potes -> León -> Castellón",
          distanceKm: 1850,
          estimatedTime: "Ruta en 3 etapas",
          stages: [
            {
              id: "st-viana",
              name: "Etapa 1: Viana (Navarra / La Rioja)",
              origin: "Castellón",
              destination: "Viana",
              accommodationName: "Alojamiento en Viana",
              platform: "Airbnb (28/10/2026)",
              nights: 3,
              cost: 351.00,
              paid: 0.00,
              pending: 351.00,
              dueDate: "2027-07-31",
              paymentMonth: "Julio",
              paymentComment: "Vencimiento Airbnb: 31/07",
              startDate: "2027-08-12",
              endDate: "2027-08-15",
              days: [
                { dayNum: 1, weekDay: "J", date: "2027-08-12", plan: "Salida desde Castellón, llegada e instalación en Viana", lunch: "Tránsito", dinner: "Alojamiento" },
                { dayNum: 2, weekDay: "V", date: "2027-08-13", plan: "Visita al casco histórico de Viana y Logroño (Calle Laurel)", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 3, weekDay: "S", date: "2027-08-14", plan: "Ruta por bodegas y pueblos de La Rioja Alavesa (Laguardia)", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 4, weekDay: "D", date: "2027-08-15", plan: "Salida de Viana en ruta hacia Potes", lunch: "Tránsito", dinner: "Alojamiento (Potes)" }
              ]
            },
            {
              id: "st-potes",
              name: "Etapa 2: Potes (Cantabria / Picos de Europa)",
              origin: "Viana",
              destination: "Potes",
              accommodationName: "Alojamiento en Potes",
              platform: "Por definir (Modo reserva)",
              nights: 7,
              cost: 0.00,
              paid: 0.00,
              pending: 0.00,
              dueDate: "2027-08-01",
              paymentMonth: "Agosto",
              startDate: "2027-08-15",
              endDate: "2027-08-22",
              days: [
                { dayNum: 1, weekDay: "D", date: "2027-08-15", plan: "Llegada a Potes, paso por el Desfiladero de La Hermida e instalación", lunch: "Tránsito", dinner: "Alojamiento" },
                { dayNum: 2, weekDay: "L", date: "2027-08-16", plan: "Visita al centro de Potes y Monasterio de Santo Toribio de Liébana", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 3, weekDay: "M", date: "2027-08-17", plan: "Teleférico de Fuente Dé y ruta por Áliva", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 4, weekDay: "X", date: "2027-08-18", plan: "Excursión a Mogrovejo y valles lebaniegos", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 5, weekDay: "J", date: "2027-08-19", plan: "Ruta de senderismo en Picos de Europa", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 6, weekDay: "V", date: "2027-08-20", plan: "Paseo, compras gastronómicas (orujo, queso de Liébana)", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 7, weekDay: "S", date: "2027-08-21", plan: "Día de relax en el valle", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 8, weekDay: "D", date: "2027-08-22", plan: "Salida hacia León por el Puerto de San Glorio", lunch: "Tránsito", dinner: "Càmping / Alojamiento" }
              ]
            },
            {
              id: "st-leon",
              name: "Etapa 3: León",
              origin: "Potes",
              destination: "León",
              accommodationName: "Alojamiento en León",
              platform: "Booking (Reserva online)",
              nights: 7,
              cost: 841.22,
              paid: 0.00,
              pending: 841.22,
              dueDate: "2027-08-13",
              paymentMonth: "Agosto",
              paymentComment: "Vencimiento Booking: 13/08",
              startDate: "2027-08-22",
              endDate: "2027-08-29",
              days: [
                { dayNum: 1, weekDay: "D", date: "2027-08-22", plan: "Llegada desde Potes a León e instalación", lunch: "Tránsito", dinner: "Càmping / Alojamiento" },
                { dayNum: 2, weekDay: "L", date: "2027-08-23", plan: "Catedral de León, Casa Botines y Barrio Húmedo", lunch: "Càmping / Ciudad", dinner: "Càmping / Alojamiento" },
                { dayNum: 3, weekDay: "M", date: "2027-08-24", plan: "San Isidoro y Panteón Real", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 4, weekDay: "X", date: "2027-08-25", plan: "Excursión a Las Médulas y Ponferrada (Castillo Templario)", lunch: "Tránsito", dinner: "Alojamiento" },
                { dayNum: 5, weekDay: "J", date: "2027-08-26", plan: "Visita a Astorga (Palacio Gaudí, Catedral y cocido maragato)", lunch: "Restaurante", dinner: "Alojamiento" },
                { dayNum: 6, weekDay: "V", date: "2027-08-27", plan: "Cueva de Valporquero", lunch: "Tránsito", dinner: "Alojamiento" },
                { dayNum: 7, weekDay: "S", date: "2027-08-28", plan: "Día tranquilo por el paseo del Bernesga y compras", lunch: "Alojamiento", dinner: "Alojamiento" },
                { dayNum: 8, weekDay: "D", date: "2027-08-29", plan: "Salida y vuelta final a casa (León -> Castellón)", lunch: "Tránsito", dinner: "Casa" }
              ]
            }
          ],
          tickets: [
            { id: "tn1", name: "Teleférico Fuente Dé (Cantabria)", purchaseDate: "2027-07-20", visitDate: "2027-08-17", cost: 48.00, status: "Pendiente", link: "https://cantur.com/instalaciones/teleferico-de-fuente-de/" },
            { id: "tn2", name: "Catedral de León y Claustro", purchaseDate: "", visitDate: "2027-08-23", cost: 24.00, status: "Pendiente", link: "" },
            { id: "tn3", name: "Cueva de Valporquero (Entrada completa)", purchaseDate: "", visitDate: "2027-08-27", cost: 38.00, status: "Pendiente", link: "https://www.cuevadevalporquero.es" }
          ],
          expenses: [
            { id: "en1", concept: "Combustible ruta completa (estimado)", category: "Gasolina", amount: 280.00, date: "2027-08-12" },
            { id: "en2", concept: "Peajes autopistas del norte", category: "Peajes", amount: 65.00, date: "2027-08-12" },
            { id: "en3", concept: "Provisiones compras supermercados", category: "Compras", amount: 250.00, date: "2027-08-13" },
            { id: "en4", concept: "Cocido Maragato en Astorga", category: "Restaurantes", amount: 95.00, date: "2027-08-26" }
          ],
          advances: []
        }
      ],
      // Presupuesto global 2027 del Excel
      budgetSettings: {
        totalTripKm: 2430,
        fuelConsumptionL100: 7.2,
        fuelPricePerLiter: 1.65,
        targetAccommodations: [
          { name: "Bilbao (SS27)", month: "Marzo", amount: 950.00, status: "pendiente", dueDate: "2027-03-15" },
          { name: "Bonterra (Camping)", month: "Julio", amount: 1656.98, status: "pendiente", dueDate: "2027-07-01" },
          { name: "Viana (Airbnb)", month: "Julio", amount: 351.00, status: "pendiente", dueDate: "2027-07-31", note: "Airbnb 31/07" },
          { name: "Potes (Cantabria)", month: "Agosto", amount: 0.00, status: "pendiente", dueDate: "2027-08-01" },
          { name: "León (Booking)", month: "Agosto", amount: 841.22, status: "pendiente", dueDate: "2027-08-13", note: "Booking 13/08" }
        ],
        categories: {
          alojamiento: { budget: 4351.52, paid: 552.32, pending: 3799.20, totalNights: 45 },
          gasolinaPeajes: { budget: 450.00, paid: 0, pending: 450.00 },
          entradas: { budget: 280.00, paid: 0, pending: 280.00 },
          comidaSuper: { budget: 800.00, paid: 0, pending: 800.00 },
          otros: { budget: 250.00, paid: 0, pending: 250.00 },
          efectivo: { budget: 200.00, paid: 0, pending: 200.00 }
        }
      }
    }
  },

  // Menús históricos de viajes anteriores para inspiración (conservados de la hoja Comida)
  historicalMenus: {
    asturias: {
      name: "ASTURIAS. ESTIU 2024",
      days: [
        { dayNum: 1, weekDay: "J", date: "2024-08-01", plan: "Salida y viaje de ida", lunch: "TRÁNSITO: Tortellini con tomate y queso", dinner: "Fajitas de pollo" },
        { dayNum: 2, weekDay: "V", date: "2024-08-02", plan: "Visita al Monasterio de Piedra", lunch: "Monasterio de Piedra", dinner: "Tortilla de patatas" },
        { dayNum: 3, weekDay: "S", date: "2024-08-03", plan: "Día de barbacoa con la familia", lunch: "Barbacoa", dinner: "Sobras" },
        { dayNum: 4, weekDay: "D", date: "2024-08-04", plan: "Trayecto hacia el norte", lunch: "TRÁNSITO: Pasta con tomate", dinner: "San Jacobo + salchichas" },
        { dayNum: 5, weekDay: "L", date: "2024-08-05", plan: "Visita a Frías y cascada de Tobera", lunch: "Frías", dinner: "Pescado" },
        { dayNum: 6, weekDay: "M", date: "2024-08-06", plan: "Excursión de montaña", lunch: "Sopa + longanizas", dinner: "Pizza" },
        { dayNum: 7, weekDay: "X", date: "2024-08-07", plan: "Paso por Espinosa de los Monteros", lunch: "Espinosa de los Monteros", dinner: "Pescado" },
        { dayNum: 8, weekDay: "J", date: "2024-08-08", plan: "Día tranquilo de relax", lunch: "Ensalada de arroz", dinner: "Sobras" },
        { dayNum: 9, weekDay: "V", date: "2024-08-09", plan: "Tránsito hacia la costa asturiana", lunch: "TRÁNSITO: Espaguetis a la carbonara", dinner: "Fajitas de pollo" },
        { dayNum: 10, weekDay: "S", date: "2024-08-10", plan: "Llegada y paseo", lunch: "Sopa + hamburguesas crunchy", dinner: "Hamburguesas" },
        { dayNum: 11, weekDay: "D", date: "2024-08-11", plan: "Día en Gijón: Cimavilla, puerto y playa", lunch: "Gijón", dinner: "Pescado" },
        { dayNum: 12, weekDay: "L", date: "2024-08-12", plan: "Excursión a Ciañu y valles mineros", lunch: "Ciañu", dinner: "Quiche" },
        { dayNum: 13, weekDay: "M", date: "2024-08-13", plan: "Paseo por Llanes y sus playas", lunch: "Llanes", dinner: "Perritos calientes" },
        { dayNum: 14, weekDay: "X", date: "2024-08-14", plan: "Visita cultural a Oviedo", lunch: "Oviedo", dinner: "Quiche + embutidos" },
        { dayNum: 15, weekDay: "J", date: "2024-08-15", plan: "Fiesta y comida casera", lunch: "Canelones", dinner: "Hamburguesa" },
        { dayNum: 16, weekDay: "V", date: "2024-08-16", plan: "Visita al centro histórico de Avilés", lunch: "Avilés", dinner: "Empanada Mercadona" },
        { dayNum: 17, weekDay: "S", date: "2024-08-17", plan: "Desplazamiento por la zona interior", lunch: "TRÁNSITO: Ensalada de arroz", dinner: "Carne a la barbacoa" },
        { dayNum: 18, weekDay: "D", date: "2024-08-18", plan: "Ruta de los lagos", lunch: "Sopa + Tortilla de patatas", dinner: "Sobras" },
        { dayNum: 19, weekDay: "L", date: "2024-08-19", plan: "Pícnic en la naturaleza", lunch: "Bocadillos tortilla / embutidos", dinner: "Pescado" },
        { dayNum: 20, weekDay: "M", date: "2024-08-20", plan: "Comida típica asturiana", lunch: "Arroz a la cubana", dinner: "Cachopo" },
        { dayNum: 21, weekDay: "X", date: "2024-08-21", plan: "Día de descanso", lunch: "Torré / yatecomo", dinner: "Sopa + embutido" },
        { dayNum: 22, weekDay: "J", date: "2024-08-22", plan: "Rumbo sur de vuelta", lunch: "TRÁNSITO: Tortellini", dinner: "Pavo al ajillo + embutido" },
        { dayNum: 23, weekDay: "V", date: "2024-08-23", plan: "Parada en Berlanga de Duero", lunch: "Berlanga", dinner: "Hamburguesas" },
        { dayNum: 24, weekDay: "S", date: "2024-08-24", plan: "Última noche del viaje", lunch: "Garbanzos + pavo guisado", dinner: "Sobras" },
        { dayNum: 25, weekDay: "D", date: "2024-08-25", plan: "Vuelta final a Castellón", lunch: "TRÁNSITO: Pasta con tomate", dinner: "Casa" }
      ]
    },
    girona: {
      name: "GIRONA. PASQUA 2024",
      days: [
        { dayNum: 1, weekDay: "J", date: "2024-03-28", plan: "Viaje de ida hacia Girona", lunch: "TRÁNSITO: Tortellini con tomate y queso", dinner: "Salmón barbacoa" },
        { dayNum: 2, weekDay: "V", date: "2024-03-29", plan: "Castelló d'Empúries y Aiguamolls", lunch: "Restaurante Castelló d'Empúries", dinner: "Ensalada + hamburguesas" },
        { dayNum: 3, weekDay: "S", date: "2024-03-30", plan: "Paseo por Girona capital", lunch: "Espaguetis a la carbonara", dinner: "Tortilla" },
        { dayNum: 4, weekDay: "D", date: "2024-03-31", plan: "Frontera y La Jonquera", lunch: "Restaurante La Jonquera", dinner: "Pescado rebozado" },
        { dayNum: 5, weekDay: "L", date: "2024-04-01", plan: "Excursión a Besalú", lunch: "Garbanzos con costilla", dinner: "Paninis" },
        { dayNum: 6, weekDay: "M", date: "2024-04-02", plan: "Pueblos medievales del Empordà", lunch: "Canelones", dinner: "Cintas de lomo" },
        { dayNum: 7, weekDay: "X", date: "2024-04-03", plan: "Cadaqués y Cap de Creus", lunch: "Restaurante Cadaqués", dinner: "Paninis" },
        { dayNum: 8, weekDay: "J", date: "2024-04-04", plan: "Día de barbacoa y fideus", lunch: "Carne a la barbacoa / X: fideus", dinner: "Sopa + ensalada + picoteo" },
        { dayNum: 9, weekDay: "V", date: "2024-04-05", plan: "Vuelta a casa", lunch: "TRÁNSITO: Bocadillos de tortilla", dinner: "Casa" }
      ]
    },
    disney: {
      name: "DISNEY. ESTIU 2023",
      days: [
        { dayNum: 1, weekDay: "M", date: "2023-08-01", plan: "Salida hacia Francia", lunch: "TRÁNSITO: Bocadillos tortilla de patata", dinner: "Salmón barbacoa" },
        { dayNum: 2, weekDay: "X", date: "2023-08-02", plan: "Segunda etapa de viaje", lunch: "Carne barbacoa", dinner: "Tortilla" },
        { dayNum: 3, weekDay: "J", date: "2023-08-03", plan: "Llegada al alojamiento en Meaux", lunch: "TRÁNSITO: Pasta con tomate", dinner: "Sopa + Hamburguesas" },
        { dayNum: 4, weekDay: "V", date: "2023-08-04", plan: "Descanso y compras", lunch: "Lentejas con arroz", dinner: "Pescado" },
        { dayNum: 5, weekDay: "S", date: "2023-08-05", plan: "Barbacoa en el jardín", lunch: "N: sobras / A: barbacoa", dinner: "San jacobos" },
        { dayNum: 6, weekDay: "D", date: "2023-08-06", plan: "Ruta preparatoria", lunch: "TRÁNSITO: Bocadillos tortilla", dinner: "Pizza" },
        { dayNum: 7, weekDay: "L", date: "2023-08-07", plan: "Excursión alrededores", lunch: "Espaguetis a la carbonara", dinner: "Pescado" },
        { dayNum: 8, weekDay: "M", date: "2023-08-08", plan: "Día en parque Disney 1", lunch: "TRÁNSITO: Bocadillos salchichas", dinner: "Hamburguesa" },
        { dayNum: 9, weekDay: "X", date: "2023-08-09", plan: "Día en Disneyland Park", lunch: "DISNEY: Bocadillos", dinner: "Restaurante" },
        { dayNum: 10, weekDay: "J", date: "2023-08-10", plan: "Día en Walt Disney Studios", lunch: "Comida Disney", dinner: "Cena temática" },
        { dayNum: 11, weekDay: "V", date: "2023-08-11", plan: "Día en París: Torre Eiffel y Sena", lunch: "Restaurante París", dinner: "San jacobos" },
        { dayNum: 12, weekDay: "S", date: "2023-08-12", plan: "Visita a Meaux", lunch: "Arroz a la cubana", dinner: "Pizza" },
        { dayNum: 13, weekDay: "D", date: "2023-08-13", plan: "Cena especial Meaux", lunch: "Restaurante Meaux", dinner: "Pescado" },
        { dayNum: 14, weekDay: "L", date: "2023-08-14", plan: "Comienzo del viaje de regreso", lunch: "TRÁNSITO: Bocadillos carne", dinner: "San jacobos" },
        { dayNum: 15, weekDay: "M", date: "2023-08-15", plan: "En ruta por Francia", lunch: "Garbanzos guisados", dinner: "Pescado" },
        { dayNum: 16, weekDay: "X", date: "2023-08-16", plan: "Vuelta final a casa", lunch: "TRÁNSITO: Bocadillos tortilla", dinner: "Casa" }
      ]
    }
  },

  // Banco de Recursos de Comidas de Viaje (Comidas no-restaurante: en ruta, picnic, alojamiento y barbacoa)
  mealCatalog: [
    { id: "meal_1", name: "Tortellini con tomate y queso", type: "Tránsito", note: "Ideal para preparar en hornillo o termo en área de descanso", tags: ["Hornillo", "Rápido"] },
    { id: "meal_2", name: "Bocadillos de tortilla de patatas", type: "Tránsito", note: "Clásico infalible para el primer día de viaje en carretera", tags: ["Sin cocinar", "Rápido"] },
    { id: "meal_3", name: "Bocadillos de lomo con queso y pimientos", type: "Tránsito", note: "Sabroso y contundente para parada en ruta", tags: ["Sin cocinar"] },
    { id: "meal_4", name: "Bocadillos de pechuga empanada", type: "Tránsito", note: "Aguanta perfecto todo el día de viaje", tags: ["Sin cocinar"] },
    { id: "meal_5", name: "Ensalada de arroz con atún, maíz y aceitunas", type: "Picnic", note: "Se lleva en táper frío en la neverita para excursiones", tags: ["Táper frío"] },
    { id: "meal_6", name: "Ensalada de pasta fría con pavo y huevo duro", type: "Picnic", note: "Muy refrescante para días de calor en la playa o parque", tags: ["Táper frío"] },
    { id: "meal_7", name: "Empanada gallega o de atún", type: "Picnic", note: "Comida perfecta para comer de pie en miradores o parques", tags: ["Sin cocinar"] },
    { id: "meal_8", name: "Espaguetis a la carbonara rápidos", type: "Alojamiento", note: "Rápido y del agrado de toda la familia tras llegar cansados", tags: ["Rápido"] },
    { id: "meal_9", name: "Macarrones con tomate, atún y queso gratinado", type: "Alojamiento", note: "Fácil de preparar con pocos utensilios en apartamento", tags: ["Rápido"] },
    { id: "meal_10", name: "Fajitas de pollo con verduras", type: "Alojamiento", note: "Cena participativa y divertida para cocinar todos juntos", tags: ["Cocina fácil"] },
    { id: "meal_11", name: "Paninis caseros al horno", type: "Alojamiento", note: "Baguette cortada con tomate frito, jamón, queso y orégano", tags: ["Rápido"] },
    { id: "meal_12", name: "Pescado fresco al horno o a la plancha", type: "Alojamiento", note: "Saludable, ligero y limpio en el apartamento", tags: ["Saludable"] },
    { id: "meal_13", name: "Canelones preparados frescos", type: "Alojamiento", note: "Se compran en supermercado local y solo se gratinan", tags: ["Rápido"] },
    { id: "meal_14", name: "Arroz a la cubana con huevo y plátano", type: "Alojamiento", note: "Siempre triunfa con niños, rápido en 15 minutos", tags: ["Infantil", "Rápido"] },
    { id: "meal_15", name: "Sopa caliente de fideos + Hamburguesas", type: "Alojamiento", note: "Perfecto para noches frescas en el norte o tras lluvia", tags: ["Reconfortante"] },
    { id: "meal_16", name: "San Jacobos con patatas o ensalada", type: "Alojamiento", note: "Rápido de freír tras volver de excursión a última hora", tags: ["Rápido", "Infantil"] },
    { id: "meal_17", name: "Quiche de jamón y queso con embutidos", type: "Alojamiento", note: "Se compra fresca o se hornea rápido", tags: ["Rápido"] },
    { id: "meal_18", name: "Perritos calientes con cebolla frita y salsas", type: "Alojamiento", note: "Cena rápida y desenfadada", tags: ["Infantil", "Rápido"] },
    { id: "meal_19", name: "Tabla de embutidos, quesos locales y pan con tomate", type: "Alojamiento", note: "Sin cocinar, solo disfrutar productos locales de la zona", tags: ["Sin cocinar"] },
    { id: "meal_20", name: "Barbacoa de carne (secreto, longanizas y panceta)", type: "Barbacoa", note: "El clásico de cámping al aire libre", tags: ["Parrilla"] },
    { id: "meal_21", name: "Hamburguesas a la brasa con queso y bacon", type: "Barbacoa", note: "A la parrilla en parcela de cámping", tags: ["Parrilla", "Infantil"] },
    { id: "meal_22", name: "Mazorcas de maíz a la brasa con mantequilla", type: "Barbacoa", note: "Acompañamiento estrella a la brasa", tags: ["Parrilla"] },
    { id: "meal_23", name: "Verduras variadas a la brasa (calabacín, pimientos)", type: "Barbacoa", note: "Saludable y delicioso en cámping", tags: ["Parrilla", "Saludable"] }
  ],

  // Etiquetas iniciales dinámicas (las categorías fijas son Tránsito, Alojamiento, Bar/Restaurante, Picnic, Barbacoa, Otro)
  mealTags: ["Rápido", "Sin cocinar", "Táper frío", "Hornillo", "Infantil", "Parrilla", "Saludable", "Cocina fácil", "Reconfortante"]
};

// Funciones de persistencia con localStorage
const STORAGE_KEY = "PLANIFICADOR_VIAJES_DB_V1";
const STANDARD_MEAL_CATEGORIES = ["Tránsito", "Alojamiento", "Bar/Restaurante", "Picnic", "Barbacoa", "Otro"];
const STANDARD_MEAL_TAGS = STANDARD_MEAL_CATEGORIES; // Compatibilidad

function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validar estructura básica
      if (parsed && parsed.years && parsed.years[2027]) {
        // Eliminar años 2024 y 2023 si estaban guardados previamente
        if (parsed.years[2024]) delete parsed.years[2024];
        if (parsed.years[2023]) delete parsed.years[2023];
        if (parsed.activeYear === 2024 || parsed.activeYear === 2023) parsed.activeYear = 2027;
        if (!parsed.historicalMenus) parsed.historicalMenus = INITIAL_TRIP_DATABASE.historicalMenus;

        // Gestión de etiquetas dinámicas (db.mealTags)
        if (!Array.isArray(parsed.mealTags) || parsed.mealTags.length === 0 || (parsed.mealTags.length === 6 && parsed.mealTags.includes("Tránsito") && parsed.mealTags.includes("Alojamiento"))) {
          parsed.mealTags = [...INITIAL_TRIP_DATABASE.mealTags];
        }

        if (!parsed.mealCatalog || parsed.mealCatalog.length < 15) {
          parsed.mealCatalog = INITIAL_TRIP_DATABASE.mealCatalog;
        } else {
          parsed.mealCatalog.forEach(m => {
            if (!m.id) {
              const def = INITIAL_TRIP_DATABASE.mealCatalog.find(x => x.name.toLowerCase() === m.name.toLowerCase());
              m.id = def && def.id ? def.id : ('meal_' + Math.random().toString(36).substr(2, 9));
            }
            if (!Array.isArray(m.tags) || m.tags.length === 0) {
              const def = INITIAL_TRIP_DATABASE.mealCatalog.find(x => x.name.toLowerCase() === m.name.toLowerCase());
              m.tags = def && def.tags ? [...def.tags] : [];
            }
          });
        }
        // Asegurar advances y fechas por defecto
        Object.keys(parsed.years).forEach(y => {
          if (parsed.years[y]?.trips) {
            parsed.years[y].trips.forEach(t => {
              if (!Array.isArray(t.advances)) t.advances = [];
              if (t.id === 'ss27-pais-vasco') {
                if (!t.startDate) t.startDate = "2027-03-26";
                if (!t.endDate) t.endDate = "2027-04-03";
              } else if (t.id === 'verano27-bonterra') {
                if (!t.startDate) t.startDate = "2027-07-03";
                if (!t.endDate) t.endDate = "2027-07-30";
                if (t.advances.length === 0) {
                  t.advances.push({
                    id: "adv_bonterra_1",
                    concept: "Señal y reserva Camping Bonterra (Primer pago)",
                    date: "2026-09-01",
                    method: "TPV virtual",
                    amount: 552.32,
                    notes: "Presencial/Mail 29/08/2026 - TPV virtual 01/09/2026"
                  });
                }
              } else if (t.id === 'verano27-ruta-norte') {
                if (!t.startDate) t.startDate = "2027-08-12";
                if (!t.endDate) t.endDate = "2027-08-29";
              }
            });
          }
        });
        saveDatabase(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.warn("No se pudo cargar localStorage, usando base inicial:", e);
  }
  return JSON.parse(JSON.stringify(INITIAL_TRIP_DATABASE));
}

function saveDatabase(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error al guardar en localStorage:", e);
  }
  if (typeof onDatabaseSavedHook === "function") {
    onDatabaseSavedHook(data);
  }
}

function resetToDefaultDatabase() {
  const fresh = JSON.parse(JSON.stringify(INITIAL_TRIP_DATABASE));
  saveDatabase(fresh);
  return fresh;
}
