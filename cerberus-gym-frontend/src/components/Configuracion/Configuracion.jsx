import { useState } from "react";
import "./Configuracion.css";
import { TAMANOS, guardarTamanoFuente, obtenerTamanoFuenteGuardado } from "../../utils/preferencias.js";
import { usePreferencias } from "../../context/preferenciasContext.jsx";

export default function Configuracion() {
  const {
    diasAnticipacion,
    cambiarDiasAnticipacion,
    precioMensualidad,
    cambiarPrecioMensualidad,
  } = usePreferencias();

  const [tamanoFuente, setTamanoFuente] = useState(obtenerTamanoFuenteGuardado);

  function manejarCambioTamano(indice) {
    setTamanoFuente(indice);
    guardarTamanoFuente(indice);
  }

  return (
    <div className="config-vista">
      <h2 className="config-titulo">Preferencias de Interfaz</h2>

      <div className="config-panel">
        <div className="config-fila">
          <span className="config-label">Tamaño de Fuente / Accesibilidad</span>
          <div className="config-slider">
            <input
              type="range"
              min={0}
              max={2}
              value={tamanoFuente}
              onChange={(e) => manejarCambioTamano(Number(e.target.value))}
              aria-label="Tamaño de fuente"
            />
            <div className="config-slider-etiquetas">
              {TAMANOS.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="config-fila">
          <span className="config-label">Precio de la mensualidad</span>
          <div className="config-dias-anticipacion">
            <input
              type="number"
              min={0}
              step={500}
              value={precioMensualidad}
              onChange={(e) => cambiarPrecioMensualidad(Number(e.target.value) || 0)}
              className="config-input-numero"
            />
            <p className="config-drive-texto">
              Este es el precio único que se cobra a todos los socios. Si lo cambiás, los pagos
              ya generados NO se modifican (mantienen el monto con el que se crearon); el precio
              nuevo se aplica recién a partir del próximo ciclo de cada socio.
            </p>
          </div>
        </div>

        <div className="config-fila">
          <span className="config-label">Días de anticipación para "Próximo"</span>
          <div className="config-dias-anticipacion">
            <input
              type="number"
              min={1}
              max={60}
              value={diasAnticipacion}
              onChange={(e) => cambiarDiasAnticipacion(Number(e.target.value) || 1)}
              className="config-input-numero"
            />
            <p className="config-drive-texto">
              Un pago se muestra como "Próximo" (amarillo) recién quedando esta cantidad de días
              para el vencimiento. Antes de eso se muestra como "Aviso" (azul).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}