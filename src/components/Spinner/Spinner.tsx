import styles from "./Spinner.module.css";

export default function Spinner() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}>
        <div className={styles.ring}></div>
        <div className={`${styles.ring} ${styles.delayed}`}></div>
        <div className={styles.dot}></div>
      </div>
      <p className={`${styles.text} font-label-caps`}>Actualizando atmósfera...</p>
    </div>
  );
}
