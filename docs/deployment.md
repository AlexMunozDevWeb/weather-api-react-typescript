# Guía de Despliegue — SkyCast Weather Dashboard

## Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9
- API key de [OpenWeatherMap](https://home.openweathermap.org/api_keys)

## Variables de Entorno

Archivo: `.env` en la raíz del proyecto.

```env
VITE_API_KEY_WEATHER_APP=tu_api_key_aqui
```

**Importante:**
- El prefijo `VITE_` es **obligatorio** para que Vite exponga la variable al cliente.
- Sin el prefijo, `import.meta.env.API_KEY_WEATHER_APP` será `undefined`.
- El archivo `.env` está excluido de git via `.gitignore`.
- Ver `.env.example` para la plantilla.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Vite (hot reload) |
| `npm run build` | `tsc -b && vite build` (typecheck + build producción) |
| `npm run lint` | ESLint en todos los archivos `.ts` y `.tsx` |
| `npm run preview` | Sirve la build de producción localmente |

## Build de Producción

```bash
npm run build
```

1. `tsc -b` — verifica tipos TypeScript (falla si hay errores).
2. `vite build` — genera bundle optimizado en `dist/`.

**Output:**
```
dist/
├── index.html
└── assets/
    ├── index-[hash].js    # Bundle principal
    ├── index-[hash].css   # Estilos
    └── vendor-[hash].js   # Dependencias
```

## Security Headers

Configurados en `vite.config.ts` para dev y preview:

| Header | Valor |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (solo preview) |

## Despliegue en Netlify

1. Conectar repositorio GitHub a Netlify.
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Variable de entorno en el panel: `VITE_API_KEY_WEATHER_APP`

Desplegado en: https://weather-react-tscript.netlify.app/

## Despliegue en Vercel

1. Importar repositorio.
2. Framework: **Vite** (detectado automáticamente).
3. Build: `npm run build`, Output: `dist`.
4. Variable de entorno en Settings → Environment Variables.

## Despliegue Estático

```bash
npm run build
# Subir dist/ a cualquier hosting estático
```

## Accesibilidad (WCAG 2.1)

| Característica | Implementación |
|---------------|---------------|
| Skip navigation | `<a href="#main-content">` oculto, visible al focus |
| Focus trap en modal | Tab cicla, Escape cierra, foco restaurado |
| aria-live | `<main>` y Dashboard grid anuncian cambios |
| role="alert" | Mensajes de error |
| role="dialog" | Modal de búsqueda con aria-modal |
| lang="es" | `index.html` (<html lang="es">) |
| Labels | Todos los inputs tienen `<label>` asociado |

## Notas de Seguridad

- **Nunca** commitear `.env` con API keys reales.
- La API key está en el bundle de producción (SPA client-side).
- OpenWeatherMap no soporta restricción de dominio en plan gratuito.
- Se recomienda un proxy backend para proteger la key en producción.
- `localStorage` solo almacena el tema (`skycast-theme`), no datos sensibles.

## TypeScript

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

El build falla si `tsc` encuentra errores. Ejecutar `npx tsc -b --noEmit` para diagnóstico.

## ESLint

Flat config en `eslint.config.js`:
- `@eslint/js` recommended
- `typescript-eslint` recommended
- `react-hooks` rules
- `react-refresh/only-export-components` (warn)

```bash
npm run lint
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "Falta la variable de entorno VITE_API_KEY_WEATHER_APP" | Crear `.env` con `VITE_API_KEY_WEATHER_APP=tu_key` |
| Build falla tipos | `npx tsc -b --noEmit` para ver errores |
| API 401 Unauthorized | Verificar API key válida y activa |
| CSS no aplica | Verificar `@tailwindcss/vite` en `vite.config.ts` |
| Tema no persiste | Verificar `localStorage` key `skycast-theme` |
| Radar no pausa | Verificar soporte `visibilitychange` del navegador |
