# 🌍 Planificador de Viajes Web

Aplicación web interactiva completa para la planificación integral de viajes: itinerarios, rutas por carretera con cálculo dinámico en Google Maps / OpenStreetMap, alojamientos, comidas, visitas, presupuestos y control de pagos.

Incluye sincronización bidireccional en tiempo real multidispositivo en la nube (móvil, tablet y PC).

---

## 🚀 Despliegue en GitHub Pages

Esta carpeta contiene todos los archivos necesarios y optimizados para producción:

- `index.html`: Estructura principal de la aplicación y modales interactivos.
- `styles.css`: Hojas de estilo completas, diseño adaptable (responsive) y animaciones.
- `app.js`: Lógica funcional, cálculo de rutas, gestión de días, actividades con arrastrar y soltar (drag & drop) y frases célebres de viajes.
- `data.js`: Estructura de base de datos local y almacenamiento persistente en `localStorage`.
- `cloudSync.js`: Motor de sincronización en tiempo real multidispositivo mediante Firebase Realtime Database.
- `world_map_bg.svg`: Gráfico decorativo de fondo cartográfico del encabezado.

### Pasos para publicar en GitHub Pages:
1. Sube estos archivos a la rama principal (`main` o `master`) de tu repositorio de GitHub.
2. En GitHub, entra en **Settings** > **Pages**.
3. En **Branch**, selecciona `main` (o `master`) y carpeta `/(root)`. Haz clic en **Save**.
4. ¡Listo! Tu planificador estará disponible en `https://<tu-usuario>.github.io/<tu-repositorio>/`.
