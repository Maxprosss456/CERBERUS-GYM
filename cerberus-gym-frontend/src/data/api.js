const API_URL = import.meta.env.VITE_API_URL;

export async function api(ruta, { metodo = "GET", cuerpo } = {}) {
  const token = sessionStorage.getItem("token");
  const headers = {};
  if (cuerpo) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });

  if (res.status === 401 && token) {
    window.dispatchEvent(new Event("sesion-expirada"));
  }

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