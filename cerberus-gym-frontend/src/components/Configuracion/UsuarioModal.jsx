import { useState } from "react";
import Modal from "../Modal.jsx";

export default function UsuarioModal({ onCerrar, onGuardar, usuarioInicial, esPropio = false }) {
  const esEdicion = Boolean(usuarioInicial);
  const [usuario, setUsuario] = useState(usuarioInicial?.usuario ?? "");
  const [rol, setRol] = useState(usuarioInicial?.rol ?? "empleado");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    if (guardando) return;

    const nombre = usuario.trim();
    if (nombre.length < 3 || nombre.length > 30) {
      setError("El usuario debe tener entre 3 y 30 caracteres.");
      return;
    }
    if (/\s/.test(nombre)) {
      setError("El usuario no puede tener espacios.");
      return;
    }
    if ((!esEdicion || password) && (password.length < 8 || password.length > 72)) {
      setError("La contraseña debe tener entre 8 y 72 caracteres.");
      return;
    }

    let datos;
    if (esEdicion) {
      datos = {};
      if (nombre !== usuarioInicial.usuario) datos.usuario = nombre;
      if (!esPropio && rol !== usuarioInicial.rol) datos.rol = rol;
      if (!esPropio && password) datos.password = password;
      if (Object.keys(datos).length === 0) {
        setError("No hiciste ningún cambio.");
        return;
      }
    } else {
      datos = { usuario: nombre, password, rol };
    }

    setError("");
    setGuardando(true);
    try {
      await onGuardar(datos);
      // Si salió bien, el padre cierra el modal: no hay nada más que hacer acá.
    } catch (err) {
      setError(err.message || "No se pudo guardar el usuario.");
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={esEdicion ? "Editar usuario" : "Nuevo usuario"} onCerrar={onCerrar} ancho="460px">
      <form className="usuario-form" onSubmit={manejarSubmit}>
        <label>
          Usuario (*)
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Ej: recepcion"
            maxLength={30}
            autoComplete="off"
          />
        </label>

        <label>
          Rol (*)
          <select value={rol} onChange={(e) => setRol(e.target.value)} disabled={esPropio}>
            <option value="empleado">Empleado</option>
            <option value="administrador">Administrador</option>
          </select>
          {esPropio && <span className="usuario-form-ayuda">No podés cambiar tu propio rol.</span>}
        </label>

        {esPropio ? (
          <p className="usuario-form-ayuda">
            Tu contraseña la cambiás desde "Cambiar mi contraseña".
          </p>
        ) : (
          <label>
            {esEdicion ? "Nueva contraseña" : "Contraseña (*)"}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={esEdicion ? "Dejá vacío para no cambiarla" : "Mínimo 8 caracteres"}
              autoComplete="new-password"
            />
          </label>
        )}

        {error && (
          <p className="usuario-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="usuario-form-acciones">
          <button type="button" className="btn btn-secundario" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={guardando}>
            {guardando ? "Guardando…" : esEdicion ? "Guardar Cambios" : "Crear usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
}