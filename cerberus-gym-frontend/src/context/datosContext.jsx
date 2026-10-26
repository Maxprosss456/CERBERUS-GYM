import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { usePreferencias } from "./preferenciasContext.jsx";
import { crearSocio, obtenerSocios, actualizarSocio, eliminarSocio as eliminarSocioApi } from "../data/socios.js";
import {
  obtenerPagos,
  registrarPago as registrarPagoApi,
  crearPago,
  deshacerPago as deshacerPagoApi,
  eliminarPago,
  armarPagoInicial,
  armarPagoSiguienteCiclo,
} from "../data/pagos.js";
import { resolverFechaVencimiento } from "../utils/fechas.js";
import { conEstadoCalculado } from "../utils/estadoPago.js";

const datosContext = createContext(null);

export function DatosProvider({ children }) {
  const { autenticado } = useAuth();
  const { diasAnticipacion, precioMensualidad } = usePreferencias();

  const [socios, setSocios] = useState([]);
  const [pagosBase, setPagosBase] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!autenticado) return;
    let activo = true;
    setCargando(true);
    setError(null);

    Promise.all([obtenerSocios(), obtenerPagos()])
      .then(([sociosData, pagosData]) => {
        if (!activo) return;
        setSocios(sociosData);
        setPagosBase(pagosData);
      })
      .catch(() => {
        if (activo) setError("No se pudieron cargar los datos.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [autenticado]);

  const pagosConFecha = useMemo(() => {
    const socioPorId = new Map(socios.map((s) => [s.id, s]));
    return pagosBase.map((pago) => ({
      ...pago,
      fecha: resolverFechaVencimiento(pago, socioPorId.get(pago.socioId)),
    }));
  }, [pagosBase, socios]);

  const pagos = useMemo(
    () => conEstadoCalculado(pagosConFecha, new Date(), diasAnticipacion),
    [pagosConFecha, diasAnticipacion]
  );

  async function agregarSocio(datosForm) {
    const nuevo = await crearSocio(datosForm);
    setSocios((prev) => [...prev, nuevo]);

    // Cada socio nuevo arranca con su primera cuota ya generada,
    // así aparece solo en Calendario/Pagos sin que nadie la cargue a mano.
    const pagoInicial = await crearPago(armarPagoInicial(nuevo, precioMensualidad));
    setPagosBase((prev) => [...prev, pagoInicial]);
  }

  async function editarSocio(id, cambios) {
    const actualizado = await actualizarSocio(id, cambios);
    setSocios((prev) => prev.map((s) => (s.id === id ? { ...s, ...actualizado } : s)));
  }

  async function eliminarSocio(id) {
    await eliminarSocioApi(id);
    setSocios((prev) => prev.filter((s) => s.id !== id));
    setPagosBase((prev) => prev.filter((p) => p.socioId !== id));
  }

  async function registrarPago(id, metodo, partes = null) {
    const pagoAnterior = pagosBase.find((p) => p.id === id);
    const actualizado = await registrarPagoApi(id, metodo, partes);
    setPagosBase((prev) => prev.map((p) => (p.id === id ? { ...p, ...actualizado } : p)));

    // Solo generamos el ciclo siguiente la PRIMERA vez que se marca como
    // pagado. Si ya estaba pagado y esto vino de "Modificar" en Registros
    // (corregir el método), no hay que generar una cuota de más.
    if (pagoAnterior && !pagoAnterior.pagado) {
      const socio = socios.find((s) => s.id === pagoAnterior.socioId);
      if (socio) {
        const pagoSiguiente = await crearPago(
          armarPagoSiguienteCiclo({ ...pagoAnterior, ...actualizado }, socio, precioMensualidad)
        );
        setPagosBase((prev) => [...prev, pagoSiguiente]);
      }
    }
  }

  async function deshacerPago(id) {
    const pago = pagosBase.find((p) => p.id === id);
    if (!pago || !pago.pagado) return;

    // Cuota del mes siguiente del mismo socio (la que se generó sola al pagar)
    const siguiente = pagosBase
      .filter((p) => p.socioId === pago.socioId && p.fecha > pago.fecha)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

    const idAEliminar = siguiente && !siguiente.pagado ? siguiente.id : null;

    const actualizado = await deshacerPagoApi(id);
    if (idAEliminar) await eliminarPago(idAEliminar);

    setPagosBase((prev) =>
      prev
        .filter((p) => p.id !== idAEliminar)
        .map((p) => (p.id === id ? { ...p, ...actualizado } : p))
    );
  }

  return (
    <datosContext.Provider
      value={{
        socios,
        pagos,
        cargando,
        error,
        agregarSocio,
        editarSocio,
        eliminarSocio,
        registrarPago,
        deshacerPago,
      }}
    >
      {children}
    </datosContext.Provider>
  );
}

export function useDatos() {
  const ctx = useContext(datosContext);
  if (!ctx) throw new Error("useDatos debe usarse dentro de DatosProvider");
  return ctx;
}