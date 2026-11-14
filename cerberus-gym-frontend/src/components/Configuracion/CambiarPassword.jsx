import { useState } from "react";
import { cambiarPassword } from "../../data/auth.js";

export default function CambiarPassword() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [aviso, setAviso] = useState({ tipo: "", texto: "" });
  const [guardando, setGuardando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    if (guardando) return;

    if (!actual || !nueva || !repetir) {
      setAviso({ tipo: "error", texto: "Completá todos los campos." });
      return;
    }
    if (nueva.length < 8) {
      setAviso({ tipo: "error", texto: "La contraseña nueva debe tener al menos 8 caracteres." });
      return;
    }
    if (nueva !== repetir) {
      setAviso({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
      return;
    }

    setGuardando(true);
    setAviso({ tipo: "", texto: "" });
    try {
      await cambiarPassword(actual, nueva);
      setActual("");
      setNueva("");
      setRepetir("");
      setAviso({ tipo: "ok", texto: "Contraseña actualizada." });
    } catch (err) {
      setAviso({ tipo: "error", texto: err.message || "No se pudo cambiar la contraseña." });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="config-fila" onSubmit={manejarSubmit}>
      <span className="config-label">Cambiar mi contraseña</span>
      <div className="config-dias-anticipacion">
        <input
          type="password"
          className="config-input-texto"
          placeholder="Contraseña actual"
          autoComplete="current-password"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
        <input
          type="password"
          className="config-input-texto"
          placeholder="Contraseña nueva (mín. 8)"
          autoComplete="new-password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <input
          type="password"
          className="config-input-texto"
          placeholder="Repetir contraseña nueva"
          autoComplete="new-password"
          value={repetir}
          onChange={(e) => setRepetir(e.target.value)}
        />
        {aviso.texto && (
          <p role="status" className={aviso.tipo === "ok" ? "config-aviso-ok" : "config-aviso-error"}>
            {aviso.texto}
          </p>
        )}
        <button type="submit" className="btn btn-primario config-boton" disabled={guardando}>
          {guardando ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </div>
    </form>
  );
}