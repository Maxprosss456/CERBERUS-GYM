import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./PanelFlotante.css";

/**
 * Panel flotante liviano (NO modal): sin fondo oscuro, se renderiza en
 * un Portal directo al <body> para no quedar "encerrado" por ningún
 * contenedor con overflow:hidden (ej. .pagos-lista) — así siempre
 * queda por encima de todo, sin pelear con z-index locales.
 *
 * `direccion`:
 *  - "arriba" (default): se ancla arriba del elemento que lo abre.
 *  - "abajo": se ancla debajo. Usar cuando el disparador está muy
 *    cerca del borde superior de la pantalla (ej. la toolbar) y no
 *    hay lugar para abrir hacia arriba.
 *
 * Se cierra con click afuera, Escape o el botón de cerrar (✕).
 * `anchorRef` es el ref del botón que lo abrió: el click sobre ese
 * botón se ignora acá a propósito, porque el propio botón ya maneja
 * el toggle (abrir/cerrar) en su onClick.
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

  useLayoutEffect(() => {
    function calcularPosicion() {
      const anchor = anchorRef?.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      if (direccion === "abajo") {
        // Debajo del botón, alineado por su borde derecho.
        setPosicion({ top: rect.bottom + 10, left: rect.right });
      } else {
        // Arriba del botón (comportamiento original).
        setPosicion({ top: rect.top - 10, left: rect.right });
      }
    }
    calcularPosicion();
    window.addEventListener("resize", calcularPosicion);
    window.addEventListener("scroll", calcularPosicion, true);
    return () => {
      window.removeEventListener("resize", calcularPosicion);
      window.removeEventListener("scroll", calcularPosicion, true);
    };
  }, [anchorRef, direccion]);

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

  if (!posicion) return null;

  const transform = direccion === "abajo" ? "translate(-100%, 0)" : "translate(-100%, -100%)";

  return createPortal(
    <div
      className={`panel-flotante ${className}`}
      ref={panelRef}
      style={{ top: posicion.top, left: posicion.left, transform }}
    >
      <button className="panel-flotante-cerrar" onClick={onCerrar} aria-label="Cerrar">
        ✕
      </button>
      {children}
    </div>,
    document.body
  );
}