# SkyCast Weather Dashboard

Aplicación web de clima construida con React, TypeScript y Vite que muestra información meteorológica en tiempo real utilizando la API de OpenWeatherMap. La interfaz presenta un diseño tipo dashboard con tarjetas visuales, animaciones y métricas de clima en un estilo moderno y responsivo.

https://weather-react-tscript.netlify.app/

<img width="1292" height="807" alt="image" src="https://github.com/user-attachments/assets/4868f781-fa3c-434f-86bb-5bedfe14c4ee" />

## Características principales

- Búsqueda de clima por ciudad y país.
- Carga inicial de una ciudad por defecto (Madrid, España).
- Consulta del clima actual con descripción, temperatura, sensación térmica, humedad, viento, presión y calidad del aire.
- Pronóstico horario de las próximas 24 horas.
- Pronóstico extendido de 5 días.
- Simulación de radar de precipitación con controles de zoom y velocidad.
- Integración con geolocalización del navegador para consultar el clima de la ubicación actual.
- Cambio de tema entre dos modos visuales: Crimson y Elite.
- Estados de carga, error y sin resultados con mensajes amigables.
- Diseño responsivo con estilos en CSS Modules y Tailwind para componentes auxiliares.
- Accesibilidad WCAG 2.1: focus trap en modales, skip-navigation, aria-live, roles ARIA.
- Error Boundary para capturar errores de render sin pantalla blanca.
- Cancelación de requests duplicados con AbortController.

## Tecnologías utilizadas

- React 18
- TypeScript 5.6
- Vite 6
- Zustand para la gestión de estado
- Axios para peticiones HTTP
- Zod para validación de respuestas
- Tailwind CSS y CSS Modules
- Lucide React para iconografía

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Una clave API de OpenWeatherMap

## Inicialización del proyecto

1. Clona el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd weather-api-react-typescript
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo de entorno en la raíz del proyecto llamado `.env` y agrega tu clave API:

   ```env
   VITE_API_KEY_WEATHER_APP=tu_clave_api_aqui
   ```

   > **Nota:** El prefijo `VITE_` es obligatorio. Sin él, la variable no estará disponible en el código del cliente.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicación quedará disponible en la URL que indique Vite, normalmente `http://localhost:5173`.

## Scripts disponibles

- `npm run dev` Inicia el entorno de desarrollo.
- `npm run build` Compila la aplicación para producción.
- `npm run lint` Ejecuta ESLint sobre el proyecto.
- `npm run preview` Sirve la build generada localmente.
- `npm run opencode` Ejecuta un script auxiliar del proyecto.

## Estructura del proyecto

- `src/components` Contiene los componentes de UI como el formulario, dashboard, header, alertas, spinner y ErrorBoundary.
- `src/store` Gestiona el estado global con Zustand y las peticiones a la API.
- `src/types` Define los tipos TypeScript usados por la app.
- `src/utils` Incluye utilidades para formateo de temperatura, tiempo y etiquetas de calidad del aire.
- `src/data` Contiene datos auxiliares como la lista de países.

## Integración con la API

La aplicación consume los siguientes endpoints de OpenWeatherMap:

- Geocodificación para convertir nombres de ciudades en coordenadas.
- Clima actual por coordenadas.
- Pronóstico de 5 días por coordenadas.
- Calidad del aire por coordenadas.

## Notas importantes

- El archivo `.env` no debe compartirse públicamente porque contiene credenciales sensibles.
- La app usa almacenamiento local para recordar el tema seleccionado entre sesiones.
- Si la API no responde o la ciudad no existe, se muestran mensajes de advertencia en la interfaz.

## Fuentes y recursos

- Google Fonts: Hanken Grotesk, Geist y JetBrains Mono
- CSS Modules: https://github.com/css-modules/css-modules
- OpenWeatherMap: https://openweathermap.org/
- Vite env variables: https://vite.dev/guide/env-and-mode
