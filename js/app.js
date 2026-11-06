import {
  inicializarDemo, obtenerUsuarios
} from "./almacenamiento.js";
import { camposUsuario, validarUsuario, registrarUsuario, iniciarSesion, obtenerUsuarioActual, actualizarPerfil, cerrarSesion } from "./usuarios.js";
import { categorias, validarNegocio, registrarNegocio, actualizarNegocio, eliminarNegocio, listarNegocios, listarNegociosPropietario } from "./negocios.js";
import { filtrarNegocios } from "./buscador.js";
import { listarFavoritos, alternarFavorito } from "./favoritos.js";
import { listarResenas, resenaDelCliente, promedioResenas, guardarResena, eliminarResena } from "./resenas.js";
import { listarHistorial, registrarConsulta, limpiarHistorial } from "./historial.js";
import { listarPromociones, guardarPromocion, eliminarPromocion, fechaActualLocal } from "./promociones.js";
import { obtenerParComparacion } from "./comparador.js";
import { calcularEstadisticas } from "./estadisticas.js";
import { crearMenuNegociante } from "./interfaz/menuNegociante.js";
import { crearMenuCliente } from "./interfaz/menuCliente.js";
import { notificar, confirmar } from "./interfaz/botones.js";

const app = document.querySelector("#app");
const topActions = document.querySelector("#topbar-actions");
const estado = { perfil: null, vista: "dashboard", negocioId: null, promocionId: null, compareIds: [], compareUserId: null, buscar: { texto: "", categoria: "", distrito: "" } };

inicializarDemo();
const usuarioSesion = obtenerUsuarioActual();
if (usuarioSesion) { estado.perfil = usuarioSesion.tipo; estado.vista = usuarioSesion.tipo === "negociante" ? "dashboard" : "home-client"; estado.compareUserId = usuarioSesion.tipo === "cliente" ? usuarioSesion.id : null; }
render();

function render() {
  renderTopbar();
  if (!estado.perfil) return renderBienvenida();
  if (estado.perfil === "negociante") renderNegociante();
  else renderCliente();
}

function renderTopbar() {
  const usuario = obtenerUsuarioActual();
  if (!estado.perfil) {
    topActions.innerHTML = `<button class="button ghost" data-action="login" data-role="negociante">Iniciar sesión</button>`;
  } else if (estado.perfil === "negociante") {
    topActions.innerHTML = `<span class="muted">Hola, ${escapar(usuario?.nombres || "negociante")}</span><button class="button ghost" data-action="logout">Salir</button>`;
  } else {
    topActions.innerHTML = `${usuario ? `<span class="muted">Hola, ${escapar(usuario.nombres)}</span>` : `<span class="muted">Explorando como visitante</span>`}<button class="button ghost" data-action="${usuario ? "logout" : "home"}">${usuario ? "Salir" : "Inicio"}</button>`;
  }
}

function renderBienvenida() {
  app.innerHTML = `<section class="welcome">
    <div class="hero"><span class="eyebrow">✦ Hecho para el comercio local</span>
      <h1>Tu ciudad tiene mucho <span>por descubrir.</span></h1>
      <p>Conecta con los negocios de tu barrio. Encuentra lo que necesitas o haz que más personas descubran tu negocio.</p>
    </div>
    <div class="profile-grid">
      <article class="profile-card"><div class="profile-icon" aria-hidden="true">▣</div><h2>Soy negociante</h2>
        <p>Registra tu negocio gratis y llega a nuevos clientes de tu ciudad.</p>
        <button class="button primary" data-action="register" data-role="negociante">Registrar mi negocio <span>→</span></button>
        <button class="button ghost" data-action="login" data-role="negociante">Ya tengo una cuenta</button>
      </article>
      <article class="profile-card client"><div class="profile-icon" aria-hidden="true">⌕</div><h2>Quiero buscar negocios</h2>
        <p>Explora establecimientos cerca de ti. Sin registrarte y sin complicaciones.</p>
        <button class="button primary" data-action="explore">Explorar negocios <span>→</span></button>
        <button class="button ghost" data-action="register" data-role="cliente">Crear cuenta de cliente</button>
        <button class="button ghost" data-action="login" data-role="cliente">Ya tengo cuenta de cliente</button>
      </article>
    </div><p class="welcome-note">Un directorio local para apoyar a los negocios de tu comunidad.</p>
  </section>`;
}

function renderAcceso(modo, tipo) {
  estado.perfil = null;
  const esRegistro = modo === "register";
  const titulo = esRegistro ? "Crea tu cuenta" : "Qué bueno verte de nuevo";
  const subtitulo = esRegistro ? "Únete a Conecta Local y empieza hoy." : "Ingresa con el correo o DNI de tu cuenta.";
  const campos = esRegistro
    ? `${camposUsuario.map(([nombre, etiqueta, tipoCampo]) => campoHTML(nombre, etiqueta, tipoCampo, "", nombre === "dni" ? 'maxlength="8" inputmode="numeric"' : nombre === "telefono" ? 'maxlength="9" inputmode="numeric"' : "")).join("")}
       <div class="form-field full"><label for="tipo">Tipo de usuario</label><select id="tipo" name="tipo"><option value="negociante" ${tipo === "negociante" ? "selected" : ""}>Negociante</option><option value="cliente" ${tipo === "cliente" ? "selected" : ""}>Cliente</option></select></div>`
    : `<div class="form-field full"><label for="identificador">Correo electrónico o DNI</label><input id="identificador" name="identificador" autocomplete="username" required placeholder="tu@correo.com o DNI"></div>
       <p class="field-hint form-field full">Prototipo sin contraseña. Prueba con maria@ejemplo.com o DNI 12345678 para el panel negociante.</p>`;
  app.innerHTML = `<section class="welcome"><div class="form-shell narrow">
    <button class="button ghost" data-action="home">← Volver</button><h1>${titulo}</h1><p>${subtitulo}</p>
    <form id="access-form" data-mode="${modo}" data-role="${tipo}" class="form-grid">${campos}
      <div class="form-footer form-field full"><button class="button primary" type="submit">${esRegistro ? "Crear cuenta" : "Iniciar sesión"}</button>
        <span class="muted">${esRegistro ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}
          <button type="button" class="inline-link" data-action="${esRegistro ? "login" : "register"}" data-role="${tipo}">${esRegistro ? "Inicia sesión" : "Regístrate"}</button></span></div>
    </form></div></section>`;
}

function renderNegociante() {
  const usuario = obtenerUsuarioActual();
  if (!usuario || usuario.tipo !== "negociante") { estado.perfil = null; return renderBienvenida(); }
  const negocios = listarNegociosPropietario(usuario.id);
  let contenido = "";
  if (estado.vista === "dashboard") {
    const estadisticas = calcularEstadisticas(negocios);
    contenido = `<div class="page-heading"><div><h1>¡Hola, ${escapar(usuario.nombres)}! 👋</h1><p>Este es el resumen de tus negocios.</p></div><button class="button primary" data-view="create-business">＋ Registrar negocio</button></div>
      <div class="stats-grid merchant-stats"><div class="stat-card"><span>Total de negocios</span><strong>${estadisticas.negocios}</strong></div><div class="stat-card"><span>Reseñas recibidas</span><strong>${estadisticas.resenas}</strong></div><div class="stat-card"><span>Promedio de calificación</span><strong>${estadisticas.promedio ? estadisticas.promedio.toFixed(1) : "—"}</strong></div><div class="stat-card"><span>Consultas de detalle</span><strong>${estadisticas.consultas}</strong></div></div>
      <h2 class="section-title">Tus establecimientos</h2>${renderTarjetas(negocios, true)}`;
  } else if (estado.vista === "businesses") {
    contenido = `<div class="page-heading"><div><h1>Mis negocios</h1><p>Administra cada uno de tus establecimientos.</p></div><button class="button primary" data-view="create-business">＋ Registrar negocio</button></div>${renderTarjetas(negocios, true)}`;
  } else if (estado.vista === "create-business" || estado.vista === "edit-business") {
    const editando = estado.vista === "edit-business";
    const negocio = editando ? negocios.find((n) => n.id === estado.negocioId) : null;
    contenido = negocio ? formularioNegocio(negocio) : formularioNegocio();
  } else if (estado.vista === "promotions" || estado.vista === "create-promotion" || estado.vista === "edit-promotion") {
    contenido = renderPromocionesNegociante(usuario, negocios);
  } else if (estado.vista === "received-reviews") {
    contenido = renderResenasNegociante(negocios);
  } else if (estado.vista === "profile") contenido = formularioPerfil(usuario);
  else if (estado.vista === "detail") contenido = renderDetalle(listarNegocios().find((n) => n.id === estado.negocioId));
  app.innerHTML = `<div class="workspace">${crearMenuNegociante(estado.vista)}<section class="workspace-content"><div class="content-wrap">${contenido}</div></section></div>`;
}

function renderCliente() {
  const vista = estado.vista;
  const usuario = obtenerUsuarioActual();
  const clienteRegistrado = usuario?.tipo === "cliente";
  let negocios = listarNegocios();
  let contenido = "";
  if (vista === "home-client" || vista === "explore" || vista === "categories" || vista === "search") {
    const titulo = vista === "home-client" ? "Negocios destacados" : vista === "categories" ? "Explora por categoría" : vista === "search" ? "Buscar negocios" : "Explora negocios";
    if (vista === "categories") contenido = `<div class="page-heading"><div><h1>${titulo}</h1><p>Elige una categoría para descubrir opciones.</p></div></div>
      <div class="category-pills">${categorias.map((cat) => `<button class="button secondary" data-category="${escapar(cat)}">${iconoCategoria(cat)} ${escapar(cat)}</button>`).join("")}</div>`;
    else {
      if (vista === "home-client") negocios = negocios.filter((n) => n.estado === "abierto");
      if (vista === "search" || vista === "explore") negocios = filtrarNegocios(negocios, estado.buscar);
      contenido = `<div class="page-heading"><div><h1>${titulo}</h1><p>${vista === "home-client" ? "Una selección de negocios abiertos para ti." : "Encuentra lo que buscas en tu ciudad."}</p></div></div>
        ${vista === "home-client" || vista === "explore" ? `<div class="filter-panel"><input name="texto" data-filter="texto" value="${escapar(estado.buscar.texto)}" placeholder="Nombre, categoría o palabra clave" aria-label="Buscar por nombre o categoría">
        <select name="categoria" data-filter="categoria" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option>${categorias.map((c) => `<option ${estado.buscar.categoria === c ? "selected" : ""} value="${escapar(c)}">${escapar(c)}</option>`).join("")}</select>
        <input name="distrito" data-filter="distrito" value="${escapar(estado.buscar.distrito)}" placeholder="Distrito" aria-label="Filtrar por distrito">
        <button class="button secondary" data-action="clear-filters">Limpiar</button></div>` : `<div class="filter-panel"><input name="texto" data-filter="texto" value="${escapar(estado.buscar.texto)}" placeholder="Nombre, categoría o ubicación" aria-label="Buscar negocios">
          <select name="categoria" data-filter="categoria" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option>${categorias.map((c) => `<option ${estado.buscar.categoria === c ? "selected" : ""} value="${escapar(c)}">${escapar(c)}</option>`).join("")}</select>
          <input name="distrito" data-filter="distrito" value="${escapar(estado.buscar.distrito)}" placeholder="Distrito" aria-label="Filtrar por distrito"><button class="button secondary" data-action="clear-filters">Limpiar</button></div>`}
        <p class="muted">${negocios.length} ${negocios.length === 1 ? "negocio encontrado" : "negocios encontrados"}</p>${renderTarjetas(negocios, false)}`;
    }
  } else if (vista === "favorites") {
    contenido = clienteRegistrado
      ? `<div class="page-heading"><div><h1>Mis favoritos</h1><p>Los negocios que guardaste para volver a encontrar.</p></div></div>${renderTarjetas(negocios.filter((n) => listarFavoritos(usuario).includes(n.id)), false)}`
      : accesoRequerido("Inicia sesión como cliente para guardar y consultar tus favoritos.");
  } else if (vista === "my-reviews") {
    contenido = clienteRegistrado ? renderMisResenas(usuario) : accesoRequerido("Regístrate o inicia sesión como cliente para gestionar tus reseñas.");
  } else if (vista === "compare") {
    contenido = clienteRegistrado ? renderComparador(negocios) : accesoRequerido("La comparación está disponible para clientes registrados.");
  } else if (vista === "history") {
    contenido = clienteRegistrado ? renderMiHistorial(usuario) : accesoRequerido("Inicia sesión como cliente para consultar tu historial personal.");
  } else if (vista === "promotions") {
    contenido = renderPromocionesCliente();
  } else if (vista === "profile") {
    contenido = usuario ? formularioPerfil(usuario) : `<div class="empty-state"><strong>Explora sin registrarte</strong>Para guardar tus datos de perfil, crea una cuenta de cliente.<br><br><button class="button primary" data-action="register" data-role="cliente">Crear cuenta</button></div>`;
  } else if (vista === "detail") contenido = renderDetalle(negocios.find((n) => n.id === estado.negocioId));
  app.innerHTML = `<div class="workspace">${crearMenuCliente(vista)}<section class="workspace-content"><div class="content-wrap">${contenido}</div></section></div>`;
}

function renderTarjetas(negocios, propietario, visitas = []) {
  if (!negocios.length) return `<div class="empty-state"><strong>${propietario ? "Aún no registras negocios" : estado.vista === "favorites" ? "Aún no guardas favoritos" : "No encontramos negocios"}</strong>${propietario ? "Agrega tu primer establecimiento y haz que te descubran." : estado.vista === "favorites" ? "Pulsa el corazón de una tarjeta para guardar un negocio aquí." : "Prueba con otros términos o limpia los filtros."}${propietario ? `<br><br><button class="button primary" data-view="create-business">Registrar negocio</button>` : ""}</div>`;
  const usuario = obtenerUsuarioActual();
  const favoritos = usuario?.tipo === "cliente" ? listarFavoritos(usuario) : [];
  return `<div class="business-grid">${negocios.map((n) => {
    const visita = visitas.find((item) => item.negocioId === n.id);
    return `<article class="business-card">
    ${imagenHTML(n)}
    <div class="business-body"><span class="category-line">${iconoCategoria(n.categoria)} ${escapar(n.categoria)}</span><h3>${escapar(n.nombre)}</h3>
      <div class="business-address">⌖ ${escapar(n.distrito)}, ${escapar(n.ciudad)}</div><p class="business-description">${escapar(n.descripcion)}</p>
      ${visita ? `<div class="business-meta">Consultado: ${formatearFechaHora(visita.visitadoEn)}</div>` : ""}
      ${renderResumenCalificacion(n.id)}
      <span class="status ${n.estado === "abierto" ? "open" : "closed"}">● ${n.estado === "abierto" ? "Abierto" : "Cerrado"}</span>
      <div class="card-actions"><button class="button secondary small" data-business="${n.id}">Ver detalles</button>
      ${propietario ? `<button class="button ghost small" data-edit="${n.id}" aria-label="Editar ${escapar(n.nombre)}">Editar</button><button class="button danger small" data-delete="${n.id}" aria-label="Eliminar ${escapar(n.nombre)}">Eliminar</button>` : `${usuario?.tipo === "cliente" ? `<button class="button ghost icon-button small" data-favorite="${n.id}" aria-label="${favoritos.includes(n.id) ? "Quitar de" : "Añadir a"} favoritos">${favoritos.includes(n.id) ? "♥" : "♡"}</button><button class="button ghost small compare-card-button" data-compare="${n.id}" aria-label="Añadir ${escapar(n.nombre)} a comparación">${estado.compareIds.includes(n.id) ? "✓ Comparado" : "⇄ Comparar"}</button>` : ""}`}</div>
    </div></article>`;
  }).join("")}</div>`;
}

function accesoRequerido(mensaje) {
    return `<div class="empty-state"><strong>Función para clientes registrados</strong>${escapar(mensaje)}<br><br><button class="button primary" data-action="login" data-role="cliente">Iniciar sesión</button><button class="button secondary" data-action="register" data-role="cliente">Crear cuenta</button></div>`;
}

function renderResumenCalificacion(negocioId) {
    const promedio = promedioResenas(negocioId);
    const cantidad = listarResenas(negocioId).length;
    return `<div class="rating-summary"><span class="stars" aria-label="${promedio ? promedio.toFixed(1) : "Sin calificaciones"} de 5">${promedio ? "★".repeat(Math.round(promedio)) : "☆☆☆☆☆"}</span><strong>${promedio ? promedio.toFixed(1) : "—"}</strong><span>(${cantidad})</span></div>`;
}

function renderTarjetasResenas(resenas, opciones = {}) {
    if (!resenas.length) return `<div class="empty-state"><strong>${escapar(opciones.vacio || "Aún no hay reseñas.")}</strong>${escapar(opciones.ayuda || "")}</div>`;
    const usuarios = obtenerUsuarios();
    const negocios = listarNegocios();
    return `<div class="review-list">${resenas.map((resena) => {
      const autor = usuarios.find((usuario) => usuario.id === resena.usuarioId);
      const negocio = negocios.find((item) => item.id === resena.negocioId);
      return `<article class="review-card"><div class="review-top"><div><strong>${escapar(autor ? `${autor.nombres} ${autor.apellidos}` : "Cliente")}</strong><span class="review-business">${escapar(negocio?.nombre || "Negocio")}</span></div><span class="stars">${"★".repeat(Number(resena.calificacion))}${"☆".repeat(5 - Number(resena.calificacion))}</span></div>
        <p>${escapar(resena.comentario)}</p><span class="muted review-date">${formatearFecha(resena.actualizadoEn || resena.creadoEn)}</span>
        ${opciones.propietario ? "" : `<div class="card-actions"><button class="button secondary small" data-review-edit="${resena.id}" data-review-business="${escapar(resena.negocioId)}">Editar mi reseña</button><button class="button danger small" data-review-delete="${resena.id}" data-review-business="${escapar(resena.negocioId)}">Eliminar</button></div>`}
      </article>`;
    }).join("")}</div>`;
}

function renderMisResenas(usuario) {
    const resenas = listarResenas().filter((resena) => resena.usuarioId === usuario.id)
      .sort((a, b) => (b.actualizadoEn || b.creadoEn).localeCompare(a.actualizadoEn || a.creadoEn));
    return `<div class="page-heading"><div><h1>Mis reseñas</h1><p>Consulta, edita o elimina las opiniones que publicaste.</p></div></div>${renderTarjetasResenas(resenas, { vacio: "Aún no has publicado reseñas.", ayuda: "Visita un negocio y comparte tu experiencia." })}`;
}

function renderResenasNegociante(negocios) {
    const ids = new Set(negocios.map((negocio) => negocio.id));
    const resenas = listarResenas().filter((resena) => ids.has(resena.negocioId))
      .sort((a, b) => (b.actualizadoEn || b.creadoEn).localeCompare(a.actualizadoEn || a.creadoEn));
    const promedio = resenas.length ? resenas.reduce((total, resena) => total + Number(resena.calificacion), 0) / resenas.length : 0;
    return `<div class="page-heading"><div><h1>Reseñas recibidas</h1><p>Opiniones de clientes sobre tus negocios. Las reseñas son de solo lectura.</p></div></div>
      <div class="stats-grid"><div class="stat-card"><span>Total de reseñas</span><strong>${resenas.length}</strong></div><div class="stat-card"><span>Promedio de calificación</span><strong>${promedio ? promedio.toFixed(1) : "—"}</strong></div></div>
      ${renderTarjetasResenas(resenas, { propietario: true, vacio: "Aún no hay reseñas para tus negocios." })}`;
}

function renderPromocionesNegociante(usuario, negocios) {
    const promociones = listarPromociones({ propietarioId: usuario.id })
      .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
    if (estado.vista === "create-promotion" || estado.vista === "edit-promotion") {
      const promocion = promociones.find((item) => item.id === estado.promocionId);
      if (estado.vista === "edit-promotion" && !promocion) return `<div class="empty-state"><strong>La promoción no está disponible.</strong></div>`;
      return formularioPromocion(negocios, promocion);
    }
    return `<div class="page-heading"><div><h1>Mis promociones</h1><p>Publica ofertas vigentes para tus establecimientos.</p></div><button class="button primary" data-view="create-promotion">＋ Crear promoción</button></div>
      ${promociones.length ? `<div class="promotion-list">${promociones.map((promocion) => {
        const negocio = negocios.find((item) => item.id === promocion.negocioId);
        return `<article class="promotion-card"><div><span class="promotion-tag">${promocion.fechaVencimiento >= fechaLocal() ? "Vigente" : "Vencida"}</span><h2>${escapar(promocion.titulo)}</h2><p>${escapar(promocion.descripcion)}</p><span class="muted">${escapar(negocio?.nombre || "Negocio")} · Vence ${formatearFecha(promocion.fechaVencimiento)}</span></div>
          <div class="card-actions"><button class="button secondary small" data-promotion-edit="${promocion.id}">Editar</button><button class="button danger small" data-promotion-delete="${promocion.id}">Eliminar</button></div></article>`;
      }).join("")}</div>` : `<div class="empty-state"><strong>Aún no has creado promociones.</strong>Crea una promoción para que tus ofertas vigentes aparezcan a los clientes.</div>`}`;
}

function formularioPromocion(negocios, promocion = null) {
    const editando = Boolean(promocion);
    return `<div class="page-heading"><div><h1>${editando ? "Editar promoción" : "Crear promoción"}</h1><p>Las promociones vencidas dejan de mostrarse a los clientes.</p></div></div>
      <div class="form-shell"><form id="promotion-form" class="form-grid" data-id="${editando ? promocion.id : ""}">
        <div class="form-field full"><label for="negocioId">Negocio</label><select id="negocioId" name="negocioId" required><option value="">Selecciona tu negocio</option>${negocios.map((negocio) => `<option value="${escapar(negocio.id)}" ${promocion?.negocioId === negocio.id ? "selected" : ""}>${escapar(negocio.nombre)}</option>`).join("")}</select></div>
        ${campoHTML("titulo", "Título", "text", promocion?.titulo || "")}
        <div class="form-field"><label for="fechaVencimiento">Fecha de vencimiento</label><input id="fechaVencimiento" name="fechaVencimiento" type="date" min="${fechaActualLocal()}" value="${escapar(promocion?.fechaVencimiento || "")}" required></div>
        ${campoHTML("descripcion", "Descripción", "textarea", promocion?.descripcion || "", "", true)}
        <div class="form-footer form-field full"><button class="button primary" type="submit">${editando ? "Guardar cambios" : "Publicar promoción"}</button><button class="button ghost" type="button" data-view="promotions">Cancelar</button></div>
      </form></div>`;
}

function renderPromocionesCliente() {
    const promociones = listarPromociones({ activas: true }).sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
    const negocios = listarNegocios();
    return `<div class="page-heading"><div><h1>Promociones</h1><p>Ofertas publicadas por los negocios locales, disponibles hasta la fecha indicada.</p></div></div>
      ${promociones.length ? `<div class="promotion-list">${promociones.map((promocion) => {
        const negocio = negocios.find((item) => item.id === promocion.negocioId);
        if (!negocio) return "";
        return `<article class="promotion-card"><div><span class="promotion-tag">Vigente hasta ${formatearFecha(promocion.fechaVencimiento)}</span><h2>${escapar(promocion.titulo)}</h2><p>${escapar(promocion.descripcion)}</p><span class="muted">${escapar(negocio.nombre)} · ${escapar(negocio.distrito)}, ${escapar(negocio.ciudad)}</span></div><button class="button secondary small" data-business="${escapar(negocio.id)}">Ver negocio</button></article>`;
      }).join("")}</div>` : `<div class="empty-state"><strong>No hay promociones vigentes.</strong>Cuando un negociante publique una oferta aparecerá aquí.</div>`}`;
}

function renderMiHistorial(usuario) {
    const visitas = listarHistorial(usuario);
    const negocios = listarNegocios();
    const vistos = visitas.map((visita) => negocios.find((negocio) => negocio.id === visita.negocioId)).filter(Boolean);
    return `<div class="page-heading"><div><h1>Mi historial</h1><p>Los negocios que consultaste recientemente.</p></div>${visitas.length ? `<button class="button secondary" data-action="clear-history">Limpiar historial</button>` : ""}</div>
      ${vistos.length ? renderTarjetas(vistos, false, visitas) : `<div class="empty-state"><strong>Aún no hay negocios en tu historial.</strong>Al abrir los detalles de un negocio, aparecerá aquí.</div>`}`;
}

function renderComparador(negocios) {
    const usuario = obtenerUsuarioActual();
    const compareIds = estado.compareUserId === usuario?.id ? estado.compareIds : [];
    const seleccionados = obtenerParComparacion(negocios, compareIds);
    const opciones = negocios.map((negocio) => `<option value="${escapar(negocio.id)}">${escapar(negocio.nombre)}</option>`).join("");
    return `<div class="page-heading"><div><h1>Comparar negocios</h1><p>Selecciona dos establecimientos para revisar sus datos lado a lado.</p></div></div>
      <div class="form-shell"><form id="compare-form" class="compare-picker">
        <div class="form-field"><label for="compararA">Primer negocio</label><select id="compararA" name="compararA" required><option value="">Selecciona un negocio</option>${negocios.map((negocio) => `<option value="${escapar(negocio.id)}" ${compareIds[0] === negocio.id ? "selected" : ""}>${escapar(negocio.nombre)}</option>`).join("")}</select></div>
        <div class="form-field"><label for="compararB">Segundo negocio</label><select id="compararB" name="compararB" required><option value="">Selecciona otro negocio</option>${negocios.map((negocio) => `<option value="${escapar(negocio.id)}" ${compareIds[1] === negocio.id ? "selected" : ""}>${escapar(negocio.nombre)}</option>`).join("")}</select></div>
        <button class="button primary" type="submit">Comparar</button>
      </form></div>
      ${seleccionados.length === 2 ? renderTablaComparacion(seleccionados) : `<div class="empty-state comparison-hint"><strong>Elige dos negocios diferentes.</strong>También puedes marcar negocios con “Comparar” desde las tarjetas.</div>`}`;
}

function renderTablaComparacion(negocios) {
    const campos = [["Categoría", (n) => n.categoria], ["Ubicación", (n) => `${n.direccion}, ${n.distrito}, ${n.ciudad}`], ["Horario", (n) => n.horario], ["Servicios", (n) => n.servicios || "No especificado"], ["Calificación", (n) => `${promedioResenas(n.id) ? promedioResenas(n.id).toFixed(1) : "Sin calificaciones"} (${listarResenas(n.id).length} reseñas)`]];
    return `<div class="comparison-grid">${negocios.map((negocio) => `<article class="comparison-card"><h2>${escapar(negocio.nombre)}</h2><div class="comparison-rating">${renderResumenCalificacion(negocio.id)}</div>${campos.map(([etiqueta, obtener]) => `<div class="comparison-row"><strong>${etiqueta}</strong><span>${escapar(obtener(negocio))}</span></div>`).join("")}</article>`).join("")}</div>`;
}

function renderDetalle(n) {
  if (!n) return `<div class="empty-state"><strong>Este negocio ya no está disponible.</strong><button class="button secondary" data-view="${estado.perfil === "negociante" ? "businesses" : "explore"}">Volver</button></div>`;
  const telefono = n.whatsapp.replace(/\D/g, "");
  const codigoPais = telefono.length === 9 ? `51${telefono}` : telefono;
  const usuario = obtenerUsuarioActual();
  const esCliente = usuario?.tipo === "cliente";
  const miResena = esCliente ? resenaDelCliente(usuario, n.id) : null;
  const resenas = listarResenas(n.id).sort((a, b) => (b.actualizadoEn || b.creadoEn).localeCompare(a.actualizadoEn || a.creadoEn));
  const promociones = listarPromociones({ activas: true }).filter((promocion) => promocion.negocioId === n.id);
  return `<button class="button ghost" data-view="${estado.perfil === "negociante" ? "businesses" : "explore"}">← Volver a negocios</button><article class="detail-panel" style="margin-top:16px">
    ${n.imagen ? `<img class="detail-cover" src="${escapar(n.imagen)}" alt="Imagen de ${escapar(n.nombre)}" onerror="this.hidden=true">` : `<div class="business-image placeholder" style="height:240px">⌂</div>`}
    <div class="detail-content"><span class="category-line">${iconoCategoria(n.categoria)} ${escapar(n.categoria)}</span><h1>${escapar(n.nombre)}</h1>${renderResumenCalificacion(n.id)}<span class="status ${n.estado === "abierto" ? "open" : "closed"}">● ${n.estado === "abierto" ? "Abierto" : "Cerrado"}</span>
      <p style="margin-top:18px">${escapar(n.descripcion)}</p><div class="detail-grid"><div class="detail-item"><strong>Dirección</strong>${escapar(n.direccion)}, ${escapar(n.distrito)}, ${escapar(n.ciudad)}</div>
      <div class="detail-item"><strong>Horario</strong>${escapar(n.horario)}</div><div class="detail-item"><strong>WhatsApp</strong>${escapar(n.whatsapp)}</div><div class="detail-item"><strong>Categoría</strong>${escapar(n.categoria)}</div><div class="detail-item"><strong>Servicios</strong>${escapar(n.servicios || "No especificado")}</div></div>
      <a class="button primary" href="https://wa.me/${codigoPais}" target="_blank" rel="noopener noreferrer">◉ Contactar por WhatsApp</a></div></article>
    ${promociones.length ? `<section class="detail-section"><h2 class="section-title">Promociones vigentes</h2><div class="promotion-list">${promociones.map((promocion) => `<article class="promotion-card"><div><span class="promotion-tag">Vigente hasta ${formatearFecha(promocion.fechaVencimiento)}</span><h2>${escapar(promocion.titulo)}</h2><p>${escapar(promocion.descripcion)}</p></div></article>`).join("")}</div></section>` : ""}
    <section class="detail-section"><div class="page-heading"><div><h2 class="section-title">Reseñas y calificaciones</h2><p>${resenas.length} ${resenas.length === 1 ? "opinión" : "opiniones"} de clientes</p></div></div>${renderTarjetasResenas(resenas, { propietario: true, vacio: "Este negocio todavía no tiene reseñas." })}
      ${esCliente ? `<div class="form-shell review-form-shell"><h2>${miResena ? "Edita tu reseña" : "Comparte tu experiencia"}</h2><form id="review-form" data-id="${miResena?.id || ""}" data-business-id="${escapar(n.id)}" class="form-grid">
        <div class="form-field"><label for="calificacion">Calificación</label><select id="calificacion" name="calificacion" required><option value="">Selecciona de 1 a 5 estrellas</option>${[5,4,3,2,1].map((valor) => `<option value="${valor}" ${Number(miResena?.calificacion) === valor ? "selected" : ""}>${valor} ${valor === 1 ? "estrella" : "estrellas"}</option>`).join("")}</select></div>
        ${campoHTML("comentario", "Tu comentario", "textarea", miResena?.comentario || "", "", true)}
        <div class="form-footer form-field full"><button class="button primary" type="submit">${miResena ? "Guardar cambios" : "Publicar reseña"}</button>${miResena ? `<button class="button danger" type="button" data-review-delete="${miResena.id}">Eliminar mi reseña</button>` : ""}</div></form></div>` : `<div class="review-signin"><p>Para publicar una reseña, inicia sesión con una cuenta de cliente.</p><button class="button secondary" data-action="login" data-role="cliente">Iniciar sesión como cliente</button></div>`}
    </section>`;
}

function formularioNegocio(negocio = {}) {
  const editando = Boolean(negocio.id);
  const entrada = (nombre, etiqueta, tipo = "text", full = false, hint = "") => campoHTML(nombre, etiqueta, tipo, negocio[nombre] || "", "", full, hint);
  return `<div class="page-heading"><div><h1>${editando ? "Editar negocio" : "Registrar negocio"}</h1><p>Completa la información para que tus clientes te encuentren.</p></div></div>
    <div class="form-shell"><form id="business-form" data-id="${editando ? negocio.id : ""}" class="form-grid">
      ${entrada("nombre", "Nombre comercial")}${`<div class="form-field"><label for="categoria">Categoría</label><select id="categoria" name="categoria" required><option value="">Selecciona una categoría</option>${categorias.map((c) => `<option value="${escapar(c)}" ${negocio.categoria === c ? "selected" : ""}>${escapar(c)}</option>`).join("")}</select></div>`}
      ${entrada("descripcion", "Descripción", "textarea", true)}${entrada("direccion", "Dirección")}${entrada("distrito", "Distrito")}${entrada("ciudad", "Ciudad")}
      ${entrada("horario", "Horario de atención")}${entrada("servicios", "Servicios (opcional)", "text", true, "Se mostrarán en los detalles y comparación.")}${entrada("whatsapp", "WhatsApp", "tel", false, "9 dígitos, sin espacios.")}${entrada("imagen", "URL de imagen (opcional)", "url", true, "Usa una dirección https:// accesible.")}
      <div class="form-field"><label for="estado">Estado del negocio</label><select id="estado" name="estado"><option value="abierto" ${negocio.estado !== "cerrado" ? "selected" : ""}>Abierto</option><option value="cerrado" ${negocio.estado === "cerrado" ? "selected" : ""}>Cerrado</option></select></div>
      <div class="form-footer form-field full"><button type="submit" class="button primary">${editando ? "Guardar cambios" : "Registrar negocio"}</button><button type="button" class="button ghost" data-view="businesses">Cancelar</button></div>
    </form></div>`;
}

function formularioPerfil(usuario) {
  return `<div class="page-heading"><div><h1>Mi perfil</h1><p>Actualiza tus datos de contacto.</p></div></div><div class="form-shell narrow"><form id="profile-form" class="form-grid">
    ${camposUsuario.map(([nombre, etiqueta, tipoCampo]) => campoHTML(nombre, etiqueta, tipoCampo, usuario[nombre], nombre === "dni" ? 'maxlength="8" inputmode="numeric"' : nombre === "telefono" ? 'maxlength="9" inputmode="numeric"' : "")).join("")}
    <div class="form-footer form-field full"><button class="button primary" type="submit">Guardar perfil</button></div></form></div>`;
}

function campoHTML(nombre, etiqueta, tipo, valor = "", atributos = "", full = false, hint = "") {
  const isTextarea = tipo === "textarea";
  const requerido = ["imagen", "servicios"].includes(nombre) ? "" : "required";
  return `<div class="form-field ${full ? "full" : ""}"><label for="${nombre}">${etiqueta}</label>${isTextarea
    ? `<textarea id="${nombre}" name="${nombre}" ${requerido} placeholder="${etiqueta}">${escapar(valor)}</textarea>`
    : `<input id="${nombre}" name="${nombre}" type="${tipo}" value="${escapar(valor)}" ${atributos} ${requerido} placeholder="${etiqueta}">`}
    ${hint ? `<p class="field-hint">${hint}</p>` : ""}</div>`;
}

function imagenHTML(negocio) {
  return negocio.imagen
    ? `<img class="business-image" src="${escapar(negocio.imagen)}" alt="Imagen de ${escapar(negocio.nombre)}" loading="lazy" onerror="this.hidden=true">`
    : `<div class="business-image placeholder" aria-hidden="true">⌂</div>`;
}
function formatearFecha(fecha) {
  const [anio, mes, dia] = String(fecha || "").slice(0, 10).split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : "Sin fecha";
}
function formatearFechaHora(fecha) {
  const fechaValida = new Date(fecha);
  return Number.isNaN(fechaValida.getTime()) ? "Fecha desconocida" : fechaValida.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}
function iconoCategoria(cat) { return ({ abarrotes: "▣", restaurantes: "☕", farmacias: "✚", ferreterías: "⚒", librerías: "▤", ropa: "◇", otros: "✦" })[cat] || "✦"; }
function escapar(valor) { return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caracter]); }

function leerFormulario(formulario) { return Object.fromEntries(new FormData(formulario).entries()); }
function erroresEnFormulario(formulario, errores) {
  Object.entries(errores).forEach(([campo, mensaje]) => {
    const entrada = formulario.elements.namedItem(campo);
    if (entrada) entrada.setCustomValidity(mensaje);
  });
  const primero = Object.keys(errores)[0];
  if (primero) formulario.elements.namedItem(primero)?.reportValidity();
}
function limpiarValidaciones(formulario) {
  formulario.querySelectorAll("input,select,textarea").forEach((entrada) => entrada.setCustomValidity(""));
}

document.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;
  if (boton.dataset.action === "home") { estado.perfil = null; estado.vista = "dashboard"; estado.buscar = { texto: "", categoria: "", distrito: "" }; render(); }
  if (boton.dataset.action === "register" || boton.dataset.action === "login") renderAcceso(boton.dataset.action, boton.dataset.role || "negociante");
  if (boton.dataset.action === "explore") { estado.perfil = "cliente"; estado.vista = "explore"; render(); }
  if (boton.dataset.action === "logout") { cerrarSesion(); estado.perfil = null; estado.vista = "dashboard"; estado.compareIds = []; estado.compareUserId = null; render(); }
  if (boton.dataset.view) {
    const usuario = obtenerUsuarioActual();
    const vistasNegociante = ["dashboard", "businesses", "create-business", "edit-business", "profile", "promotions", "create-promotion", "edit-promotion", "received-reviews", "detail"];
    const vistasCliente = ["home-client", "explore", "categories", "search", "favorites", "my-reviews", "compare", "history", "promotions", "profile", "detail"];
    if (estado.perfil === "negociante" && !vistasNegociante.includes(boton.dataset.view)) return;
    if (estado.perfil === "cliente" && !vistasCliente.includes(boton.dataset.view)) return;
    if (["favorites", "my-reviews", "compare", "history"].includes(boton.dataset.view) && usuario?.tipo !== "cliente") {
      estado.vista = boton.dataset.view; render(); return;
    }
    if (["create-promotion", "edit-promotion", "received-reviews", "create-business", "edit-business", "businesses", "dashboard"].includes(boton.dataset.view) && estado.perfil !== "negociante") return;
    estado.vista = boton.dataset.view; estado.negocioId = null;
    if (!["edit-promotion", "create-promotion"].includes(estado.vista)) estado.promocionId = null;
    render();
  }
  if (boton.dataset.business) {
    const negocio = listarNegocios().find((item) => item.id === boton.dataset.business);
    if (!negocio) return notificar("Este negocio ya no está disponible.", "error");
    const usuario = obtenerUsuarioActual();
    if (!(usuario?.tipo === "negociante" && negocio.propietarioId === usuario.id)) registrarConsulta(usuario?.id, negocio.id);
    estado.negocioId = negocio.id; estado.vista = "detail"; render();
  }
  if (boton.dataset.edit) {
    const usuario = obtenerUsuarioActual();
    const negocio = listarNegocios().find((item) => item.id === boton.dataset.edit && item.propietarioId === usuario?.id);
    if (!usuario || usuario.tipo !== "negociante" || !negocio) return notificar("No puedes editar este negocio.", "error");
    estado.negocioId = negocio.id; estado.vista = "edit-business"; render();
  }
  if (boton.dataset.delete) {
    const usuario = obtenerUsuarioActual();
    const negocio = listarNegocios().find((n) => n.id === boton.dataset.delete && n.propietarioId === usuario?.id);
    if (!usuario || usuario.tipo !== "negociante") return notificar("Solo el propietario puede eliminar un negocio.", "error");
    if (negocio && confirmar(`¿Eliminar "${negocio.nombre}"? Esta acción no se puede deshacer.`)) {
      try { eliminarNegocio(negocio.id, usuario.id); notificar("Negocio y datos relacionados eliminados."); render(); }
      catch (error) { notificar(error.message, "error"); }
    }
  }
  if (boton.dataset.favorite) {
    const usuario = obtenerUsuarioActual();
    if (!usuario || usuario.tipo !== "cliente") return notificar("Inicia sesión como cliente para guardar favoritos.", "error");
    try { notificar(alternarFavorito(usuario, boton.dataset.favorite) ? "Agregado a favoritos." : "Quitado de favoritos."); render(); }
    catch (error) { notificar(error.message, "error"); }
  }
  if (boton.dataset.compare) {
    const usuario = obtenerUsuarioActual();
    if (!usuario || usuario.tipo !== "cliente") return notificar("Inicia sesión como cliente para comparar negocios.", "error");
    if (estado.compareUserId !== usuario.id) { estado.compareIds = []; estado.compareUserId = usuario.id; }
    if (estado.compareIds.includes(boton.dataset.compare)) {
      estado.compareIds = estado.compareIds.filter((id) => id !== boton.dataset.compare);
    } else if (estado.compareIds.length < 2) {
      estado.compareIds.push(boton.dataset.compare);
    } else {
      return notificar("Puedes comparar dos negocios a la vez. Quita uno para seleccionar otro.", "error");
    }
    notificar(`${estado.compareIds.length} de 2 negocios seleccionados para comparar.`);
    render();
  }
  if (boton.dataset.reviewEdit) {
    const usuario = obtenerUsuarioActual();
    const review = listarResenas().find((item) => item.id === boton.dataset.reviewEdit && item.usuarioId === usuario?.id);
    if (!usuario || usuario.tipo !== "cliente" || !review) return notificar("No puedes editar esta reseña.", "error");
    estado.negocioId = review.negocioId; estado.vista = "detail"; render();
  }
  if (boton.dataset.reviewDelete) {
    const usuario = obtenerUsuarioActual();
    if (!usuario || usuario.tipo !== "cliente") return notificar("Solo el cliente que escribió la reseña puede eliminarla.", "error");
    if (confirmar("¿Eliminar tu reseña?")) {
      try {
        eliminarResena(usuario, boton.dataset.reviewDelete);
        estado.negocioId = boton.dataset.reviewBusiness || estado.negocioId;
        notificar("Reseña eliminada.");
        render();
      } catch (error) { notificar(error.message, "error"); }
    }
  }
  if (boton.dataset.promotionEdit) {
    const usuario = obtenerUsuarioActual();
    const promocion = listarPromociones({ propietarioId: usuario?.id }).find((item) => item.id === boton.dataset.promotionEdit);
    if (!usuario || usuario.tipo !== "negociante" || !promocion) return notificar("No puedes editar esta promoción.", "error");
    estado.promocionId = promocion.id; estado.vista = "edit-promotion"; render();
  }
  if (boton.dataset.promotionDelete) {
    const usuario = obtenerUsuarioActual();
    if (!usuario || usuario.tipo !== "negociante") return notificar("Solo un negociante puede gestionar promociones.", "error");
    if (confirmar("¿Eliminar esta promoción?")) {
      try { eliminarPromocion(usuario, boton.dataset.promotionDelete); notificar("Promoción eliminada."); render(); }
      catch (error) { notificar(error.message, "error"); }
    }
  }
  if (boton.dataset.category) {
    estado.buscar = { texto: "", categoria: boton.dataset.category, distrito: "" };
    estado.vista = "search"; render();
  }
  if (boton.dataset.action === "clear-filters") { estado.buscar = { texto: "", categoria: "", distrito: "" }; render(); }
  if (boton.dataset.action === "clear-history") {
    const usuario = obtenerUsuarioActual();
    if (!usuario || usuario.tipo !== "cliente") return notificar("Inicia sesión como cliente para limpiar tu historial.", "error");
    if (confirmar("¿Limpiar todo tu historial de negocios consultados?")) {
      try { limpiarHistorial(usuario); notificar("Historial limpiado."); render(); }
      catch (error) { notificar(error.message, "error"); }
    }
  }
});

document.addEventListener("input", (evento) => {
  const formulario = evento.target.closest("form");
  if (formulario) evento.target.setCustomValidity("");
  if (evento.target.matches("[data-filter]")) {
    estado.buscar[evento.target.dataset.filter] = evento.target.value;
    const posicion = window.scrollY;
    renderCliente();
    window.scrollTo(0, posicion);
    const nuevo = document.querySelector(`[data-filter="${evento.target.dataset.filter}"]`);
    nuevo?.focus();
    if (nuevo && nuevo.type !== "select-one") { nuevo.setSelectionRange(nuevo.value.length, nuevo.value.length); }
  }
});
document.addEventListener("change", (evento) => {
  if (evento.target.matches('select[data-filter]')) {
    estado.buscar[evento.target.dataset.filter] = evento.target.value;
    renderCliente();
  }
});

document.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const formulario = evento.target;
  limpiarValidaciones(formulario);
  try {
    if (formulario.id === "access-form") {
      const datos = leerFormulario(formulario);
      if (formulario.dataset.mode === "register") {
        const errores = validarUsuario(datos);
        if (Object.keys(errores).length) return erroresEnFormulario(formulario, errores);
        const usuario = registrarUsuario(datos);
        iniciarSesion(usuario.correo, usuario.tipo);
        estado.perfil = usuario.tipo;
        estado.vista = usuario.tipo === "negociante" ? "dashboard" : "home-client";
        estado.compareIds = []; estado.compareUserId = usuario.tipo === "cliente" ? usuario.id : null;
        notificar("¡Tu cuenta está lista!");
      } else {
        const usuario = iniciarSesion(datos.identificador, formulario.dataset.role);
        estado.perfil = usuario.tipo;
        estado.vista = usuario.tipo === "negociante" ? "dashboard" : "home-client";
        estado.compareIds = []; estado.compareUserId = usuario.tipo === "cliente" ? usuario.id : null;
        notificar("Sesión iniciada.");
      }
      render();
    } else if (formulario.id === "business-form") {
      const datos = leerFormulario(formulario);
      const errores = validarNegocio(datos);
      if (Object.keys(errores).length) return erroresEnFormulario(formulario, errores);
      const usuario = obtenerUsuarioActual();
      if (!usuario || usuario.tipo !== "negociante") throw new Error("Inicia sesión como negociante para gestionar negocios.");
      if (formulario.dataset.id) actualizarNegocio(formulario.dataset.id, usuario.id, datos);
      else registrarNegocio(datos, usuario.id);
      estado.vista = "businesses"; notificar(formulario.dataset.id ? "Negocio actualizado." : "Negocio registrado."); render();
    } else if (formulario.id === "promotion-form") {
      const usuario = obtenerUsuarioActual();
      if (!usuario || usuario.tipo !== "negociante") throw new Error("Inicia sesión como negociante para publicar promociones.");
      const datos = leerFormulario(formulario);
      guardarPromocion(usuario, datos, formulario.dataset.id || "");
      estado.vista = "promotions"; estado.promocionId = null;
      notificar(formulario.dataset.id ? "Promoción actualizada." : "Promoción publicada.");
      render();
    } else if (formulario.id === "review-form") {
      const usuario = obtenerUsuarioActual();
      if (!usuario || usuario.tipo !== "cliente") throw new Error("Solo un cliente registrado puede publicar reseñas.");
      guardarResena(usuario, formulario.dataset.businessId, leerFormulario(formulario), formulario.dataset.id || "");
      notificar(formulario.dataset.id ? "Tu reseña fue actualizada." : "Tu reseña fue publicada.");
      render();
    } else if (formulario.id === "compare-form") {
      const usuario = obtenerUsuarioActual();
      if (!usuario || usuario.tipo !== "cliente") throw new Error("Inicia sesión como cliente para comparar negocios.");
      const datos = leerFormulario(formulario);
      if (datos.compararA === datos.compararB) throw new Error("Selecciona dos negocios diferentes.");
      const seleccionados = obtenerParComparacion(listarNegocios(), [datos.compararA, datos.compararB]);
      if (seleccionados.length !== 2) throw new Error("Selecciona dos negocios disponibles.");
      estado.compareIds = seleccionados.map((negocio) => negocio.id);
      estado.compareUserId = usuario.id;
      render();
    } else if (formulario.id === "profile-form") {
      const usuario = obtenerUsuarioActual();
      if (!usuario) throw new Error("Inicia sesión para editar tu perfil.");
      const datos = { ...usuario, ...leerFormulario(formulario) };
      const errores = validarUsuario(datos);
      if (Object.keys(errores).length) return erroresEnFormulario(formulario, errores);
      actualizarPerfil(usuario.id, datos);
      notificar("Perfil actualizado."); render();
    }
  } catch (error) { notificar(error.message || "Ocurrió un error inesperado.", "error"); }
});
