import { ChangeEvent, FormEvent, useState, useEffect, useRef, useCallback } from "react";
import { X, Search } from "lucide-react";
import type { SearchType } from "../../types";
import { countries } from "../../data/countries";
import styles from "./Form.module.css";
import Alert from "../Alert/Alert";

type FormProps = {
  isOpen: boolean;
  onClose: () => void;
  fetchWeather: (search: SearchType) => Promise<void>;
};

export default function Form({ isOpen, onClose, fetchWeather }: FormProps) {
  const [search, setSearch] = useState<SearchType>({
    city: "",
    country: "",
  });

  const [alert, setAlert] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap and Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setAlert("");
      // Focus the input after the modal animation
      requestAnimationFrame(() => inputRef.current?.focus());
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
  ) => {
    setSearch({
      ...search,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.values(search).includes("")) {
      setAlert("Todos los campos son obligatorios");
      return;
    }
    setAlert("");
    setIsSubmitting(true);
    try {
      await fetchWeather(search);
      onClose();
    } catch {
      setAlert("No se pudo obtener el clima. Intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Buscar ciudad">
      <div
        className={styles.modal}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={`${styles.modalTitle} font-headline`}>BUSCAR CLIMA</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar buscador">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {alert && <Alert>{alert}</Alert>}

          <div className={styles.field}>
            <label htmlFor="city" className="font-label-caps">Ciudad</label>
            <input
              ref={inputRef}
              id="city"
              type="text"
              name="city"
              placeholder="Ej: Madrid, Tokio, Nueva York"
              value={search.city}
              onChange={handleChange}
              required
              maxLength={100}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="country" className="font-label-caps">País</label>
            <div className={styles.selectWrapper}>
              <select
                id="country"
                name="country"
                value={search.country}
                onChange={handleChange}
                required
              >
                <option value=""> -- Seleccione un país -- </option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            <Search size={16} />
            <span>{isSubmitting ? "BUSCANDO..." : "CONSULTAR CLIMA"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
