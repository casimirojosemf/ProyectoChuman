import { obtenerUsuarios, guardarUsuarios, obtenerSesion, guardarSesion, limpiarSesion } from "./almacenamiento.js";

export const camposUsuario = [
  ["nombres", "Nombres", "text"], ["apellidos", "Apellidos", "text"], ["dni", "DNI", "text"],
  ["correo", "Correo electrónico", "email"], ["telefono", "Teléfono", "tel"]
];

export function validarUsuario(datos) {
  const errores = {};
  for (const [campo, etiqueta] of camposUsuario) {
    if (!String(datos[campo] || "").trim()) errores[campo] = `Ingresa ${etiqueta.toLowerCase()}.`;
  }
  if (datos.dni && !/^\d{8}$/.test(datos.dni)) errores.dni = "El DNI debe tener exactamente 8 dígitos.";
  if (datos.telefono && !/^\d{9}$/.test(datos.telefono)) errores.telefono = "El teléfono debe tener exactamente 9 dígitos.";
  if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) errores.correo = "Ingresa un correo válido.";
  if (!["negociante", "cliente"].includes(datos.tipo)) errores.tipo = "Selecciona un tipo de usuario.";
  return errores;
}

export function registrarUsuario(datos) {
  const usuarios = obtenerUsuarios();
  const normalizarCorreo = (correo) => correo.trim().toLowerCase();
  if (usuarios.some((u) => u.dni === datos.dni)) throw new Error("Ya existe una cuenta registrada con ese DNI.");
  if (usuarios.some((u) => normalizarCorreo(u.correo) === normalizarCorreo(datos.correo))) throw new Error("Ya existe una cuenta registrada con ese correo.");
  const usuario = { ...datos, id: crypto.randomUUID(), nombres: datos.nombres.trim(), apellidos: datos.apellidos.trim(), correo: normalizarCorreo(datos.correo) };
  guardarUsuarios([...usuarios, usuario]);
  return usuario;
}

export function iniciarSesion(identificador, tipo) {
  const valor = identificador.trim().toLowerCase();
  const usuario = obtenerUsuarios().find((u) =>
    u.tipo === tipo && (u.correo.toLowerCase() === valor || u.dni === valor)
  );
  if (!usuario) throw new Error("No encontramos una cuenta de ese perfil con ese DNI o correo.");
  guardarSesion(usuario.id);
  return usuario;
}

export function obtenerUsuarioActual() {
  const id = obtenerSesion();
  return id ? obtenerUsuarios().find((usuario) => usuario.id === id) || null : null;
}

export function actualizarPerfil(id, cambios) {
  const usuarios = obtenerUsuarios();
  const indice = usuarios.findIndex((usuario) => usuario.id === id);
  if (indice < 0) throw new Error("No se encontró el usuario.");
  const otros = usuarios.filter((usuario) => usuario.id !== id);
  if (otros.some((u) => u.dni === cambios.dni)) throw new Error("Ese DNI ya está registrado.");
  if (otros.some((u) => u.correo.toLowerCase() === cambios.correo.toLowerCase())) throw new Error("Ese correo ya está registrado.");
  usuarios[indice] = { ...usuarios[indice], ...cambios, correo: cambios.correo.trim().toLowerCase() };
  guardarUsuarios(usuarios);
  return usuarios[indice];
}

export function cerrarSesion() { limpiarSesion(); }
