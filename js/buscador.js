export function filtrarNegocios(negocios, filtros = {}) {
  const texto = (filtros.texto || "").trim().toLocaleLowerCase("es");
  const categoria = (filtros.categoria || "").toLocaleLowerCase("es");
  const distrito = (filtros.distrito || "").trim().toLocaleLowerCase("es");
  return negocios.filter((negocio) => {
    const coincideTexto = !texto || [negocio.nombre, negocio.categoria, negocio.distrito, negocio.ciudad, negocio.descripcion]
      .some((valor) => String(valor || "").toLocaleLowerCase("es").includes(texto));
    return coincideTexto &&
      (!categoria || negocio.categoria.toLocaleLowerCase("es") === categoria) &&
      (!distrito || negocio.distrito.toLocaleLowerCase("es").includes(distrito));
  });
}
