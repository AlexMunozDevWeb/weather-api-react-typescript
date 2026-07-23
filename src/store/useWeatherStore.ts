import { create } from "zustand";
import axios from "axios";
import { z } from "zod";
import type { SearchType, ProcessedWeather } from "../types";
import { formatTemperature, formatTime, getDayName, getAqiLabel } from "../utils";

// Zod validation schemas — TS types inferred from these
const WeatherSchema = z.object({
  name: z.string(),
  dt: z.number(),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    pressure: z.number(),
    humidity: z.number(),
  }),
  wind: z.object({
    speed: z.number(),
  }),
  clouds: z.object({
    all: z.number(),
  }),
  sys: z.object({
    country: z.string(),
    sunrise: z.number(),
    sunset: z.number(),
  }),
  weather: z.array(
    z.object({
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    })
  ),
});

const ForecastItemSchema = z.object({
  dt: z.number(),
  dt_txt: z.string(),
  main: z.object({
    temp: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
  }),
  weather: z.array(
    z.object({
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    })
  ),
});

const ForecastSchema = z.object({
  list: z.array(ForecastItemSchema),
});

const AirPollutionSchema = z.object({
  list: z.array(
    z.object({
      main: z.object({
        aqi: z.number(),
      }),
    })
  ),
});

type ForecastRaw = z.infer<typeof ForecastSchema>;

// API key resolution — fail clearly if missing
const getAppId = (): string => {
  const id = import.meta.env.VITE_API_KEY_WEATHER_APP;
  if (!id) {
    throw new Error(
      "Falta la variable de entorno VITE_API_KEY_WEATHER_APP. Crea un archivo .env con tu API key de OpenWeatherMap."
    );
  }
  return id;
};

interface WeatherStore {
  weather: ProcessedWeather | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  isSearchOpen: boolean;
  theme: "crimson" | "elite";

  setTheme: (theme: "crimson" | "elite") => void;
  toggleTheme: () => void;
  setSearchOpen: (isOpen: boolean) => void;

  fetchWeather: (search: SearchType) => Promise<void>;
  fetchWeatherByLocation: () => void;
}

// Active AbortController for cancelling in-flight requests
let activeController: AbortController | null = null;

const fetchWeatherDetails = async (
  lat: number,
  lon: number,
  cityName: string,
  countryCode: string,
  signal?: AbortSignal
): Promise<ProcessedWeather> => {
  const appId = getAppId();

  const base = "https://api.openweathermap.org/data/2.5";
  const params = `lat=${lat}&lon=${lon}&appid=${appId}`;

  const [weatherRes, forecastRes, pollutionRes] = await Promise.all([
    axios.get(`${base}/weather?${params}`, { signal }),
    axios.get(`${base}/forecast?${params}`, { signal }),
    axios.get(`${base}/air_pollution?${params}`, { signal }),
  ]);

  const weatherParsed = WeatherSchema.safeParse(weatherRes.data);
  const forecastParsed = ForecastSchema.safeParse(forecastRes.data);
  const pollutionParsed = AirPollutionSchema.safeParse(pollutionRes.data);

  if (!weatherParsed.success || !forecastParsed.success || !pollutionParsed.success) {
    throw new Error("La respuesta del servidor no tiene un formato válido.");
  }

  const wData = weatherParsed.data;
  const fData = forecastParsed.data;
  const pData = pollutionParsed.data;

  // Process hourly (next 24 hours at 3h intervals)
  const hourly = fData.list.slice(0, 8).map((item) => ({
    time: formatTime(item.dt),
    temp: formatTemperature(item.main.temp),
    icon: item.weather[0]?.icon || "01d",
    description: item.weather[0]?.description || "Clima",
  }));

  // Process daily forecast (grouping by date)
  const dailyMap: { [dateStr: string]: ForecastRaw["list"] } = {};
  fData.list.forEach((item) => {
    const dateStr = item.dt_txt.split(" ")[0];
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = [];
    }
    dailyMap[dateStr].push(item);
  });

  // Use local date of the queried city (offset by timezone from API dt)
  const nowUtcMs = Date.now();
  const todayStr = new Date(nowUtcMs).toLocaleDateString("sv-SE"); // "YYYY-MM-DD" in local TZ

  const daily = Object.entries(dailyMap)
    .filter(([dateStr]) => dateStr !== todayStr)
    .slice(0, 5)
    .map(([dateStr, items]) => {
      const temps = items.map((i) => i.main.temp);
      const temp_min = Math.min(...temps);
      const temp_max = Math.max(...temps);
      const midItem = items[Math.floor(items.length / 2)] || items[0];

      return {
        dayName: getDayName(midItem.dt),
        temp_min: formatTemperature(temp_min),
        temp_max: formatTemperature(temp_max),
        icon: midItem.weather[0]?.icon || "01d",
        description: midItem.weather[0]?.description || "Clima",
        dateStr,
      };
    });

  const aqiVal = pData.list[0]?.main.aqi || 1;

  return {
    name: cityName || wData.name,
    countryCode: countryCode || wData.sys.country,
    temp: formatTemperature(wData.main.temp),
    feels_like: formatTemperature(wData.main.feels_like),
    description: wData.weather[0]?.description || "despejado",
    humidity: wData.main.humidity,
    windSpeed: Math.round(wData.wind.speed * 3.6),
    clouds: wData.clouds.all,
    pressure: wData.main.pressure,
    airQuality: {
      aqi: aqiVal,
      label: getAqiLabel(aqiVal),
    },
    hourly,
    daily,
  };
};

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  weather: null,
  loading: false,
  notFound: false,
  error: null,
  isSearchOpen: false,
  theme: localStorage.getItem("skycast-theme") === "elite" ? "elite" : "crimson",

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("skycast-theme", theme);
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "crimson" ? "elite" : "crimson";
    set({ theme: nextTheme });
    localStorage.setItem("skycast-theme", nextTheme);
  },

  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),

  fetchWeather: async (search) => {
    // Cancel any in-flight request
    if (activeController) {
      activeController.abort();
    }
    const controller = new AbortController();
    activeController = controller;

    set({ loading: true, notFound: false, error: null });

    try {
      const appId = getAppId();
      const query = search.country
        ? `${encodeURIComponent(search.city)},${encodeURIComponent(search.country)}`
        : encodeURIComponent(search.city);

      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${appId}`;
      const { data } = await axios.get(geoUrl, { signal: controller.signal });

      if (!data || data.length === 0) {
        set({ notFound: true, weather: null, loading: false });
        return;
      }

      const { lat, lon, name, country } = data[0];
      const processed = await fetchWeatherDetails(lat, lon, name, country, controller.signal);
      set({ weather: processed, error: null, loading: false });
    } catch (err) {
      if (axios.isCancel(err)) return;
      const errMsg = err instanceof Error ? err.message : "No se pudo obtener el clima.";
      const isNotFound = !errMsg.includes("formato válido") && !errMsg.includes("network");
      set({
        notFound: isNotFound,
        weather: null,
        error: errMsg,
        loading: false,
      });
    }
  },

  fetchWeatherByLocation: () => {
    if (!navigator.geolocation) {
      set({ error: "La geolocalización no es soportada por tu navegador." });
      return;
    }

    // Cancel any in-flight request
    if (activeController) {
      activeController.abort();
    }
    const controller = new AbortController();
    activeController = controller;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        set({ loading: true, notFound: false, error: null });
        const { latitude, longitude } = position.coords;
        try {
          const processed = await fetchWeatherDetails(latitude, longitude, "", "", controller.signal);
          set({ weather: processed, error: null, loading: false });
        } catch (err) {
          if (axios.isCancel(err)) return;
          set({ error: "No se pudo obtener el clima para tu ubicación.", loading: false });
        }
      },
      () => {
        set({ error: "Permiso de ubicación denegado o no disponible." });
      }
    );
  },
}));
