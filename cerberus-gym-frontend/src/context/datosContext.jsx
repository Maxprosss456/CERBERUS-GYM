import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { usePreferencias } from "./preferenciasContext.jsx";
import { crearSocio, obtenerSocios, actualizarSocio, eliminarSocio as eliminarSocioApi } from "../data/socios.js";
import {obtenerPagos, registrarPago as registrarPagoApi, deshacerPago as deshacerPagoApi} from "../data/pagos.js";
import { registrarBaja } from "../utils/bajas.js";
import { conEstadoCalculado } from "../utils/estadoPago.js";
import { fechaLocalISO } from "../utils/fechas.js";

const datosContext = createContext(null);

export function DatosProvider({ children }) {
  const { autenticado } = useAuth();
  const { diasAnticipacion} = usePreferencias();

  const [socios, setSocios] = useState([]);
  const [pagosBase, setPagosBase] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function recargar() {
  setCargando(true);
  setError(null);

  try {
    const [sociosData, pagosData] = await Promise.all([
      obtenerSocios(),
      obtenerPagos()
    ]);

    setSocios(sociosData);
    setPagosBase(pagosData);
  } catch (error) {
    setError("No se pudieron cargar los datos.");
    throw error;
  } finally {
    setCargando(false);
  }
}

  useEffect(() => {
    if (!autenticado) return;

    recargar().catch(() => {});

  }, [autenticado]);

  const pagos = useMemo(
    () => conEstadoCalculado(pagosBase, new Date(), diasAnticipacion),
    [pagosBase, diasAnticipacion]
  );

  async function agregarSocio(datosForm) {
    await crearSocio(datosForm);
    await recargar();
  }

  async function editarSocio(id, cambios) {
    const actualizado = await actualizarSocio(id, cambios);
    setSocios((prev) => prev.map((s) => (s.id === id ? { ...s, ...actualizado } : s)));
  }

  async function eliminarSocio(id) {
    await eliminarSocioApi(id);
    registrarBaja(id, fechaLocalISO());

    setSocios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activo: false } : s))
    );

    setPagosBase((prev) =>
      prev.filter((p) => p.id_socio !== id || p.pagado)
    );
  }

  async function registrarPago(id, metodo, partes = null) {
    await registrarPagoApi(id, metodo, partes);
    await recargar();
  }

  async function deshacerPago(id) {
    await deshacerPagoApi(id);
    await recargar();
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