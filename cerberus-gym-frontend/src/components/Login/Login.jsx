import { useState } from "react";
import { Navigate} from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Login.css";
import logo from "../../assets/logo-cerberus.png";

export default function Login() {
  const { autenticado, ingresar } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  if (autenticado) return <Navigate to="/socios" replace />;

  async function manejarSubmit(e) {
    e.preventDefault();
    if (guardando) return;

    if (!usuario.trim() || !password.trim()) {
      setError("Completá usuario y contraseña.");
      return;
    }

    setError("");
    setGuardando(true);
    try {
      await ingresar(usuario.trim(), password);
      // Al quedar autenticado, el <Navigate> de arriba redirige solo.
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
      setGuardando(false);
    }
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

        <button type="submit" className="btn btn-primario login-boton" disabled={guardando}>
          {guardando ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
