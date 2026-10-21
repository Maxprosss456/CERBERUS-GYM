import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./PanelFlotante.css";

const MARGEN = 10;

/**
 * Panel flotante liviano (NO modal), renderizado en un Portal al <body>.
 *
 * `direccion` es la preferencia ("arriba" o "abajo"), pero el panel mide
 * su propio tamaño y, si de ese lado no entra en pantalla, se abre del
 * lado contrario. Si no entra de ningún lado, se acomoda dentro de la
 * ventana igual. Se recalcula en cada render, así que si cambia de
 * tamaño (ej. al pasar al formulario de pago mixto) se reacomoda solo.
 *
 * Se cierra con click afuera, Escape o el botón de cerrar (✕).
 * `anchorRef` es el ref del botón que lo abrió: el click sobre ese
 * botón se ignora acá porque el propio botón maneja el toggle.
 */
export default function PanelFlotante({
  anchorRef,
  onCerrar,
  children,
  className = "",
  direccion = "arriba",
}) {
  const panelRef = useRef(null);
  const [posicion, setPosicion] = useState(null);

  // Sin lista de dependencias a propósito (ver comentario de arriba).
  // setPosicion devuelve el mismo objeto si nada cambió, así que no hay bucle.
  useLayoutEffect(() => {
    function calcularPosicion() {
      const anchor = anchorRef?.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const rect = anchor.getBoundingClientRect();
      const alto = panel.offsetHeight;
      const ancho = panel.offsetWidth;

      const cabeArriba = rect.top - MARGEN >= alto;
      const cabeAbajo = window.innerHeight - rect.bottom - MARGEN >= alto;

      let abajo = direccion === "abajo";
      if (abajo && !cabeAbajo && cabeArriba) abajo = false;
      if (!abajo && !cabeArriba && cabeAbajo) abajo = true;

      let top = abajo ? rect.bottom + MARGEN : rect.top - MARGEN - alto;
      top = Math.max(MARGEN, Math.min(top, window.innerHeight - alto - MARGEN));

      let left = rect.right - ancho;
      left = Math.max(MARGEN, Math.min(left, window.innerWidth - ancho - MARGEN));

      setPosicion((prev) =>
        prev && prev.top === top && prev.left === left ? prev : { top, left }
      );
    }

    calcularPosicion();
    window.addEventListener("resize", calcularPosicion);
    window.addEventListener("scroll", calcularPosicion, true);
    return () => {
      window.removeEventListener("resize", calcularPosicion);
      window.removeEventListener("scroll", calcularPosicion, true);
    };
  });

  useEffect(() => {
    function manejarClickAfuera(e) {
      if (panelRef.current?.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      onCerrar();
    }
    function manejarEsc(e) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("mousedown", manejarClickAfuera);
    document.addEventListener("keydown", manejarEsc);
    return () => {
      document.removeEventListener("mousedown", manejarClickAfuera);
      document.removeEventListener("keydown", manejarEsc);
    };
  }, [anchorRef, onCerrar]);

  return createPortal(
    <div
      className={`panel-flotante ${className}`}
      ref={panelRef}
      style={{
        top: posicion?.top ?? 0,
        left: posicion?.left ?? 0,
        transform: "none",
        visibility: posicion ? "visible" : "hidden",
      }}
    >
      <button className="panel-flotante-cerrar" onClick={onCerrar} aria-label="Cerrar">
        ✕
      </button>
      {children}
    </div>,
    document.body
  );
}