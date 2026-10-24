import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Login.css";
import logo from "../../assets/logo-cerberus.png";

export default function Login() {
  const { autenticado, ingresar } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (autenticado) return <Navigate to="/socios" replace />;

  function manejarSubmit(e) {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setError("Completá usuario y contraseña.");
      return;
    }
    setError("");
    // Mock: cualquier combinación no vacía ingresa.
    // Cuando exista el backend, acá va la llamada real de autenticación.
    ingresar({ usuario });
    navigate("/socios", { replace: true });
  }

  return (
    <div className="login-fondo">
      <form className="login-card" onSubmit={manejarSubmit}>
        <img src={logo} alt="Cerberus GYM" className="login-logo" />
        <h1 className="login-titulo">CERBERUS GYM</h1>

        <label className="sr-only" htmlFor="usuario">Usuario</label>
        <input
          id="usuario"
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoFocus
        />

        <label className="sr-only" htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="login-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primario login-boton">
          Ingresar
        </button>
      </form>
    </div>
  );
}
