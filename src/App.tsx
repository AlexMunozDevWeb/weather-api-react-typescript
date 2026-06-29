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
    fetchWeatherByLocation
  } = useWeatherStore();

  // Sync theme class with document body
  useEffect(() => {
    const bodyClass = theme === "crimson" ? "theme-crimson" : "theme-elite";
    document.body.className = bodyClass;
  }, [theme]);

  // Fetch default city on load
  useEffect(() => {
    fetchWeather({ city: "Madrid", country: "ES" });
  }, [fetchWeather]);

  return (
    <>
      {/* Top Navigation Bar */}
      <Header 
        onSearchClick={() => setSearchOpen(true)} 
        activeTheme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Floating Search Modal Overlay */}
      <Form 
        isOpen={isSearchOpen} 
        onClose={() => setSearchOpen(false)} 
        fetchWeather={fetchWeather} 
      />

      {/* Main Dashboard Space */}
      <main className={styles.main}>
        {loading && <Spinner />}

        {!loading && (notFound || error) && (
          <div className={styles.centerMsg}>
            <Alert>{error || "Ciudad No Encontrada. Intente de nuevo."}</Alert>
            <button 
              className={styles.retryBtn} 
              onClick={() => setSearchOpen(true)}
            >
              Buscar de nuevo
            </button>
          </div>
        )}

        {!loading && weather !== null && (
          <Dashboard weather={weather} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className={styles.bottomNav}>
        <a href="#forecast" className={styles.bottomNavBtn}>
          <Compass size={20} />
          <span className="font-label-caps" style={{ fontSize: "0.9rem" }}>Forecast</span>
        </a>
        <a href="#radar" className={styles.bottomNavBtn}>
          <Flame size={20} />
          <span className="font-label-caps" style={{ fontSize: "0.9rem" }}>Radar</span>
        </a>
        <button 
          onClick={() => setSearchOpen(true)} 
          className={styles.bottomNavBtn}
        >
          <Search size={20} />
          <span className="font-label-caps" style={{ fontSize: "0.9rem" }}>Search</span>
        </button>
      </nav>

      {/* Floating Location Action Button */}
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
