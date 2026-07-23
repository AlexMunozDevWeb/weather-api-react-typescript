# Integración API — SkyCast Weather Dashboard

## Proveedor

**OpenWeatherMap** — https://openweathermap.org/api

Todas las llamadas se realizan desde el cliente (browser) usando `axios`. No hay backend propio.

## Autenticación

La API key se resuelve en `getAppId()` (`src/store/useWeatherStore.ts:73`):

```typescript
const id = import.meta.env.VITE_API_KEY_WEATHER_APP;
```

- La variable **debe** tener el prefijo `VITE_` para que Vite la exponga al bundle del cliente.
- Si falta, `getAppId()` lanza un error descriptivo.
- Se pasa como query parameter `appid=` en cada request (estándar de OpenWeatherMap).

> **Nota:** `.env` no está commiteado. Ver `.env.example` para la plantilla.

## Endpoints

### 1. Geocoding — Ciudad a coordenadas

```
GET /geo/1.0/direct?q={city},{country}&limit=1&appid={appId}
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `q` | string | Ciudad, opcionalmente con código de país separado por coma |
| `limit` | number | Máximo de resultados (fijo en `1`) |

**Respuesta:**
```json
[{ "name": "Madrid", "lat": 40.4165, "lon": -3.70256, "country": "ES" }]
```

**Manejo:** Array vacío → `notFound: true`. Excepción → mensaje de error.

---

### 2. Clima Actual

```
GET /data/2.5/weather?lat={lat}&lon={lon}&appid={appId}
```

**Validado con:** `WeatherSchema` (Zod)

```json
{
  "name": "Madrid",
  "dt": 1700000000,
  "main": { "temp": 283.15, "feels_like": 280.5, "humidity": 65, "pressure": 1013 },
  "wind": { "speed": 3.5 },
  "clouds": { "all": 20 },
  "sys": { "country": "ES", "sunrise": 1700000000, "sunset": 1700040000 },
  "weather": [{ "main": "Clear", "description": "cielo despejado", "icon": "01d" }]
}
```

---

### 3. Pronóstico 5 días / 3 horas

```
GET /data/2.5/forecast?lat={lat}&lon={lon}&appid={appId}
```

**Validado con:** `ForecastSchema` (Zod)

```json
{
  "list": [{
    "dt": 1700000000,
    "dt_txt": "2024-01-15 12:00:00",
    "main": { "temp": 283.15, "temp_min": 280.0, "temp_max": 286.0 },
    "weather": [{ "main": "Clouds", "description": "nubes dispersas", "icon": "03d" }]
  }]
}
```

---

### 4. Calidad del Aire

```
GET /data/2.5/air_pollution?lat={lat}&lon={lon}&appid={appId}
```

**Validado con:** `AirPollutionSchema` (Zod)

```json
{ "list": [{ "main": { "aqi": 2 } }] }
```

| AQI | Label |
|-----|-------|
| 1 | Excellent |
| 2 | Good |
| 3 | Moderate |
| 4 | Poor |
| 5 | Very Poor |

## Transformación de Datos

Las respuestas crudas se transforman en `ProcessedWeather` dentro de `fetchWeatherDetails()`:

| Transformación | Fórmula | Utils |
|---------------|---------|-------|
| Temperatura K→°C | `Math.round(temp - 273.15)` | `formatTemperature()` |
| Viento m/s→km/h | `Math.round(speed * 3.6)` | inline |
| Hora Unix→`HH:MM` | `new Date(ts * 1000)` | `formatTime()` |
| Día Unix→`MON` | `days[date.getDay()]` | `getDayName()` |
| AQI num→label | switch 1-5 | `getAqiLabel()` |

### Pronóstico horario

- Primeros 8 items del array (24h en intervalos de 3h).
- Cada item → `HourlyForecast` con hora, temp, ícono, descripción.

### Pronóstico diario

- Items agrupados por fecha (`dt_txt.split(" ")[0]`).
- Se excluye el día actual usando `toLocaleDateString("sv-SE")` para formato `YYYY-MM-DD`.
- Se toman los primeros 5 días.
- Para cada día: `temp_min` (mínimo del grupo), `temp_max` (máximo), ícono del item del medio.

## Estructura `ProcessedWeather`

```typescript
type ProcessedWeather = {
  name: string;           // Ciudad
  countryCode: string;    // País (ISO)
  temp: number;           // °C actual
  feels_like: number;     // °C sensación
  description: string;    // "cielo despejado"
  humidity: number;       // %
  windSpeed: number;      // km/h
  clouds: number;         // %
  pressure: number;       // hPa
  airQuality: AirQuality; // { aqi, label }
  hourly: HourlyForecast[]; // 8 items (24h)
  daily: DailyForecast[];   // 5 días
};
```

## AbortController

Las búsquedas rápidas sucesivas cancelan el request anterior:

```typescript
let activeController: AbortController | null = null;

// En fetchWeather:
if (activeController) activeController.abort();
const controller = new AbortController();
activeController = controller;
```

Si el usuario busca "Madrid" y luego "Tokio" rápidamente, el request de "Madrid" se cancela y solo se muestra "Tokio".

## Errores

| Error | Causa | Mensaje UI |
|-------|-------|------------|
| Ciudad no encontrada | Geocoding: array vacío | "Ciudad No Encontrada. Intente de nuevo." |
| API key faltante | `getAppId()` falla | Error throw: "Falta la variable de entorno..." |
| Formato inválido | Zod parse falla | "La respuesta del servidor no tiene un formato válido" |
| Red / timeout | Axios error | Mensaje del error |
| Geolocalización denegada | Permiso rechazado | "Permiso de ubicación denegado o no disponible." |
| Geolocalización no soportada | `navigator.geolocation` undefined | "La geolocalización no es soportada por tu navegador." |
| Request cancelado | `AbortController` | Silencioso (no muestra error) |

## Rate Limits (Plan Gratuito)

- **60 llamadas/minuto**.
- Cada búsqueda consume 4 requests (1 geocoding + 3 datos).
- No hay caché implementada — cada búsqueda es fresca.
