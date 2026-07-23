# Arquitectura Técnica — SkyCast Weather Dashboard

## Visión General

SkyCast es una SPA (Single Page Application) construida con React 18 + TypeScript que consume la API de OpenWeatherMap para mostrar datos meteorológicos en tiempo real. Utiliza un store centralizado con Zustand, validación de respuestas con Zod y un sistema de temas dual (Crimson/Elite) basado en CSS Custom Properties.

## Diagrama de Componentes

```
index.html
  └─ main.tsx
       └─ ErrorBoundary
            └─ App.tsx
                 ├─ <a> SkipNav          (accesibilidad, oculto visualmente)
                 ├─ Header               (barra de navegación superior)
                 ├─ Form                 (modal de búsqueda con focus trap)
                 ├─ <main>               (aria-live="polite")
                 │    ├─ Spinner         (estado de carga)
                 │    ├─ Alert           (errores / ciudad no encontrada)
                 │    └─ Dashboard       (bento grid con 5 secciones)
                 │         ├─ Hero Card
                 │         ├─ Metrics Card
                 │         ├─ Hourly Forecast (24h)
                 │         ├─ Radar Canvas    (Canvas API + requestAnimationFrame)
                 │         └─ 5-Day Outlook
                 ├─ BottomNav            (móvil, solo < 768px)
                 └─ FAB Button           (geolocalización)
```

## Flujo de Datos

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────────┐
│  User Input  │────▶│  useWeatherStore   │────▶│  OpenWeatherMap  │
│  (Form / FAB)│     │  (Zustand)         │     │  API (REST)      │
└──────────────┘     └────────────────────┘     └──────────────────┘
                             │                         │
                     AbortController            3 requests en paralelo
                     cancela anteriores               │
                             │                         ▼
                             │               Zod safeParse()
                             │                         │
                             ▼                         ▼
                     ┌────────────────────┐
                     │  ProcessedWeather  │
                     └────────────────────┘
                             │
                             ▼
                     ┌────────────────────┐
                     │  Dashboard UI      │
                     │  (bento grid)      │
                     └────────────────────┘
```

### Búsqueda por ciudad

1. Usuario abre el modal `Form`.
2. Ingresa ciudad + país.
3. `Form` llama `fetchWeather(search)` del store.
4. Store cancela request anterior si existe (`AbortController`).
5. Geocoding (`/geo/1.0/direct`) → lat/lon.
6. 3 requests en paralelo con `Promise.all`:
   - `/data/2.5/weather` → clima actual
   - `/data/2.5/forecast` → pronóstico 5 días/3h
   - `/data/2.5/air_pollution` → calidad del aire
7. Cada respuesta se valida con Zod (`safeParse`).
8. Datos crudos se transforman en `ProcessedWeather`.
9. Store actualiza estado → Dashboard re-renderiza.

### Geolocalización

1. Usuario presiona FAB (`MapPin`).
2. `navigator.geolocation.getCurrentPosition()` solicita permiso.
3. **Solo después del permiso** se activa `loading: true`.
4. Con coordenadas, `fetchWeatherDetails(lat, lon)` ejecuta el mismo pipeline.

## Estructura de Directorios

```
weather-api-react-typescript/
├── public/
│   └── bg_clima.jpg
├── src/
│   ├── components/
│   │   ├── Alert/
│   │   │   ├── Alert.tsx
│   │   │   └── Alert.module.css
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.module.css
│   │   ├── ErrorBoundary/
│   │   │   └── ErrorBoundary.tsx
│   │   ├── Form/
│   │   │   ├── Form.tsx
│   │   │   └── Form.module.css
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── Header.module.css
│   │   └── Spinner/
│   │       ├── Spinner.tsx
│   │       └── Spinner.module.css
│   ├── data/
│   │   └── countries.ts
│   ├── store/
│   │   └── useWeatherStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.module.css
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── docs/
├── scripts/
├── .env                  (no commiteado — ver .gitignore)
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Sistema de Temas

Dos temas definidos como CSS Custom Properties en `src/index.css`:

| Tema | `--primary` | `--rounded-card` | `--rounded-element` |
|------|------------|-----------------|---------------------|
| **Crimson** (`:root`, `.theme-crimson`) | `#e11d48` | `0px` (sharp) | `0px` |
| **Elite** (`.theme-elite`) | `#00a3ff` | `24px` | `12px` |

- Se aplica via `document.body.className`.
- Se persiste en `localStorage` key `skycast-theme`.
- El toggle está en `Header`, gestionado por `useWeatherStore`.

## Seguridad

| Medida | Implementación |
|--------|---------------|
| API key validation | `getAppId()` lanza error claro si falta `VITE_API_KEY_WEATHER_APP` |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Strict-Transport-Security` en `vite.config.ts` |
| .gitignore | `.env` y `.env.*` excluidos (excepto `.env.example`) |
| AbortController | Cancela requests duplicados al buscar consecutivamente |
| Error Boundary | Captura errores de render, muestra UI de fallback |
| Focus trap | Modal Form atrapa foco con Tab y cierra con Escape |
| Skip-nav | Link oculto para usuarios de teclado |
| aria-live | Regiones dinámicas anuncian cambios a screen readers |
| Sin console.error | Eliminados de producción |

## TypeScript Configuration

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "target": "ES2020",
  "jsx": "react-jsx",
  "moduleResolution": "Bundler"
}
```

## Dependencias

| Paquete | Versión | Uso |
|---------|---------|-----|
| `react` / `react-dom` | 18.3.1 | UI library |
| `zustand` | 5.0.14 | State management |
| `axios` | 1.7.9 | HTTP client |
| `zod` | 3.24.2 | Schema validation |
| `tailwindcss` | 4.3.1 | Utility CSS |
| `@tailwindcss/vite` | 4.3.1 | Vite plugin |
| `lucide-react` | 1.21.0 | Iconografía |
| `vite` | 6.0.0 | Build tool |
| `typescript` | 5.6.2 | Type checking |
| `@vitejs/plugin-react-swc` | 3.5.0 | SWC compiler |

## Convenciones

- **UI en español** — todo texto visible en español.
- **PascalCase** para archivos de componentes, **camelCase** para utilities.
- **CSS Modules** para estilos de componentes, **Tailwind** solo para utilidades auxiliares tipográficas.
- **Sin path aliases** — todas las importaciones son relativas.
- **Zod schemas** con tipos inferidos (`z.infer`) — la fuente de verdad para tipos raw de API.
