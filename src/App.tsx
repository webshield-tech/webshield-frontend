import { Component, type ReactNode } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./styles/global.css";

// Catches unexpected React render errors so the app never goes fully blank
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#030508",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            gap: "16px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "3rem" }}>⚠</span>
          <h2 style={{ fontSize: "1.4rem", letterSpacing: "2px", color: "#00ff9d" }}>
            SYSTEM ERROR
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: "500px", lineHeight: 1.6 }}>
            Something went wrong. Please{" "}
            <span
              style={{ color: "#00ff9d", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
            >
              return to home
            </span>
            .
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                marginTop: "16px",
                padding: "16px",
                background: "rgba(255,0,0,0.1)",
                border: "1px solid rgba(255,0,0,0.3)",
                borderRadius: "8px",
                fontSize: "0.75rem",
                color: "#ff6b6b",
                maxWidth: "700px",
                whiteSpace: "pre-wrap",
                textAlign: "left",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
