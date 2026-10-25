import { useState } from "react";
import Modal from "../Modal.jsx";
import ConfirmarModal from "../ConfirmarModal.jsx";
import "./Socios.css";

export default function SocioDetalleModal({ socio, pagosDelSocio, onCerrar, onEditar, onEliminar }) {
  const [pidiendoConfirmacion, setPidiendoConfirmacion] = useState(false);
  const [error, setError] = useState("");
  const [eliminando, setEliminando] = useState(false);

  async function confirmarEliminar() {
    if (eliminando) return;
    setError("");
    setEliminando(true);
    try {
      await onEliminar(socio.id);
      // Si salió bien, el padre cierra todo: no se toca más el estado.
    } catch {
      setError("No se pudo eliminar el socio. Intentá de nuevo.");
      setPidiendoConfirmacion(false);
      setEliminando(false);
    }
  }

  return (
    <>
      <Modal titulo={`${socio.nombre} ${socio.apellido}`} onCerrar={onCerrar} ancho="600px">
        <div className="socio-detalle">
          <div className="socio-detalle-foto">
            {socio.foto ? (
              <img src={socio.foto} alt="" />
            ) : (
              <span>{`${socio.nombre[0] ?? ""}${socio.apellido[0] ?? ""}`.toUpperCase()}</span>
            )}
          </div>

          <dl className="socio-detalle-datos">
            <div>
              <dt>DNI</dt>
              <dd>{socio.dni}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>{socio.telefono || "—"}</dd>
            </div>
            <div>
              <dt>Gmail</dt>
              <dd>{socio.email || "—"}</dd>
            </div>
            <div>
              <dt>Socio desde</dt>
              <dd>{socio.fechaAlta || "—"}</dd>
            </div>
          </dl>

          {socio.nota && (
            <div className="socio-detalle-nota">
              <h3>Nota</h3>
              <p>{socio.nota}</p>
            </div>
          )}

          <h3>Historial de pagos</h3>
          {pagosDelSocio.length === 0 ? (
            <p className="socio-detalle-vacio">Todavía no hay pagos registrados.</p>
          ) : (
            <ul className="socio-detalle-pagos">
              {pagosDelSocio.map((p) => (
                <li key={p.id} className={`pago-chip pago-chip-${p.estado}`}>
                  <span>{p.fecha}</span>
                  <span>${p.monto.toLocaleString("es-AR")}</span>
                  <span>{etiquetaEstado(p.estado)}</span>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="socio-detalle-error" role="alert">
              {error}
            </p>
          )}

          <div className="socio-detalle-acciones">
            <button className="btn btn-secundario" onClick={onCerrar}>
              Cerrar
            </button>
            <button className="btn btn-secundario" onClick={() => onEditar(socio)}>
              Editar Socio
            </button>
            <button
              className="btn confirmar-boton-peligro"
              onClick={() => setPidiendoConfirmacion(true)}
            >
              Eliminar Socio
            </button>
          </div>
        </div>
      </Modal>

      {pidiendoConfirmacion && (
        <ConfirmarModal
          titulo="Eliminar Socio"
          mensaje={`¿Seguro que querés eliminar a ${socio.nombre} ${socio.apellido}? Esta acción no se puede deshacer.`}
          textoConfirmar="Sí, eliminar"
          onCerrar={() => setPidiendoConfirmacion(false)}
          onConfirmar={confirmarEliminar}
        />
      )}
    </>
  );
}

function etiquetaEstado(estado) {
  if (estado === "registrado") return "Pagado";
  if (estado === "pendiente") return "Vencido";
  return "Próximo";
}
