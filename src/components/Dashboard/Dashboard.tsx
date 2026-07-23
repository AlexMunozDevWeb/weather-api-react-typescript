import { useEffect, useRef, useState } from "react";
import {
  Sun, Moon, Cloud, CloudSun, CloudRain,
  CloudLightning, Snowflake, CloudFog,
  Droplet, Wind, Gauge,
  Plus, Minus, RefreshCw
} from "lucide-react";
import type { ProcessedWeather } from "../../types";
import { useWeatherStore } from "../../store/useWeatherStore";
import styles from "./Dashboard.module.css";

type DashboardProps = {
  weather: ProcessedWeather;
};

const getWeatherIcon = (iconCode: string, size = 24) => {
  const code = iconCode.slice(0, 2);
  switch (code) {
    case "01":
      return iconCode.endsWith("d") ? <Sun size={size} /> : <Moon size={size} />;
    case "02":
      return <CloudSun size={size} />;
    case "03":
    case "04":
      return <Cloud size={size} />;
    case "09":
    case "10":
      return <CloudRain size={size} />;
    case "11":
      return <CloudLightning size={size} />;
    case "13":
      return <Snowflake size={size} />;
    case "50":
      return <CloudFog size={size} />;
    default:
      return <Sun size={size} />;
  }
};

const THEME_COLORS: Record<string, string> = {
  crimson: "#e11d48",
  elite: "#00a3ff",
};

const getAqiClass = (aqi: number, cssModules: typeof styles) => {
  switch (aqi) {
    case 1: return cssModules.aqiExcellent;
    case 2: return cssModules.aqiGood;
    case 3: return cssModules.aqiModerate;
    case 4: return cssModules.aqiPoor;
    case 5: return cssModules.aqiVeryPoor;
    default: return cssModules.aqiModerate;
  }
};

export default function Dashboard({ weather }: DashboardProps) {
  const { theme } = useWeatherStore();
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const [radarZoom, setRadarZoom] = useState(1);
  const [radarSpeed, setRadarSpeed] = useState(1.5);
  const animationFrameId = useRef<number | null>(null);

  // Animated Precipitation Radar Simulation — pauses when tab is hidden
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = 320);
    let isPaused = false;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 320;
      }
    };

    const handleVisibility = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        pulseTime = 0;
        animationFrameId.current = requestAnimationFrame(renderRadar);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    const rainClusters = [
      { x: 0.35, y: 0.45, r: 40, intensity: 0.5 },
      { x: 0.65, y: 0.35, r: 60, intensity: 0.8 },
      { x: 0.50, y: 0.70, r: 25, intensity: 0.3 },
    ];

    let pulseTime = 0;

    const renderRadar = () => {
      if (isPaused) return;

      pulseTime += 0.02 * radarSpeed;

      ctx.fillStyle = "#0c0d0e";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#1b1c1d";
      ctx.lineWidth = 1;
      const maxRadius = Math.max(width, height);
      for (let r = 50; r < maxRadius; r += 50 * radarZoom) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(68, 71, 72, 0.15)";
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const primaryColor = THEME_COLORS[theme] ?? "#e11d48";

      rainClusters.forEach((cluster) => {
        const cx = (cluster.x * width - width / 2) * radarZoom + width / 2;
        const cy = (cluster.y * height - height / 2) * radarZoom + height / 2;
        const size = cluster.r * radarZoom * (1 + Math.sin(pulseTime + cluster.intensity) * 0.1);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(0.4, `${primaryColor}aa`);
        gradient.addColorStop(0.7, `${primaryColor}33`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        ctx.fill();
      });

      const sweepAngle = pulseTime % (Math.PI * 2);
      ctx.strokeStyle = `${primaryColor}22`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2, height / 2);
      ctx.lineTo(
        width / 2 + Math.cos(sweepAngle) * maxRadius,
        height / 2 + Math.sin(sweepAngle) * maxRadius
      );
      ctx.stroke();

      ctx.fillStyle = `${primaryColor}06`;
      ctx.beginPath();
      ctx.moveTo(width / 2, height / 2);
      ctx.arc(width / 2, height / 2, maxRadius, sweepAngle - 0.2, sweepAngle);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(196, 199, 199, 0.4)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText(`${Math.round(50 / radarZoom)}km`, width / 2 + 55, height / 2 - 5);
      ctx.fillText(`${Math.round(100 / radarZoom)}km`, width / 2 + 105, height / 2 - 5);

      animationFrameId.current = requestAnimationFrame(renderRadar);
    };

    renderRadar();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [radarZoom, radarSpeed, theme]);

  const handleZoomIn = () => setRadarZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setRadarZoom((z) => Math.max(0.5, z - 0.25));
  const handleSpeedToggle = () => setRadarSpeed((s) => (s === 1.5 ? 3.0 : s === 3.0 ? 0.5 : 1.5));

  return (
    <div className={styles.bentoGrid} aria-live="polite">
      {/* 1. Hero Card: Current City Conditions */}
      <div className={`${styles.card} ${styles.heroCard}`}>
        <div className={styles.topAccent}></div>
        <div className={styles.heroHeader}>
          <div>
            <p className="font-label-caps var-label">LIVE | {weather.name.toUpperCase()}, {weather.countryCode.toUpperCase()}</p>
            <h2 className={`${styles.heroDescription} font-display`}>{weather.description}</h2>
          </div>
          <div className={styles.heroIcon}>
            {getWeatherIcon(weather.daily[0]?.icon || "01d", 72)}
          </div>
        </div>
        <div className={styles.heroFooter}>
          <div className={styles.tempGroup}>
            <span className={styles.tempVal}>{weather.temp}</span>
            <span className={styles.tempUnit}>°C</span>
          </div>
          <div className={styles.feelsGroup}>
            <p className="font-label-caps var-label">FEELS LIKE</p>
            <p className={`${styles.feelsVal} font-headline`}>{weather.feels_like}°C</p>
          </div>
        </div>
      </div>

      {/* 2. Environmental Metrics Bento Card */}
      <div className={`${styles.card} ${styles.metricsCard}`}>
        <div className={styles.metricsList}>
          <div className={styles.metricItem}>
            <div>
              <p className="font-label-caps var-label">AIR QUALITY</p>
              <h3 className={`${styles.metricVal} font-headline`}>{weather.airQuality.label}</h3>
            </div>
            <span className={`${styles.aqiPulse} ${getAqiClass(weather.airQuality.aqi, styles)}`}></span>
          </div>

          <div className={styles.metricItem}>
            <div>
              <p className="font-label-caps var-label">HUMIDITY</p>
              <h3 className={`${styles.metricVal} font-headline`}>{weather.humidity}%</h3>
            </div>
            <Droplet className={styles.metricIcon} size={20} />
          </div>

          <div className={styles.metricItem}>
            <div>
              <p className="font-label-caps var-label">WIND SPEED</p>
              <h3 className={`${styles.metricVal} font-headline`}>{weather.windSpeed} km/h</h3>
            </div>
            <Wind className={styles.metricIcon} size={20} />
          </div>

          <div className={styles.metricItem} style={{ borderBottom: "none", paddingBottom: 0 }}>
            <div>
              <p className="font-label-caps var-label">PRESSURE</p>
              <h3 className={`${styles.metricVal} font-headline`}>{weather.pressure} hPa</h3>
            </div>
            <Gauge className={styles.metricIcon} size={20} />
          </div>
        </div>
        <div className={styles.metricsFooter}>
          <button className={styles.analyticsBtn}>
            DETAILED METRICS
          </button>
        </div>
      </div>

      {/* 3. 24-Hour Precision Forecast Ribbon */}
      <div className={`${styles.card} ${styles.hourlyCard}`}>
        <div className={styles.hourlyHeader}>
          <p className="font-label-caps var-label">24-HOUR PRECISION FORECAST</p>
          <div className={styles.hourlyIndicators}>
            <span className={styles.indicatorActive}></span>
            <span className={styles.indicatorInactive}></span>
          </div>
        </div>
        <div className={styles.hourlyTimeline}>
          {weather.hourly.map((hour, idx) => (
            <div key={idx} className={styles.timelineItem}>
              <p className="font-label-caps var-label">{idx === 0 ? "NOW" : hour.time}</p>
              <span className={styles.timelineIcon}>
                {getWeatherIcon(hour.icon, 28)}
              </span>
              <p className={`${styles.timelineTemp} font-headline`}>{hour.temp}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Precipitation Radar Simulated Canvas */}
      <div className={`${styles.card} ${styles.radarCard}`} id="radar">
        <div className={styles.radarOverlay}>
          <p className="font-label-caps var-label">RADAR | PRECIPITATION</p>
        </div>

        <div className={styles.canvasContainer}>
          <canvas ref={radarCanvasRef} className={styles.radarCanvas} />
        </div>

        <div className={styles.radarControls}>
          <button className={styles.radarBtn} onClick={handleZoomIn} title="Acercar">
            <Plus size={14} />
          </button>
          <button className={styles.radarBtn} onClick={handleZoomOut} title="Alejar">
            <Minus size={14} />
          </button>
          <button className={styles.radarBtn} onClick={handleSpeedToggle} title="Velocidad Escáner">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 5. 5-Day Outlook List */}
      <div className={`${styles.card} ${styles.outlookCard}`} id="forecast">
        <p className="font-label-caps var-label mb-6">5-DAY OUTLOOK</p>
        <div className={styles.outlookList}>
          {weather.daily.map((day, idx) => (
            <div key={idx} className={styles.outlookRow}>
              <span className={`${styles.outlookDay} font-label-caps`}>{day.dayName}</span>
              <span className={styles.outlookIcon}>
                {getWeatherIcon(day.icon, 20)}
              </span>
              <div className={styles.outlookTempRange}>
                <span className={`${styles.outlookTempMax} font-headline`}>{day.temp_max}°</span>
                <span className={`${styles.outlookTempMin} font-headline`}>{day.temp_min}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
