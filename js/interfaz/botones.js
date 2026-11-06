export function notificar(mensaje, tipo = "success") {
  const region = document.querySelector("#toast-region");
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3500);
}

export function confirmar(mensaje) {
  return window.confirm(mensaje);
}
