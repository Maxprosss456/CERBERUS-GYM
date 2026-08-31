import { useState } from "react";
import "./Configuracion.css";
import { TAMANOS, guardarTamanoFuente, obtenerTamanoFuenteGuardado } from "../../utils/preferencias.js";

export default function Configuracion({ diasAnticipacion, onCambiarDiasAnticipacion }) {
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
          <span className="config-label">Días de anticipación para "Próximo"</span>
          <div className="config-dias-anticipacion">
            <input
              type="number"
              min={1}
              max={60}
              value={diasAnticipacion}
              onChange={(e) => onCambiarDiasAnticipacion(Number(e.target.value) || 1)}
              className="config-input-numero"
            />
            <p className="config-drive-texto">
              Un pago se muestra como "Próximo" (amarillo) recién quedando esta cantidad de días
              para el vencimiento. Antes de eso se muestra como "Aviso" (azul).
            </p>
          </div>
        </div>

        <div className="config-fila">
          <span className="config-label">Copia de Seguridad</span>
          <div className="config-drive">
            <button type="button" className="config-drive-boton" disabled>
              <svg className="config-drive-icono" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.71 3.5L1.15 15l3.43 6L11.14 9.5z" fill="#0F9D58" />
                <path d="M16.29 3.5H7.71L14.57 15h8.58z" fill="#FFCF44" />
                <path d="M22.85 15l-3.43 6H8.14l3.43-6z" fill="#4285F4" />
              </svg>
              Conectar con Google Drive
            </button>
            <p className="config-drive-texto">
              Guardado / carga de socios con Drive (conexión a implementar por el equipo de back-end).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}