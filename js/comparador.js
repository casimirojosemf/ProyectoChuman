export function obtenerParComparacion(negocios, ids) {
  if (!Array.isArray(ids) || ids.length !== 2 || ids[0] === ids[1]) return [];
  const seleccionados = ids.map((id) => negocios.find((negocio) => negocio.id === id));
  return seleccionados.every(Boolean) ? seleccionados : [];
}
