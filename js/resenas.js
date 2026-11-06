import { obtenerResenas, guardarResenas } from "./almacenamiento.js";

function exigirCliente(usuario) {
  if (!usuario || usuario.tipo !== "cliente") throw new Error("Solo un cliente registrado puede gestionar reseñas.");
}

export function listarResenas(negocioId) {
  return obtenerResenas().filter((resena) => !negocioId || resena.negocioId === negocioId);
}

export function resenaDelCliente(usuario, negocioId) {
  exigirCliente(usuario);
  return obtenerResenas().find((resena) => resena.usuarioId === usuario.id && resena.negocioId === negocioId) || null;
}

export function promedioResenas(negocioId) {
  const resenas = listarResenas(negocioId);
  return resenas.length ? resenas.reduce((total, resena) => total + Number(resena.calificacion), 0) / resenas.length : 0;
}

export function guardarResena(usuario, negocioId, datos, resenaId = "") {
  exigirCliente(usuario);
  const calificacion = Number(datos.calificacion);
  const comentario = String(datos.comentario || "").trim();
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) throw new Error("Selecciona una calificación de 1 a 5 estrellas.");
  if (!comentario) throw new Error("Escribe un comentario para publicar tu reseña.");
  const resenas = obtenerResenas();
  const existente = resenaId
    ? resenas.find((resena) => resena.id === resenaId && resena.usuarioId === usuario.id && resena.negocioId === negocioId)
    : resenas.find((resena) => resena.usuarioId === usuario.id && resena.negocioId === negocioId);
  if (resenaId && !existente) throw new Error("No puedes editar una reseña que no te pertenece.");
  const resena = existente
    ? { ...existente, resenaId: existente.resenaId || existente.id, calificacion, comentario, actualizadoEn: new Date().toISOString() }
    : (() => {
      const id = crypto.randomUUID();
      return { id, resenaId: id, usuarioId: usuario.id, negocioId, calificacion, comentario, creadoEn: new Date().toISOString() };
    })();
  guardarResenas(existente ? resenas.map((actual) => actual.id === existente.id ? resena : actual) : [...resenas, resena]);
  return resena;
}

export function eliminarResena(usuario, resenaId) {
  exigirCliente(usuario);
  const resenas = obtenerResenas();
  const restantes = resenas.filter((resena) => !(resena.id === resenaId && resena.usuarioId === usuario.id));
  if (restantes.length === resenas.length) throw new Error("No puedes eliminar una reseña que no te pertenece.");
  guardarResenas(restantes);
}
