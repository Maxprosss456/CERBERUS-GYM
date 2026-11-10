import { api } from "./api.js";
import { subirFotoSocio, eliminarFotoSocio } from "./fotosSocios.js";

export function obtenerSocios() {
  return api("/socios");
}

export async function crearSocio(nuevoSocio) {
  const foto = nuevoSocio.foto
    ? await subirFotoSocio(nuevoSocio.foto)
    : null;

  return api("/socios", {
    metodo: "POST",
    cuerpo: { ...nuevoSocio, foto },
  });
}

export async function actualizarSocio(id, cambios) {
  const socioAnterior = await api(`/socios/${id}`);

  console.log("Socio anterior:", socioAnterior);
  console.log("Foto anterior:", socioAnterior.foto);

  const fotoAnterior = socioAnterior.foto;

  const fotoNueva = cambios.foto instanceof File
    ? await subirFotoSocio(cambios.foto)
    : cambios.foto;

  console.log("Foto nueva:", fotoNueva);

  const resultado = await api(`/socios/${id}`, {
    metodo: "PATCH",
    cuerpo: { ...cambios, foto: fotoNueva },
  });

  if (fotoAnterior && fotoAnterior !== fotoNueva) {
    console.log("Intentando eliminar foto anterior...");
    await eliminarFotoSocio(fotoAnterior);
  }

  return resultado;
}

export function eliminarSocio(id) {
  return api(`/socios/${id}`, { metodo: "DELETE" });
}