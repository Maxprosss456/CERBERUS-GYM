import { useEffect, useMemo, useState } from "react";
import Login from "./components/Login/Login.jsx";
import PanelLayout from "./components/Layout/PanelLayout.jsx";
import Socios from "./components/Socios/Socios.jsx";
import Pagos from "./components/Pagos/Pagos.jsx";
import Calendario from "./components/Calendario/Calendario.jsx";
import Configuracion from "./components/Configuracion/Configuracion.jsx";
import { crearSocio, obtenerSocios, actualizarSocio } from "./data/socios.js";
import { obtenerPagos, registrarPago, crearPago, deshacerPago, eliminarPago, armarPagoInicial, armarPagoSiguienteCiclo } from "./data/pagos.js";
import { resolverFechaVencimiento } from "./utils/fechas.js";
import { conEstadoCalculado } from "./utils/estadoPago.js";
import { obtenerDiasAnticipacionGuardado, guardarDiasAnticipacion, obtenerPrecioMensualidadGuardado, guardarPrecioMensualidad, } from "./utils/preferencias.js";

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [vistaActiva, setVistaActiva] = useState("socios");

  const [socios, setSocios] = useState([]);
  const [pagosBase, setPagosBase] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [diasAnticipacion, setDiasAnticipacion] = useState(obtenerDiasAnticipacionGuardado);
  const [precioMensualidad, setPrecioMensualidad] = useState(obtenerPrecioMensualidadGuardado);

  useEffect(() => {
    if (!autenticado) return;
    let activo = true;
    setCargando(true);
    Promise.all([obtenerSocios(), obtenerPagos()]).then(([sociosData, pagosData]) => {
      if (!activo) return;
      setSocios(sociosData);
      setPagosBase(pagosData);
      setCargando(false);
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

  function manejarCambiarDiasAnticipacion(dias) {
    setDiasAnticipacion(dias);
    guardarDiasAnticipacion(dias);
  }

  function manejarCambiarPrecioMensualidad(precio) {
    setPrecioMensualidad(precio);
    guardarPrecioMensualidad(precio);
  }

  async function manejarAgregarSocio(datosForm) {
    const nuevo = await crearSocio(datosForm);
    setSocios((prev) => [...prev, nuevo]);

    // Cada socio nuevo arranca con su primera cuota ya generada,
    // así aparece solo en Calendario/Pagos sin que nadie la cargue a mano.
    const pagoInicial = await crearPago(armarPagoInicial(nuevo, precioMensualidad));
    setPagosBase((prev) => [...prev, pagoInicial]);
  }

  async function manejarEditarSocio(id, cambios) {
    const actualizado = await actualizarSocio(id, cambios);
    setSocios((prev) => prev.map((s) => (s.id === id ? { ...s, ...actualizado } : s)));
  }

  function manejarEliminarSocio(id) {
    setSocios((prev) => prev.filter((s) => s.id !== id));
  }

  async function manejarRegistrarPago(id, metodo, partes = null) {
    const pagoAnterior = pagosBase.find((p) => p.id === id);
    const actualizado = await registrarPago(id, metodo, partes);
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
  async function manejarDeshacerPago(id) {
    const pago = pagosBase.find((p) => p.id === id);
    if (!pago || !pago.pagado) return;

    // Cuota del mes siguiente del mismo socio (la que se generó sola al pagar)
    const siguiente = pagosBase
      .filter((p) => p.socioId === pago.socioId && p.fecha > pago.fecha)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

    const idAEliminar = siguiente && !siguiente.pagado ? siguiente.id : null;

    const actualizado = await deshacerPago(id);
    if (idAEliminar) await eliminarPago(idAEliminar);

    setPagosBase((prev) =>
      prev
        .filter((p) => p.id !== idAEliminar)
        .map((p) => (p.id === id ? { ...p, ...actualizado } : p))
    );
  }

  if (!autenticado) {
    return <Login onIngresar={() => setAutenticado(true)} />;
  }

  return (
    <PanelLayout
      vistaActiva={vistaActiva}
      onCambiarVista={setVistaActiva}
      onSalir={() => setAutenticado(false)}
    >
      {cargando ? (
        <p className="app-cargando">Cargando datos…</p>
      ) : (
        <>
          {vistaActiva === "socios" && (
            <Socios
              socios={socios}
              pagos={pagos}
              onAgregarSocio={manejarAgregarSocio}
              onEditarSocio={manejarEditarSocio}
              onEliminarSocio={manejarEliminarSocio}
            />
          )}
          {vistaActiva === "pagos" && (
            <Pagos pagos={pagos} socios={socios} onRegistrarPago={manejarRegistrarPago} onDeshacerPago={manejarDeshacerPago} />
          )}
          {vistaActiva === "calendario" && <Calendario pagos={pagos} socios={socios} />}
          {vistaActiva === "configuracion" && (
            <Configuracion
              diasAnticipacion={diasAnticipacion}
              onCambiarDiasAnticipacion={manejarCambiarDiasAnticipacion}
              precioMensualidad={precioMensualidad}
              onCambiarPrecioMensualidad={manejarCambiarPrecioMensualidad}
            />
          )}
        </>
      )}
    </PanelLayout>
  );
}