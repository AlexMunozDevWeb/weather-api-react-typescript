# SkyCast Weather Dashboard — Agent Guide

## Commands

| Command           | What it does                                         |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Vite dev server                                      |
| `npm run build`   | `tsc -b && vite build` (typecheck first, then build) |
| `npm run lint`    | ESLint flat config on all `*.ts,*.tsx`               |
| `npm run preview` | Vite preview of built output                         |

No test framework is configured (no test deps in package.json).

## Stack

- **Build**: Vite 6 + SWC (`@vitejs/plugin-react-swc`)
- **Language**: TypeScript 5.6, strict mode, noUnusedLocals, noUnusedParameters
- **State**: Zustand (`src/store/useWeatherStore.ts`)
- **HTTP**: axios
- **Validation**: Zod (schemas co-located in store file)
- **CSS**: Tailwind v4 (via `@tailwindcss/vite` plugin) + CSS Modules (`.module.css`)

## Architecture

- **Entrypoint**: `index.html` → `src/main.tsx` → `App.tsx`
- **Component pattern**: `src/components/ComponentName/ComponentName.tsx` + co-located `ComponentName.module.css`
- **Types**: All in `src/types/index.ts` (`ProcessedWeather`, `SearchType`, raw API types)
- **Utils**: `src/utils/index.ts` — `formatTemperature` (K→°C), `formatTime`, `getDayName`, `getAqiLabel`
- **Store pattern**: Zustand store holds ALL state (weather, loading, error, theme, search UI) and API-fetching actions
- **`src/modules/`** is empty (unused directory)
- **No path aliases** configured in tsconfig

## Environment

- OpenWeatherMap (3 parallel calls: current weather, 5-day/3hr forecast, air pollution)
- Geocoding via `/geo/1.0/direct` → lat/lon → then fetch weather details
- `src/data/countries.ts` has a limited set of countries with Spanish names
- Default city on load: `{ city: "Madrid", country: "ES" }`

## CSS Conventions

- Global styles in `src/index.css` (reset, theme vars, typography utility classes: `.font-headline`, `.font-display`, `.font-label-caps`, `.font-code`)
- Component-specific styles in CSS Modules
- Two themes via CSS custom properties on `:root/.theme-crimson` and `.theme-elite`
- Theme set via `document.body.className = 'theme-crimson' | 'theme-elite'`
- Theme persisted in localStorage key `skycast-theme`

## Notable Conventions

- **Mixed exports**: Some components use `export default`, others `export const` + `export default` (e.g., `Header.tsx` does both). Prefer what each file already uses.
- **UI language**: Spanish (labels, errors, form text)
- **Icons**: lucide-react
- **Fonts**: Google Fonts (Hanken Grotesk, Geist, JetBrains Mono) loaded in `index.html`
- **Toggle geolocation**: FAB button calls `fetchWeatherByLocation` via browser Geolocation API

## Gotchas

- `.env` is NOT in `.gitignore` — contains a real API key. Do not commit secrets.
- No `npm test` equivalent exists; no test infrastructure.
- `src/modules/` is a dead directory.

## Agent Rules

- Preserve the existing architecture.
- Do not introduce new libraries unless requested.
- Do not replace Zustand with another state manager.
- Respect the current component folder structure.
- Keep all UI text in Spanish.
- Maintain strict TypeScript compatibility.
- Run `npm run build` before considering a task complete.
