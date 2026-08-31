import Modal from "../Modal.jsx";
import { formatoFechaLarga } from "../../utils/fechas.js";
import "./Calendario.css";

const TEXTOS = {
  pendiente: (nombre) => `Venció el pago de "${nombre}"`,
  proximo: (nombre) => `Está por vencer el pago de "${nombre}"`,
  aviso: (nombre) => `Vencimiento programado de "${nombre}"`,
  registrado: (nombre) => `Pago registrado de "${nombre}"`,
};

export default function DiaDetalleModal({ fecha, pagos, socioPorId, onCerrar }) {
  return (
    <Modal titulo={formatoFechaLarga(fecha)} onCerrar={onCerrar} ancho="560px">
      <div className="dia-detalle-lista">
        {pagos.map((pago) => {
          const socio = socioPorId.get(pago.socioId);
          const nombre = socio ? `${socio.nombre} ${socio.apellido}` : "Socio eliminado";
          return (
            <div key={pago.id} className={`dia-detalle-item dia-detalle-item-${pago.estado}`}>
              {TEXTOS[pago.estado](nombre)}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}