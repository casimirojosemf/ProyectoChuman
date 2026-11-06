const opciones = [
  ["dashboard", "⌂", "Inicio"], ["businesses", "▦", "Mis negocios"],
  ["create-business", "+", "Registrar negocio"], ["businesses", "✎", "Editar negocio"],
  ["promotions", "%", "Promociones"], ["received-reviews", "★", "Reseñas recibidas"],
  ["profile", "◉", "Mi perfil"]
];
export function crearMenuNegociante(vista) {
  return `<aside class="sidebar merchant-sidebar"><div class="sidebar-label">Panel de negocio</div><nav class="side-menu" aria-label="Menú del negociante">
    ${opciones.map(([id, icono, texto]) => `<button class="side-link ${vista === id ? "active" : ""}" data-view="${id}"><span class="side-icon">${icono}</span>${texto}</button>`).join("")}
    <button class="side-link logout" data-action="logout"><span class="side-icon">↪</span>Cerrar sesión</button>
  </nav></aside>`;
}
