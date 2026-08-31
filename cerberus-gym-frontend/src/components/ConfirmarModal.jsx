import Modal from "./Modal.jsx";
import "./Modales.css";

export default function ConfirmarModal({ titulo, mensaje, onCerrar, onConfirmar, textoConfirmar = "Confirmar" }) {
  return (
    <Modal titulo={titulo} onCerrar={onCerrar} ancho="440px">
      <p className="confirmar-mensaje">{mensaje}</p>
      <div className="confirmar-acciones">
        <button className="btn btn-secundario" onClick={onCerrar}>
          Cancelar
        </button>
        <button className="btn confirmar-boton-peligro" onClick={onConfirmar}>
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
