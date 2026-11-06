import { obtenerFavoritos, guardarFavoritos } from "./almacenamiento.js";

function exigirCliente(usuario) {
  if (!usuario || usuario.tipo !== "cliente") throw new Error("Inicia sesión como cliente para gestionar favoritos.");
}

export function listarFavoritos(usuario) {
  exigirCliente(usuario);
  return obtenerFavoritos().filter((favorito) => favorito.usuarioId === usuario.id).map((favorito) => favorito.negocioId);
}

export function alternarFavorito(usuario, negocioId) {
  exigirCliente(usuario);
  const favoritos = obtenerFavoritos();
  const existe = favoritos.some((favorito) => favorito.usuarioId === usuario.id && favorito.negocioId === negocioId);
  guardarFavoritos(existe
    ? favoritos.filter((favorito) => !(favorito.usuarioId === usuario.id && favorito.negocioId === negocioId))
    : [...favoritos, { usuarioId: usuario.id, negocioId }]);
  return !existe;
}
