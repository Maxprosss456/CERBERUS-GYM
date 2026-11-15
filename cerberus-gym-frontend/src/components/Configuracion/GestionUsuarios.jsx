import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import ConfirmarModal from "../ConfirmarModal.jsx";
import UsuarioModal from "./UsuarioModal.jsx";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  borrarUsuario,
} from "../../data/usuarios.js";

const ETIQUETA_ROL = { administrador: "Administrador", empleado: "Empleado" };

export default function GestionUsuarios() {
  const { usuarioId } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { tipo: "crear" | "editar" | "borrar", usuario? }

  const cargar = useCallback(async () => {
    try {
      setUsuarios(await listarUsuarios());
      setError("");
    } catch (err) {
      setError(err.message || "No se pudo cargar la lista de usuarios.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function manejarCrear(datos) {
    await crearUsuario(datos);
    setModal(null);
    await cargar();
  }

  async function manejarEditar(cambios) {
    await actualizarUsuario(modal.usuario.id, cambios);
    setModal(null);
    await cargar();
  }

  async function manejarBorrar() {
    try {
      await borrarUsuario(modal.usuario.id);
      setError("");
    } catch (err) {
      setError(err.message || "No se pudo borrar el usuario.");
    }
    setModal(null);
    await cargar();
  }

  return (
    <div className="usuarios-gestion">
      <div className="usuarios-encabezado">
        <span className="usuarios-titulo">Gestión de usuarios</span>
        <button
          className="btn btn-primario usuarios-boton"
          onClick={() => setModal({ tipo: "crear" })}
        >
          + Nuevo usuario
        </button>
      </div>

      {error && (
        <p role="alert" className="config-aviso-error">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="config-drive-texto">Cargando usuarios…</p>
      ) : (
        <div className="usuarios-tabla-contenedor">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const esPropio = u.id === usuarioId;
                return (
                  <tr key={u.id}>
                    <td>
                      {u.usuario}
                      {esPropio && <span className="usuarios-etiqueta-propio"> (vos)</span>}
                    </td>
                    <td>{ETIQUETA_ROL[u.rol] ?? u.rol}</td>
                    <td>
                      <div className="usuarios-acciones">
                        <button
                          className="btn btn-secundario usuarios-boton"
                          onClick={() => setModal({ tipo: "editar", usuario: u })}
                        >
                          Editar
                        </button>
                        {!esPropio && (
                          <button
                            className="btn confirmar-boton-peligro usuarios-boton"
                            onClick={() => setModal({ tipo: "borrar", usuario: u })}
                          >
                            Borrar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal?.tipo === "crear" && (
        <UsuarioModal onCerrar={() => setModal(null)} onGuardar={manejarCrear} />
      )}

      {modal?.tipo === "editar" && (
        <UsuarioModal
          usuarioInicial={modal.usuario}
          esPropio={modal.usuario.id === usuarioId}
          onCerrar={() => setModal(null)}
          onGuardar={manejarEditar}
        />
      )}

      {modal?.tipo === "borrar" && (
        <ConfirmarModal
          titulo="Borrar usuario"
          mensaje={`¿Seguro que querés borrar a "${modal.usuario.usuario}"? Esta acción no se puede deshacer.`}
          textoConfirmar="Borrar"
          onCerrar={() => setModal(null)}
          onConfirmar={manejarBorrar}
        />
      )}
    </div>
  );
}