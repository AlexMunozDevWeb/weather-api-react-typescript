import { Search, Bell, Settings, Flame, Compass } from "lucide-react";
import styles from "./Header.module.css";

type HeaderProps = {
  onSearchClick: () => void;
  activeTheme: "crimson" | "elite";
  onToggleTheme: () => void;
};

export const Header = ({
  onSearchClick,
  activeTheme,
  onToggleTheme,
}: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left Side: Search Trigger and Brand Logo */}
        <div className={styles.left}>
          <button
            className={styles.iconButton}
            onClick={onSearchClick}
            aria-label="Buscar ciudad"
            title="Buscar ciudad"
          >
            <Search size={20} />
          </button>
          <h1 className={`${styles.title} font-headline`}>SKYCAST</h1>
        </div>

        {/* Center: Navigation Links */}
        <nav className={styles.nav}>
          <a
            className={`${styles.navLink} ${styles.activeLink}`}
            href="#forecast"
          >
            FORECAST
          </a>
          <a className={styles.navLink} href="#radar">
            RADAR
          </a>
        </nav>

        {/* Right Side: Theme Switcher and Interactive Mock Controls */}
        <div className={styles.right}>
          <button
            className={`${styles.themeButton} ${activeTheme === "crimson" ? styles.crimsonActive : styles.eliteActive}`}
            onClick={onToggleTheme}
            title={`Cambiar a tema ${activeTheme === "crimson" ? "Elite Blue" : "Crimson"}`}
            aria-label="Cambiar tema"
          >
            {activeTheme === "crimson" ? (
              <>
                <Flame size={16} className={styles.themeIcon} />
                <span className={styles.themeText}>CRIMSON</span>
              </>
            ) : (
              <>
                <Compass size={16} className={styles.themeIcon} />
                <span className={styles.themeText}>ELITE BLUE</span>
              </>
            )}
          </button>

          <button
            className={styles.iconButton}
            aria-label="Notificaciones"
            title="Notificaciones (Simulado)"
          >
            <Bell size={20} />
          </button>
          <button
            className={styles.iconButton}
            aria-label="Configuración"
            title="Configuración (Simulado)"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
