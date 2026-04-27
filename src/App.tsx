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
      const isChunkError = 
        this.state.error?.message?.includes("Fetching dynamically imported module") || 
        this.state.error?.message?.includes("Loading chunk") ||
        this.state.error?.name === "ChunkLoadError";

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
          <span style={{ fontSize: "3rem" }}>{isChunkError ? "🔄" : "⚠"}</span>
          <h2 style={{ fontSize: "1.4rem", letterSpacing: "2px", color: "#00ff9d" }}>
            {isChunkError ? "UPDATE REQUIRED" : "SYSTEM ERROR"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: "500px", lineHeight: 1.6 }}>
            {isChunkError 
              ? "A system update was detected. Please reload the page to initialize the latest security modules."
              : "Something went wrong. The system encountered an unexpected runtime exception."}
          </p>
          
          <button
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              background: "#00ff9d",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
          >
            {isChunkError ? "Reload System" : "Return to Home"}
          </button>

          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                marginTop: "24px",
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
              {this.state.error.stack || this.state.error.message}
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
