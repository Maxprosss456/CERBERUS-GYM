const API_URL = import.meta.env.VITE_API_URL;

export async function api(ruta, { metodo = "GET", cuerpo } = {}) {
  const res = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const datos = await res.json();
      mensaje = datos.error ?? mensaje;
    } catch {
      /* la respuesta no era JSON */
    }
    throw new Error(mensaje);
  }

  return res.status === 204 ? null : res.json();
}