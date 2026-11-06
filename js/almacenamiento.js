const CLAVES = {
  usuarios: "conectaLocal.usuarios",
  negocios: "conectaLocal.negocios",
  favoritos: "conectaLocal.favoritos",
  sesion: "conectaLocal.sesion"
};

function leer(clave, inicial = []) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : inicial;
  } catch (error) {
    console.error(`No se pudo leer ${clave} desde localStorage.`, error);
    return inicial;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.error(`No se pudo guardar ${clave} en localStorage.`, error);
    throw new Error("No fue posible guardar los cambios en este navegador.");
  }
}

export const obtenerUsuarios = () => leer(CLAVES.usuarios);
export const guardarUsuarios = (usuarios) => guardar(CLAVES.usuarios, usuarios);
export const obtenerNegocios = () => leer(CLAVES.negocios);
export const guardarNegocios = (negocios) => guardar(CLAVES.negocios, negocios);
export const obtenerFavoritos = () => leer(CLAVES.favoritos);
export const guardarFavoritos = (favoritos) => guardar(CLAVES.favoritos, favoritos);
export const obtenerSesion = () => leer(CLAVES.sesion, null);
export const guardarSesion = (sesion) => guardar(CLAVES.sesion, sesion);
export const limpiarSesion = () => localStorage.removeItem(CLAVES.sesion);

export function inicializarDemo() {
  if (!localStorage.getItem(CLAVES.usuarios)) {
    guardarUsuarios([
      { id: "demo-usuario", nombres: "María Elena", apellidos: "Rojas", dni: "12345678", correo: "maria@ejemplo.com", telefono: "987654321", tipo: "negociante" },
      { id: "demo-cliente", nombres: "Carlos", apellidos: "Vega", dni: "87654321", correo: "carlos@ejemplo.com", telefono: "912345678", tipo: "cliente" }
    ]);
  }
  if (!localStorage.getItem(CLAVES.negocios)) {
    guardarNegocios([
      { id: "demo-bodega", propietarioId: "demo-usuario", nombre: "Bodega La Esquina", categoria: "abarrotes", descripcion: "Productos frescos, abarrotes y todo lo que necesitas para tu hogar.", direccion: "Av. Los Olivos 245", distrito: "Miraflores", ciudad: "Lima", horario: "Lun–Sáb, 7:00 a. m.–9:00 p. m.", whatsapp: "987654321", imagen: "", estado: "abierto" },
      { id: "demo-cafe", propietarioId: "demo-usuario", nombre: "Café de Barrio", categoria: "restaurantes", descripcion: "Café peruano, desayunos y postres hechos en casa con mucho cariño.", direccion: "Calle Alcanfores 318", distrito: "Miraflores", ciudad: "Lima", horario: "Lun–Dom, 8:00 a. m.–8:00 p. m.", whatsapp: "987654321", imagen: "", estado: "abierto" },
      { id: "demo-farma", propietarioId: "demo-otro", nombre: "Farmacia Salud Vida", categoria: "farmacias", descripcion: "Atención amable y productos para cuidar de toda tu familia.", direccion: "Jr. Unión 520", distrito: "Barranco", ciudad: "Lima", horario: "Todos los días, 8:00 a. m.–10:00 p. m.", whatsapp: "955222333", imagen: "", estado: "cerrado" },
      { id: "demo-ferre", propietarioId: "demo-otro", nombre: "Ferretería El Martillo", categoria: "ferreterías", descripcion: "Herramientas, materiales y asesoría para tus proyectos.", direccion: "Av. Grau 810", distrito: "Barranco", ciudad: "Lima", horario: "Lun–Sáb, 8:00 a. m.–6:00 p. m.", whatsapp: "944111222", imagen: "", estado: "abierto" },
      { id: "demo-libreria", propietarioId: "demo-otro", nombre: "Librería Papel y Tinta", categoria: "librerías", descripcion: "Libros, útiles y artículos de papelería para todas las edades.", direccion: "Calle Colón 122", distrito: "San Isidro", ciudad: "Lima", horario: "Lun–Sáb, 9:00 a. m.–7:00 p. m.", whatsapp: "966333444", imagen: "", estado: "abierto" },
      { id: "demo-ropa", propietarioId: "demo-otro", nombre: "Estilo Andino", categoria: "ropa", descripcion: "Prendas con identidad local, cómodas y hechas para durar.", direccion: "Av. Larco 455", distrito: "Miraflores", ciudad: "Lima", horario: "Lun–Dom, 10:00 a. m.–8:00 p. m.", whatsapp: "933555666", imagen: "", estado: "abierto" }
    ]);
  }
  if (!localStorage.getItem(CLAVES.favoritos)) guardarFavoritos([]);
}
