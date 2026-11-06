import { obtenerHistorial, guardarHistorial } from "./almacenamiento.js";

export function registrarConsulta(usuarioId, negocioId) {
  const visitas = obtenerHistorial();
  guardarHistorial([...visitas, { id: crypto.randomUUID(), usuarioId: usuarioId || null, negocioId, visitadoEn: new Date().toISOString() }]);
}

export function listarHistorial(usuario) {
  if (!usuario || usuario.tipo !== "cliente") throw new Error("Inicia sesión como cliente para consultar tu historial.");
  const porNegocio = new Map();
  obtenerHistorial()
    .filter((visita) => visita.usuarioId === usuario.id)
    .sort((a, b) => b.visitadoEn.localeCompare(a.visitadoEn))
    .forEach((visita) => { if (!porNegocio.has(visita.negocioId)) porNegocio.set(visita.negocioId, visita); });
  return [...porNegocio.values()];
}

export function limpiarHistorial(usuario) {
  if (!usuario || usuario.tipo !== "cliente") throw new Error("Inicia sesión como cliente para limpiar tu historial.");
  guardarHistorial(obtenerHistorial().filter((visita) => visita.usuarioId !== usuario.id));
}

export function contarConsultas(negocioIds) {
  const ids = new Set(negocioIds);
  return obtenerHistorial().filter((visita) => ids.has(visita.negocioId)).length;
}
