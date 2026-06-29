import { ChangeEvent, FormEvent, useState, useEffect } from "react";
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

  // Clean form state on open/close
  useEffect(() => {
    if (isOpen) {
      setAlert("");
    }
  }, [isOpen]);

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
    await fetchWeather(search);
    onClose(); // Auto close on successful trigger
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={`${styles.modalTitle} font-headline`}>BUSCAR CLIMA</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar buscador">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {alert && <Alert>{alert}</Alert>}
          
          <div className={styles.field}>
            <label htmlFor="city" className="font-label-caps">Ciudad</label>
            <input
              id="city"
              type="text"
              name="city"
              placeholder="Ej: Madrid, Tokio, Nueva York"
              value={search.city}
              onChange={handleChange}
              autoFocus
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

          <button className={styles.submit} type="submit">
            <Search size={16} />
            <span>CONSULTAR CLIMA</span>
          </button>
        </form>
      </div>
    </div>
  );
}
