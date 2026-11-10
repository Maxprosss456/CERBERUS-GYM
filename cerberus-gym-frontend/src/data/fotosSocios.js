import supabase from "./supabaseClient.js";

const TIPOS_PERMITIDOS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function subirFotoSocio(archivo) {
  if (!(archivo instanceof File)) return archivo;

  if (!TIPOS_PERMITIDOS[archivo.type]) {
    throw new Error("Formato de imagen no permitido.");
  }

  if (archivo.size > 2 * 1024 * 1024) {
    throw new Error("La imagen no puede superar los 2 MB.");
  }

  const extension = TIPOS_PERMITIDOS[archivo.type];
  const ruta = `fotos/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from("socios")
    .upload(ruta, archivo, {
      contentType: archivo.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("socios")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function eliminarFotoSocio(url) {
  console.log("URL recibida para eliminar:", url);

  if (!url) {
    console.log("No se recibió ninguna URL.");
    return;
  }

  const rutaBase = "/storage/v1/object/public/socios/";

  try {
    const rutaUrl = new URL(url);
    const indice = rutaUrl.pathname.indexOf(rutaBase);

    console.log("Ruta de la URL:", rutaUrl.pathname);
    console.log("Índice de la ruta base:", indice);

    if (indice === -1) {
      console.log("No se encontró la ruta del bucket.");
      return;
    }

    const ruta = decodeURIComponent(
      rutaUrl.pathname.substring(indice + rutaBase.length)
    );

    console.log("Archivo que se intentará eliminar:", ruta);

    const { data, error } = await supabase.storage
      .from("socios")
      .remove([ruta]);

    console.log("Resultado de eliminación:", data);
    console.log("Error de eliminación:", error);

    if (error) throw error;

    console.log("Foto eliminada correctamente.");

  } catch (error) {
    console.error("Error al eliminar la foto anterior:", error);
  }
}