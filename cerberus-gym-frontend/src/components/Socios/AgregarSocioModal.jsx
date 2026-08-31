import { useRef, useState } from "react";
import Modal from "../Modal.jsx";
import "./Socios.css";

import { fechaLocalISO } from "../../utils/fechas.js";

const SOCIO_VACIO = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
  nota: "",
  foto: null,
  fechaAlta: fechaLocalISO(),
  diaPago: "",
  precioMensualidad: "",
};

/**
 * Formulario de alta / edición de socio.
 * Si se pasa `socioInicial`, el formulario arranca precargado y actúa
 * como edición (título y botón cambian solos); si no, es alta nueva.
 */
export default function AgregarSocioModal({ onCerrar, onGuardar, socioInicial }) {
  const esEdicion = Boolean(socioInicial);
  const [form, setForm] = useState(
    esEdicion ? { ...SOCIO_VACIO, ...socioInicial } : SOCIO_VACIO
  );
  const inputFotoRef = useRef(null);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function manejarCambioFoto(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (ev) => actualizarCampo("foto", ev.target.result);
    lector.readAsDataURL(archivo);
  }

  function manejarSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim() || !form.dni.trim()) {
      return; // Validación mínima; se puede reforzar cuando esté el backend.
    }
    onGuardar(form);
  }

  return (
    <Modal
      titulo={esEdicion ? "Editar Socio" : "Agregar Nuevo Socio"}
      onCerrar={onCerrar}
      ancho="680px"
    >
      <form className="socio-form" onSubmit={manejarSubmit}>
        <div className="socio-form-foto">
          <div className="socio-form-foto-circulo">
            {form.foto ? (
              <img src={form.foto} alt="" className="socio-form-foto-preview" />
            ) : (
              "Foto"
            )}
          </div>

          {/* Input real, completamente oculto — se dispara por código.
              Así evitamos el bug de navegador donde un <input type="file">
              superpuesto no hereda el cursor:pointer sobre su propio texto
              interno ("Sin archivos seleccionados"). */}
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            onChange={manejarCambioFoto}
            className="socio-form-foto-input-oculto"
          />
          <button
            type="button"
            className="btn btn-primario socio-form-foto-boton"
            onClick={() => inputFotoRef.current?.click()}
          >
            Seleccionar Foto
          </button>
        </div>

        <div className="socio-form-campos">
          <div className="socio-form-fila">
            <label>
              Nombre
              <input
                value={form.nombre}
                onChange={(e) => actualizarCampo("nombre", e.target.value)}
                placeholder="Ingrese el nombre"
              />
            </label>
            <label>
              Apellido
              <input
                value={form.apellido}
                onChange={(e) => actualizarCampo("apellido", e.target.value)}
                placeholder="Ingrese el apellido"
              />
            </label>
          </div>

          <div className="socio-form-fila">
            <label>
              DNI
              <input
                value={form.dni}
                onChange={(e) => actualizarCampo("dni", e.target.value)}
                placeholder="Ej: 48000000"
                inputMode="numeric"
              />
            </label>
            <label>
              Número de teléfono
              <input
                value={form.telefono}
                onChange={(e) => actualizarCampo("telefono", e.target.value)}
                placeholder="Ej: 1123456789"
                inputMode="tel"
              />
            </label>
          </div>

          <div className="socio-form-fila">
            <label>
              Gmail
              <input
                type="email"
                value={form.email}
                onChange={(e) => actualizarCampo("email", e.target.value)}
                placeholder="ejemplo@gmail.com"
              />
            </label>
            <label>
              Socio desde
              <input
                type="date"
                value={form.fechaAlta}
                onChange={(e) => actualizarCampo("fechaAlta", e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
            </label>
          </div>

          <div className="socio-form-fila">
            <label>
              Día de pago fijo (1-31)
              <input
                type="number"
                min={1}
                max={31}
                value={form.diaPago}
                onChange={(e) => actualizarCampo("diaPago", e.target.value)}
                placeholder="Ej: 25"
              />
            </label>
            <label>
              Precio de la mensualidad
              <input
                type="number"
                min={0}
                step={500}
                value={form.precioMensualidad}
                onChange={(e) => actualizarCampo("precioMensualidad", e.target.value)}
                placeholder="Ej: 15000"
              />
            </label>
          </div>

          <label className="socio-form-campo-ancho">
            Nota / Descripción del socio
            <textarea
              rows={3}
              value={form.nota}
              onChange={(e) => actualizarCampo("nota", e.target.value)}
              placeholder="Ingrese información relevante sobre el estado físico del socio, ejercicios que debe evitar, plan de entrenamiento, recomendaciones, etc."
            />
          </label>
        </div>

        <div className="socio-form-acciones">
          <button type="button" className="btn btn-secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario">
            {esEdicion ? "Guardar Cambios" : "Guardar Socio"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
