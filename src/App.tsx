import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./styles/global.css";
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}


export default App;

