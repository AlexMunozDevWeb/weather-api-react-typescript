# Componentes — SkyCast Weather Dashboard

## Árbol

```
App
├─ Header
├─ Form (modal overlay, focus trap)
├─ <main> (aria-live="polite")
│  ├─ Spinner
│  ├─ Alert
│  └─ Dashboard (bento grid)
│     ├─ Hero Card (inline)
│     ├─ Metrics Card (inline)
│     ├─ Hourly Forecast (inline)
│     ├─ Radar Canvas (inline, Canvas API)
│     └─ 5-Day Outlook (inline)
├─ BottomNav (inline, solo móvil)
└─ FAB Button (inline)
```

---

## ErrorBoundary

**Archivo:** `src/components/ErrorBoundary/ErrorBoundary.tsx`
**Tipo:** Class component (requerido por React para `getDerivedStateFromError`)

Captura errores de render y muestra UI de fallback con opciones "Recargar página" y "Intentar de nuevo". Envuelve toda la app en `main.tsx`.

---

## App.tsx

**Archivo:** `src/App.tsx`

Componente raíz. Orquesta layout general.

**Efectos:**
1. Sincroniza `document.body.className` con el tema activo.
2. Carga clima de Madrid (ciudad por defecto) al montar.

**Accesibilidad:**
- Skip-nav link (`<a href="#main-content">`).
- `aria-live="polite"` en `<main>` para anunciar cambios dinámicos.
- `role="alert"` en mensajes de error.
- `aria-label` en la navegación.

**Lógica de error:**
```typescript
const errorMessage = error || (notFound ? "Ciudad No Encontrada. Intente de nuevo." : null);
```
Separa el caso "ciudad no encontrada" de errores de red.

---

## Header

**Archivo:** `src/components/Header/Header.tsx`

Barra de navegación superior fija con glassmorphism (`backdrop-filter: blur`).

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `onSearchClick` | `() => void` | Abre modal de búsqueda |
| `activeTheme` | `"crimson" \| "elite"` | Tema activo |
| `onToggleTheme` | `() => void` | Alterna tema |

**Elementos:**
- Botón búsqueda (`Search` icon)
- Logo "SKYCAST"
- Links FORECAST/RADAR (ocultos en móvil)
- Toggle de tema con icono contextual (`Flame` / `Compass`)
- Botones simulados Notificaciones/Configuración

---

## Form

**Archivo:** `src/components/Form/Form.tsx`

Modal overlay para búsqueda de ciudad.

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `isOpen` | `boolean` | Visibilidad |
| `onClose` | `() => void` | Cierra modal |
| `fetchWeather` | `(search: SearchType) => Promise<void>` | Función del store |

**Estado local:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `search` | `SearchType` | `{ city, country }` |
| `alert` | `string` | Mensaje de validación |
| `isSubmitting` | `boolean` | Spinner de carga del botón |

**Accesibilidad (WCAG 2.1):**
- `role="dialog"` + `aria-modal="true"` + `aria-label`.
- **Focus trap:** Tab cicla entre primer/último elemento focusable.
- **Escape** cierra el modal.
- **Restaura foco** al elemento que abrió el modal.
- Bloquea scroll del body (`overflow: hidden`).
- Auto-focus al input de ciudad al abrir.

**Validación:**
- Campos obligatorios (validación JS + atributos HTML `required`).
- `maxLength={100}` en input de ciudad.
- Botón deshabilitado durante submitting.
- **No cierra el modal si falla la API** — muestra error y permite reintentar.

**Datos de países:** `src/data/countries.ts` (7 países predefinidos).

---

## Dashboard

**Archivo:** `src/components/Dashboard/Dashboard.tsx`

Panel principal con layout bento grid. 5 secciones renderizadas inline.

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `weather` | `ProcessedWeather` | Datos a renderizar |

### Secciones

#### 1. Hero Card
- Ciudad, país, descripción, temp actual, sensación térmica, ícono.
- Acento de color 4px con glow.
- Grid: `span 8` desktop / `span 12` móvil.

#### 2. Metrics Card
- Air Quality (pulsante coloreado por AQI), Humedad, Viento, Presión.
- Grid: `span 4` desktop / `span 12` móvil.

#### 3. Hourly Forecast
- Timeline horizontal scrolleable, 8 items (24h). Primer item: "NOW".
- Grid: `span 12`.

#### 4. Radar Canvas
- Simulación de radar con Canvas API y `requestAnimationFrame`.
- **Pausa automáticamente** cuando la pestaña está oculta (`visibilitychange`).
- Controles: zoom (0.5–2.5), velocidad (0.5x/1.5x/3.0x).
- Colores se adaptan al tema activo.
- Grid: `span 6` desktop / `span 12` móvil.

#### 5. 5-Day Outlook
- Lista vertical: día, ícono, temp_max, temp_min.
- Grid: `span 6` desktop / `span 12` móvil.

**Funciones auxiliares (fuera del componente):**
- `getWeatherIcon(iconCode, size)` — mapea códigos OpenWeatherMap a iconos Lucide.
- `getAqiClass(aqi, styles)` — retorna clase CSS según valor AQI.

---

## Spinner

**Archivo:** `src/components/Spinner/Spinner.tsx`

Indicador de carga con doble anillo animado. Texto: "Actualizando atmósfera...".

---

## Alert

**Archivo:** `src/components/Alert/Alert.tsx`

Mensaje de error con ícono `AlertCircle` y `role="alert"`.

**Props:** `children: ReactNode`.

---

## BottomNav (inline en App.tsx)

Navegación inferior fija, solo visible en `< 768px`.

- **Forecast** → `#forecast`
- **Radar** → `#radar`
- **Search** → abre modal

## FAB Button (inline en App.tsx)

Floating Action Button para geolocalización. Visible siempre.

---

## Estilos

### CSS Custom Properties (`src/index.css`)

| Variable | Crimson | Elite |
|----------|---------|-------|
| `--primary` | `#e11d48` | `#00a3ff` |
| `--bg-app` | `#121414` | `#101223` |
| `--surface` | `#171717` | `#181a2c` |
| `--on-surface` | `#e3e2e2` | `#e0e0fa` |
| `--rounded-card` | `0px` | `24px` |
| `--rounded-element` | `0px` | `12px` |

### Clases Tipográficas

| Clase | Fuente | Uso |
|-------|--------|-----|
| `.font-headline` | Hanken Grotesk 600 | Títulos |
| `.font-display` | Hanken Grotesk 700 | Display grande |
| `.font-label-caps` | JetBrains Mono 500 | Labels uppercase |
| `.font-code` | JetBrains Mono | Código |

### Breakpoints

| Rango | Comportamiento |
|-------|----------------|
| `< 768px` | Layout apilado, bottom nav visible, nav horizontal oculta |
| `≥ 768px` | Bento grid, bottom nav oculto, nav horizontal visible |
