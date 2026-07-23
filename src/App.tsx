import { useEffect } from "react";
import { Compass, Flame, MapPin, Search } from "lucide-react";
import { useWeatherStore } from "./store/useWeatherStore";
import styles from "./App.module.css";
import Header from "./components/Header/Header";
import Form from "./components/Form/Form";
import Dashboard from "./components/Dashboard/Dashboard";
import Spinner from "./components/Spinner/Spinner";
import Alert from "./components/Alert/Alert";

function App() {
  const {
    weather,
    loading,
    notFound,
    error,
    isSearchOpen,
    theme,
    toggleTheme,
    setSearchOpen,
    fetchWeather,
    fetchWeatherByLocation,
  } = useWeatherStore();

  useEffect(() => {
    const bodyClass = theme === "crimson" ? "theme-crimson" : "theme-elite";
    document.body.className = bodyClass;
  }, [theme]);

  useEffect(() => {
    fetchWeather({ city: "Madrid", country: "ES" });
  }, [fetchWeather]);

  const errorMessage = error || (notFound ? "Ciudad No Encontrada. Intente de nuevo." : null);

  return (
    <>
      <a href="#main-content" className={styles.skipNav}>
        Saltar al contenido principal
      </a>

      <Header
        onSearchClick={() => setSearchOpen(true)}
        activeTheme={theme}
        onToggleTheme={toggleTheme}
      />

      <Form
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        fetchWeather={fetchWeather}
      />

      <main id="main-content" className={styles.main} aria-live="polite">
        {loading && <Spinner />}

        {!loading && errorMessage && (
          <div className={styles.centerMsg} role="alert">
            <Alert>{errorMessage}</Alert>
            <button
              className={styles.retryBtn}
              onClick={() => setSearchOpen(true)}
            >
              Buscar de nuevo
            </button>
          </div>
        )}

        {!loading && weather !== null && <Dashboard weather={weather} />}
      </main>

      <nav className={styles.bottomNav} aria-label="Navegación principal">
        <a href="#forecast" className={styles.bottomNavBtn}>
          <Compass size={20} />
          <span className={`font-label-caps ${styles.bottomNavLabel}`}>
            Forecast
          </span>
        </a>
        <a href="#radar" className={styles.bottomNavBtn}>
          <Flame size={20} />
          <span className={`font-label-caps ${styles.bottomNavLabel}`}>
            Radar
          </span>
        </a>
        <button
          onClick={() => setSearchOpen(true)}
          className={styles.bottomNavBtn}
        >
          <Search size={20} />
          <span className={`font-label-caps ${styles.bottomNavLabel}`}>
            Search
          </span>
        </button>
      </nav>

      <div className={styles.fabContainer}>
        <button
          className={styles.fab}
          onClick={fetchWeatherByLocation}
          title="Usar mi ubicación actual"
          aria-label="Usar mi ubicación actual"
        >
          <MapPin size={24} />
        </button>
      </div>
    </>
  );
}

export default App;
