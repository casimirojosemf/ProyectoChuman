# Conecta Local

Prototipo de directorio comercial hecho con HTML5, CSS3 y JavaScript puro. Los usuarios y negocios se guardan en `localStorage`; no hay servidor, base de datos ni contraseñas.

## Ejecutar en VS Code

1. Abre esta carpeta en Visual Studio Code.
2. Instala la extensión **Live Server** si aún no la tienes.
3. Abre `index.html` y selecciona **Open with Live Server**.
4. El navegador abrirá la aplicación. Como se usan módulos JavaScript, no se debe abrir el HTML directamente con `file://`.

## Perfiles de prueba

- Negociante: `maria@ejemplo.com` o DNI `12345678`.
- Cliente: `carlos@ejemplo.com` o DNI `87654321`.
- No se solicita contraseña en esta demostración. Desde la portada también se puede explorar como visitante.

Los datos de ejemplo se cargan la primera vez. Para reiniciar el prototipo, elimina las claves `conectaLocal.*` del almacenamiento local del navegador.

## Organización

- `index.html`: estructura semántica, barra superior y contenedor principal.
- `css/estilos.css`: paleta, componentes, tarjetas y estructura general.
- `css/formularios.css`: campos, etiquetas y estados de foco.
- `css/botones.css`: estilos y variantes de botones.
- `css/responsive.css`: ajustes para móvil, tablet y pantallas pequeñas.
- `js/app.js`: inicialización, navegación, renderizado y conexión de eventos.
- `js/usuarios.js`: validación, registro, inicio de sesión y perfil.
- `js/negocios.js`: categorías y operaciones CRUD de negocios.
- `js/buscador.js`: búsqueda y filtros combinados.
- `js/almacenamiento.js`: persistencia local y datos demostrativos.
- `js/interfaz/botones.js`: notificaciones y confirmaciones.
- `js/interfaz/menuNegociante.js`: navegación del panel del negociante.
- `js/interfaz/menuCliente.js`: navegación del explorador de negocios.
- `assets/imagenes/` y `assets/iconos/`: espacios previstos para recursos propios; las imágenes de negocios se aceptan como URL.

## Alcance del prototipo

El acceso es simulado y no proporciona autenticación real. Los datos se almacenan únicamente en el navegador actual. El número de WhatsApp se interpreta como peruano (prefijo `51`) si se ingresan nueve dígitos.
