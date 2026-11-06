import {
  obtenerNegocios, guardarNegocios, obtenerFavoritos, guardarFavoritos,
  obtenerResenas, guardarResenas, obtenerPromociones, guardarPromociones,
  obtenerHistorial, guardarHistorial
} from "./almacenamiento.js";

export const categorias = ["abarrotes", "restaurantes", "farmacias", "ferreterías", "librerías", "ropa", "otros"];

export function validarNegocio(datos) {
  const errores = {};
  ["nombre", "categoria", "descripcion", "direccion", "distrito", "ciudad", "horario", "whatsapp"].forEach((campo) => {
    if (!String(datos[campo] || "").trim()) errores[campo] = "Este campo es obligatorio.";
  });
  if (datos.whatsapp && !/^\d{9,15}$/.test(datos.whatsapp.replace(/\D/g, ""))) errores.whatsapp = "Ingresa un número válido (9 a 15 dígitos).";
  if (!["abierto", "cerrado"].includes(datos.estado)) errores.estado = "Selecciona el estado del negocio.";
  if (datos.imagen && !/^https?:\/\/.+/i.test(datos.imagen)) errores.imagen = "Ingresa una URL de imagen válida (http o https).";
  return errores;
}

export function registrarNegocio(datos, propietarioId) {
  const negocio = { ...datos, id: crypto.randomUUID(), propietarioId };
  guardarNegocios([...obtenerNegocios(), negocio]);
  return negocio;
}

export function actualizarNegocio(id, propietarioId, cambios) {
  const negocios = obtenerNegocios();
  const indice = negocios.findIndex((negocio) => negocio.id === id && negocio.propietarioId === propietarioId);
  if (indice < 0) throw new Error("No se encontró este negocio en tu panel.");
  negocios[indice] = { ...negocios[indice], ...cambios };
  guardarNegocios(negocios);
  return negocios[indice];
}

export function eliminarNegocio(id, propietarioId) {
  const negocios = obtenerNegocios();
  const restantes = negocios.filter((negocio) => !(negocio.id === id && negocio.propietarioId === propietarioId));
  if (restantes.length === negocios.length) throw new Error("No se encontró este negocio en tu panel.");
  guardarNegocios(restantes);
  guardarFavoritos(obtenerFavoritos().filter((favorito) => favorito.negocioId !== id));
  guardarResenas(obtenerResenas().filter((resena) => resena.negocioId !== id));
  guardarPromociones(obtenerPromociones().filter((promocion) => promocion.negocioId !== id));
  guardarHistorial(obtenerHistorial().filter((visita) => visita.negocioId !== id));
}

export const listarNegocios = () => obtenerNegocios();
export const listarNegociosPropietario = (id) => obtenerNegocios().filter((negocio) => negocio.propietarioId === id);
