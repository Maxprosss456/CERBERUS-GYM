import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PreferenciasProvider } from "./context/preferenciasContext.jsx";
import { DatosProvider } from "./context/DatosContext.jsx";
// tus imports de estilos globales siguen igual

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PreferenciasProvider>
          <DatosProvider>
            <App />
          </DatosProvider>
        </PreferenciasProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);