import { inicializarDemo, obtenerFavoritos, guardarFavoritos } from "./almacenamiento.js";
import { camposUsuario, validarUsuario, registrarUsuario, iniciarSesion, obtenerUsuarioActual, actualizarPerfil, cerrarSesion } from "./usuarios.js";
import { categorias, validarNegocio, registrarNegocio, actualizarNegocio, eliminarNegocio, listarNegocios, listarNegociosPropietario } from "./negocios.js";
import { filtrarNegocios } from "./buscador.js";
import { crearMenuNegociante } from "./interfaz/menuNegociante.js";
import { crearMenuCliente } from "./interfaz/menuCliente.js";
import { notificar, confirmar } from "./interfaz/botones.js";

const app = document.querySelector("#app");
const topActions = document.querySelector("#topbar-actions");
const estado = { perfil: null, vista: "dashboard", modal: null, buscar: { texto: "", categoria: "", distrito: "" } };

inicializarDemo();
const usuarioSesion = obtenerUsuarioActual();
if (usuarioSesion) { estado.perfil = usuarioSesion.tipo; estado.vista = usuarioSesion.tipo === "negociante" ? "dashboard" : "home-client"; }
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
    contenido = `<div class="page-heading"><div><h1>¡Hola, ${escapar(usuario.nombres)}! 👋</h1><p>Este es el resumen de tus negocios.</p></div><button class="button primary" data-view="create-business">＋ Registrar negocio</button></div>
      <div class="stats-grid"><div class="stat-card"><span>Mis negocios</span><strong>${negocios.length}</strong></div><div class="stat-card"><span>Negocios abiertos</span><strong>${negocios.filter((n) => n.estado === "abierto").length}</strong></div><div class="stat-card"><span>Categorías activas</span><strong>${new Set(negocios.map((n) => n.categoria)).size}</strong></div></div>
      <h2 class="section-title">Tus establecimientos</h2>${renderTarjetas(negocios, true)}`;
  } else if (estado.vista === "businesses") {
    contenido = `<div class="page-heading"><div><h1>Mis negocios</h1><p>Administra cada uno de tus establecimientos.</p></div><button class="button primary" data-view="create-business">＋ Registrar negocio</button></div>${renderTarjetas(negocios, true)}`;
  } else if (estado.vista === "create-business" || estado.vista === "edit-business") {
    const editando = estado.vista === "edit-business";
    const negocio = editando ? negocios.find((n) => n.id === estado.negocioId) : null;
    contenido = negocio ? formularioNegocio(negocio) : formularioNegocio();
  } else if (estado.vista === "profile") contenido = formularioPerfil(usuario);
  else if (estado.vista === "detail") contenido = renderDetalle(listarNegocios().find((n) => n.id === estado.negocioId));
  app.innerHTML = `<div class="workspace">${crearMenuNegociante(estado.vista)}<section class="workspace-content"><div class="content-wrap">${contenido}</div></section></div>`;
}

function renderCliente() {
  const vista = estado.vista;
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
    const favoritos = obtenerFavoritos();
    contenido = `<div class="page-heading"><div><h1>Mis favoritos</h1><p>Los negocios que guardaste para volver a encontrar.</p></div></div>${renderTarjetas(negocios.filter((n) => favoritos.includes(n.id)), false)}`;
  } else if (vista === "profile") {
    const usuario = obtenerUsuarioActual();
    contenido = usuario ? formularioPerfil(usuario) : `<div class="empty-state"><strong>Explora sin registrarte</strong>Para guardar tus datos de perfil, crea una cuenta de cliente.<br><br><button class="button primary" data-action="register" data-role="cliente">Crear cuenta</button></div>`;
  } else if (vista === "detail") contenido = renderDetalle(negocios.find((n) => n.id === estado.negocioId));
  app.innerHTML = `<div class="workspace">${crearMenuCliente(vista)}<section class="workspace-content"><div class="content-wrap">${contenido}</div></section></div>`;
}

function renderTarjetas(negocios, propietario) {
  if (!negocios.length) return `<div class="empty-state"><strong>${propietario ? "Aún no registras negocios" : "No encontramos negocios"}</strong>${propietario ? "Agrega tu primer establecimiento y haz que te descubran." : "Prueba con otros términos o limpia los filtros."}${propietario ? `<br><br><button class="button primary" data-view="create-business">Registrar negocio</button>` : ""}</div>`;
  const favoritos = obtenerFavoritos();
  return `<div class="business-grid">${negocios.map((n) => `<article class="business-card">
    ${imagenHTML(n)}
    <div class="business-body"><span class="category-line">${iconoCategoria(n.categoria)} ${escapar(n.categoria)}</span><h3>${escapar(n.nombre)}</h3>
      <div class="business-address">⌖ ${escapar(n.distrito)}, ${escapar(n.ciudad)}</div><p class="business-description">${escapar(n.descripcion)}</p>
      <span class="status ${n.estado === "abierto" ? "open" : "closed"}">● ${n.estado === "abierto" ? "Abierto" : "Cerrado"}</span>
      <div class="card-actions"><button class="button secondary small" data-business="${n.id}">Ver detalles</button>
      ${propietario ? `<button class="button ghost small" data-edit="${n.id}" aria-label="Editar ${escapar(n.nombre)}">Editar</button><button class="button danger small" data-delete="${n.id}" aria-label="Eliminar ${escapar(n.nombre)}">Eliminar</button>` : `<button class="button ghost icon-button small" data-favorite="${n.id}" aria-label="${favoritos.includes(n.id) ? "Quitar de" : "Añadir a"} favoritos">${favoritos.includes(n.id) ? "♥" : "♡"}</button>`}</div>
    </div></article>`).join("")}</div>`;
}

function renderDetalle(n) {
  if (!n) return `<div class="empty-state"><strong>Este negocio ya no está disponible.</strong><button class="button secondary" data-view="${estado.perfil === "negociante" ? "businesses" : "explore"}">Volver</button></div>`;
  const telefono = n.whatsapp.replace(/\D/g, "");
  const codigoPais = telefono.length === 9 ? `51${telefono}` : telefono;
  return `<button class="button ghost" data-view="${estado.perfil === "negociante" ? "businesses" : "explore"}">← Volver a negocios</button><article class="detail-panel" style="margin-top:16px">
    ${n.imagen ? `<img class="detail-cover" src="${escapar(n.imagen)}" alt="Imagen de ${escapar(n.nombre)}" onerror="this.hidden=true">` : `<div class="business-image placeholder" style="height:240px">⌂</div>`}
    <div class="detail-content"><span class="category-line">${iconoCategoria(n.categoria)} ${escapar(n.categoria)}</span><h1>${escapar(n.nombre)}</h1><span class="status ${n.estado === "abierto" ? "open" : "closed"}">● ${n.estado === "abierto" ? "Abierto" : "Cerrado"}</span>
      <p style="margin-top:18px">${escapar(n.descripcion)}</p><div class="detail-grid"><div class="detail-item"><strong>Dirección</strong>${escapar(n.direccion)}, ${escapar(n.distrito)}, ${escapar(n.ciudad)}</div>
      <div class="detail-item"><strong>Horario</strong>${escapar(n.horario)}</div><div class="detail-item"><strong>WhatsApp</strong>${escapar(n.whatsapp)}</div><div class="detail-item"><strong>Categoría</strong>${escapar(n.categoria)}</div></div>
      <a class="button primary" href="https://wa.me/${codigoPais}" target="_blank" rel="noopener noreferrer">◉ Contactar por WhatsApp</a></div></article>`;
}

function formularioNegocio(negocio = {}) {
  const editando = Boolean(negocio.id);
  const entrada = (nombre, etiqueta, tipo = "text", full = false, hint = "") => campoHTML(nombre, etiqueta, tipo, negocio[nombre] || "", "", full, hint);
  return `<div class="page-heading"><div><h1>${editando ? "Editar negocio" : "Registrar negocio"}</h1><p>Completa la información para que tus clientes te encuentren.</p></div></div>
    <div class="form-shell"><form id="business-form" data-id="${editando ? negocio.id : ""}" class="form-grid">
      ${entrada("nombre", "Nombre comercial")}${`<div class="form-field"><label for="categoria">Categoría</label><select id="categoria" name="categoria" required><option value="">Selecciona una categoría</option>${categorias.map((c) => `<option value="${escapar(c)}" ${negocio.categoria === c ? "selected" : ""}>${escapar(c)}</option>`).join("")}</select></div>`}
      ${entrada("descripcion", "Descripción", "textarea", true)}${entrada("direccion", "Dirección")}${entrada("distrito", "Distrito")}${entrada("ciudad", "Ciudad")}
      ${entrada("horario", "Horario de atención")}${entrada("whatsapp", "WhatsApp", "tel", false, "9 dígitos, sin espacios.")}${entrada("imagen", "URL de imagen (opcional)", "url", true, "Usa una dirección https:// accesible.")}
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
  const requerido = nombre === "imagen" ? "" : "required";
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
  if (boton.dataset.action === "logout") { cerrarSesion(); estado.perfil = null; estado.vista = "dashboard"; render(); }
  if (boton.dataset.view) { estado.vista = boton.dataset.view; estado.negocioId = null; render(); }
  if (boton.dataset.business) { estado.negocioId = boton.dataset.business; estado.vista = "detail"; render(); }
  if (boton.dataset.edit) { estado.negocioId = boton.dataset.edit; estado.vista = "edit-business"; render(); }
  if (boton.dataset.delete) {
    const negocio = listarNegocios().find((n) => n.id === boton.dataset.delete);
    if (negocio && confirmar(`¿Eliminar "${negocio.nombre}"? Esta acción no se puede deshacer.`)) {
      try { eliminarNegocio(negocio.id, obtenerUsuarioActual().id); guardarFavoritos(obtenerFavoritos().filter((id) => id !== negocio.id)); notificar("Negocio eliminado."); render(); }
      catch (error) { notificar(error.message, "error"); }
    }
  }
  if (boton.dataset.favorite) {
    const favoritos = obtenerFavoritos();
    const actualizado = favoritos.includes(boton.dataset.favorite) ? favoritos.filter((id) => id !== boton.dataset.favorite) : [...favoritos, boton.dataset.favorite];
    guardarFavoritos(actualizado); notificar(actualizado.includes(boton.dataset.favorite) ? "Agregado a favoritos." : "Quitado de favoritos."); render();
  }
  if (boton.dataset.category) {
    estado.buscar = { texto: "", categoria: boton.dataset.category, distrito: "" };
    estado.vista = "search"; render();
  }
  if (boton.dataset.action === "clear-filters") { estado.buscar = { texto: "", categoria: "", distrito: "" }; render(); }
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
        notificar("¡Tu cuenta está lista!");
      } else {
        const usuario = iniciarSesion(datos.identificador, formulario.dataset.role);
        estado.perfil = usuario.tipo;
        estado.vista = usuario.tipo === "negociante" ? "dashboard" : "home-client";
        notificar("Sesión iniciada.");
      }
      render();
    } else if (formulario.id === "business-form") {
      const datos = leerFormulario(formulario);
      const errores = validarNegocio(datos);
      if (Object.keys(errores).length) return erroresEnFormulario(formulario, errores);
      const usuario = obtenerUsuarioActual();
      if (formulario.dataset.id) actualizarNegocio(formulario.dataset.id, usuario.id, datos);
      else registrarNegocio(datos, usuario.id);
      estado.vista = "businesses"; notificar(formulario.dataset.id ? "Negocio actualizado." : "Negocio registrado."); render();
    } else if (formulario.id === "profile-form") {
      const usuario = obtenerUsuarioActual();
      const datos = { ...usuario, ...leerFormulario(formulario) };
      const errores = validarUsuario(datos);
      if (Object.keys(errores).length) return erroresEnFormulario(formulario, errores);
      actualizarPerfil(usuario.id, datos);
      notificar("Perfil actualizado."); render();
    }
  } catch (error) { notificar(error.message || "Ocurrió un error inesperado.", "error"); }
});
