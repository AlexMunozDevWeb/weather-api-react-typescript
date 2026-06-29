export const formatTemperature = (temperature: number): number => {
  const kelvin = 273.15;
  return Math.round(temperature - kelvin);
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getDayName = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[date.getDay()];
};

export const getAqiLabel = (aqi: number): string => {
  switch (aqi) {
    case 1:
      return "Excellent";
    case 2:
      return "Good";
    case 3:
      return "Moderate";
    case 4:
      return "Poor";
    case 5:
      return "Very Poor";
    default:
      return "Unknown";
  }
};