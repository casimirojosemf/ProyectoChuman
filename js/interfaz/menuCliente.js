const opciones = [
  ["home-client", "⌂", "Inicio"], ["explore", "⌕", "Explorar negocios"],
  ["categories", "▦", "Categorías"], ["search", "⌕", "Buscar negocios"],
  ["favorites", "♡", "Mis favoritos"], ["my-reviews", "★", "Mis reseñas"],
  ["compare", "⇄", "Comparar negocios"], ["history", "◷", "Mi historial"],
  ["promotions", "%", "Promociones"], ["profile", "◉", "Mi perfil"]
];
export function crearMenuCliente(vista) {
  return `<aside class="sidebar client-sidebar"><div class="sidebar-label">Descubre tu ciudad</div><nav class="side-menu" aria-label="Menú del buscador">
    ${opciones.map(([id, icono, texto]) => `<button class="side-link ${vista === id ? "active" : ""}" data-view="${id}"><span class="side-icon">${icono}</span>${texto}</button>`).join("")}
    <button class="side-link logout" data-action="home"><span class="side-icon">↩</span>Volver al inicio</button>
  </nav></aside>`;
}
