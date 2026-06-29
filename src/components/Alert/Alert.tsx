import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import styles from "./Alert.module.css";

type AlertProps = {
  children: ReactNode;
};

export default function Alert({ children }: AlertProps) {
  return (
    <div className={styles.alert} role="alert">
      <AlertCircle className={styles.icon} size={18} />
      <span className={styles.text}>{children}</span>
    </div>
  );
}
