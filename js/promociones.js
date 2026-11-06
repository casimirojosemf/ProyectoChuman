import { obtenerNegocios, obtenerPromociones, guardarPromociones } from "./almacenamiento.js";

function exigirPropiedad(usuario, negocioId) {
  if (!usuario || usuario.tipo !== "negociante") throw new Error("Inicia sesión como negociante para gestionar promociones.");
  if (!obtenerNegocios().some((negocio) => negocio.id === negocioId && negocio.propietarioId === usuario.id)) {
    throw new Error("Solo puedes gestionar promociones de tus propios negocios.");
  }
}

function validar(datos) {
  if (!String(datos.titulo || "").trim()) throw new Error("Ingresa el título de la promoción.");
  if (!String(datos.descripcion || "").trim()) throw new Error("Ingresa la descripción de la promoción.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaVencimiento) || datos.fechaVencimiento < fechaActualLocal()) {
    throw new Error("La fecha de vencimiento debe ser hoy o una fecha futura.");
  }
}

export function listarPromociones({ activas = false, propietarioId = "" } = {}) {
  return obtenerPromociones().filter((promocion) =>
    (!propietarioId || promocion.propietarioId === propietarioId) &&
    (!activas || promocion.fechaVencimiento >= fechaActualLocal())
  );
}

export function fechaActualLocal() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

export function guardarPromocion(usuario, datos, promocionId = "") {
  exigirPropiedad(usuario, datos.negocioId);
  validar(datos);
  const promociones = obtenerPromociones();
  const existente = promocionId
    ? promociones.find((promocion) => promocion.id === promocionId && promocion.propietarioId === usuario.id)
    : null;
  if (promocionId && !existente) throw new Error("No puedes editar una promoción de otro propietario.");
  const promocion = existente
    ? { ...existente, promocionId: existente.promocionId || existente.id, ...datos, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim() }
    : (() => {
      const id = crypto.randomUUID();
      return { ...datos, id, promocionId: id, propietarioId: usuario.id, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim(), creadoEn: new Date().toISOString() };
    })();
  guardarPromociones(existente ? promociones.map((actual) => actual.id === existente.id ? promocion : actual) : [...promociones, promocion]);
  return promocion;
}

export function eliminarPromocion(usuario, promocionId) {
  if (!usuario || usuario.tipo !== "negociante") throw new Error("Inicia sesión como negociante para gestionar promociones.");
  const promociones = obtenerPromociones();
  const restantes = promociones.filter((promocion) => !(promocion.id === promocionId && promocion.propietarioId === usuario.id));
  if (restantes.length === promociones.length) throw new Error("No puedes eliminar una promoción de otro propietario.");
  guardarPromociones(restantes);
}
