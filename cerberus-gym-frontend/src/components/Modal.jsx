import { useEffect, useRef, useState } from "react";
import "./Modales.css";

export default function Modal({ titulo, onCerrar, children, ancho = "620px" }) {
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const arrastreRef = useRef(null); // { inicioX, inicioY, posInicial }

  useEffect(() => {
    function manejarEsc(e) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", manejarEsc);
    return () => document.removeEventListener("keydown", manejarEsc);
  }, [onCerrar]);

  function iniciarArrastre(e) {
    // Solo arrastra si el mousedown fue directo sobre el header
    // (no sobre el botón de cerrar).
    if (e.target.closest(".modal-cerrar")) return;
    arrastreRef.current = {
      inicioX: e.clientX,
      inicioY: e.clientY,
      posInicial: posicion,
    };
    document.addEventListener("mousemove", moverDurante);
    document.addEventListener("mouseup", terminarArrastre);
  }

  function moverDurante(e) {
    if (!arrastreRef.current) return;
    const { inicioX, inicioY, posInicial } = arrastreRef.current;
    setPosicion({
      x: posInicial.x + (e.clientX - inicioX),
      y: posInicial.y + (e.clientY - inicioY),
    });
  }

  function terminarArrastre() {
    arrastreRef.current = null;
    document.removeEventListener("mousemove", moverDurante);
    document.removeEventListener("mouseup", terminarArrastre);
  }

  return (
    <div className="modal-fondo" onMouseDown={onCerrar}>
      <div
        className="modal-caja"
        style={{
          maxWidth: ancho,
          transform: `translate(${posicion.x}px, ${posicion.y}px)`,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header modal-header-arrastrable" onMouseDown={iniciarArrastre}>
          <h2 className="modal-titulo">{titulo}</h2>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
