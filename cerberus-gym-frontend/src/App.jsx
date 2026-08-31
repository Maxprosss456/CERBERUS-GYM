import { useEffect, useMemo, useState } from "react";
import Login from "./components/Login/Login.jsx";
import PanelLayout from "./components/Layout/PanelLayout.jsx";
import Socios from "./components/Socios/Socios.jsx";
import Pagos from "./components/Pagos/Pagos.jsx";
import Calendario from "./components/Calendario/Calendario.jsx";
import Configuracion from "./components/Configuracion/Configuracion.jsx";
import { crearSocio, obtenerSocios, actualizarSocio } from "./data/socios.js";
import { obtenerPagos, registrarPago } from "./data/pagos.js";
import { resolverFechaVencimiento } from "./utils/fechas.js";
import { conEstadoCalculado } from "./utils/estadoPago.js";
import { obtenerDiasAnticipacionGuardado, guardarDiasAnticipacion } from "./utils/preferencias.js";

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [vistaActiva, setVistaActiva] = useState("socios");

  const [socios, setSocios] = useState([]);
  const [pagosBase, setPagosBase] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [diasAnticipacion, setDiasAnticipacion] = useState(obtenerDiasAnticipacionGuardado);

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

  async function manejarAgregarSocio(datosForm) {
    const nuevo = await crearSocio(datosForm);
    setSocios((prev) => [...prev, nuevo]);
  }

  async function manejarEditarSocio(id, cambios) {
    const actualizado = await actualizarSocio(id, cambios);
    setSocios((prev) => prev.map((s) => (s.id === id ? { ...s, ...actualizado } : s)));
  }

  function manejarEliminarSocio(id) {
    setSocios((prev) => prev.filter((s) => s.id !== id));
  }

  async function manejarRegistrarPago(id, metodo) {
    const actualizado = await registrarPago(id, metodo);
    setPagosBase((prev) => prev.map((p) => (p.id === id ? { ...p, ...actualizado } : p)));
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
            <Pagos pagos={pagos} socios={socios} onRegistrarPago={manejarRegistrarPago} />
          )}
          {vistaActiva === "calendario" && <Calendario pagos={pagos} socios={socios} />}
          {vistaActiva === "configuracion" && (
            <Configuracion
              diasAnticipacion={diasAnticipacion}
              onCambiarDiasAnticipacion={manejarCambiarDiasAnticipacion}
            />
          )}
        </>
      )}
    </PanelLayout>
  );
}