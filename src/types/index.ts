export type SearchType = {
  city: string;
  country: string;
};

export type Country = {
  code: string;
  name: string;
};

// Current Weather API Raw Data Structure
export type WeatherRaw = {
  name: string;
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
};

// 5-Day/3-Hour Forecast API Raw Structure
export type ForecastRaw = {
  list: Array<{
    dt: number;
    dt_txt: string;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
};

// Air Pollution Raw Structure
export type AirPollutionRaw = {
  list: Array<{
    main: {
      aqi: number; // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
    };
  }>;
};

// Application Processed Types
export type HourlyForecast = {
  time: string; // e.g. "14:00"
  temp: number; // Celsius
  icon: string;
  description: string;
};

export type DailyForecast = {
  dayName: string; // e.g. "MON"
  temp_min: number; // Celsius
  temp_max: number; // Celsius
  icon: string;
  description: string;
  dateStr: string;
};

export type AirQuality = {
  aqi: number;
  label: string;
};

export type ProcessedWeather = {
  name: string;
  countryCode: string;
  temp: number;
  feels_like: number;
  description: string;
  humidity: number;
  windSpeed: number;
  clouds: number;
  pressure: number;
  airQuality: AirQuality;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
};