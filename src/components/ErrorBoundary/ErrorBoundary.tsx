import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "32px",
          textAlign: "center",
          fontFamily: "'Geist', sans-serif",
          backgroundColor: "var(--bg-app, #121414)",
          color: "var(--on-surface, #e3e2e2)",
        }}>
          <AlertTriangle size={48} style={{ color: "#fbbf24", marginBottom: "16px" }} />
          <h2 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>Algo salió mal</h2>
          <p style={{ fontSize: "1.4rem", color: "var(--on-surface-variant, #c4c7c7)", marginBottom: "24px", maxWidth: "480px" }}>
            Ha ocurrido un error inesperado. Por favor, recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              backgroundColor: "var(--primary, #e11d48)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.3rem",
              fontWeight: 700,
              cursor: "pointer",
              marginRight: "12px",
            }}
          >
            Recargar página
          </button>
          <button
            onClick={this.handleReset}
            style={{
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: "var(--on-surface, #e3e2e2)",
              border: "1px solid var(--border-color, #262626)",
              borderRadius: "8px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.3rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
