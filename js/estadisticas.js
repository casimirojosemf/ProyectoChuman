import { listarResenas } from "./resenas.js";
import { contarConsultas } from "./historial.js";

export function calcularEstadisticas(negocios) {
  const ids = new Set(negocios.map((negocio) => negocio.id));
  const resenas = listarResenas().filter((resena) => ids.has(resena.negocioId));
  const promedio = resenas.length
    ? resenas.reduce((total, resena) => total + Number(resena.calificacion), 0) / resenas.length
    : 0;
  return { negocios: negocios.length, resenas: resenas.length, promedio, consultas: contarConsultas([...ids]) };
}
