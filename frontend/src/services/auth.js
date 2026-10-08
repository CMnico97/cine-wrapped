// =====================================================
// CONFIGURACIÓN DE SESIÓN
// =====================================================

// Clave utilizada para guardar el JWT
// dentro de localStorage.
const TOKEN_KEY = "cine_wrapped_token";

// Clave utilizada para guardar información básica
// del usuario que inició sesión.
const USUARIO_KEY = "cine_wrapped_usuario";

// =====================================================
// GUARDAR TOKEN
// =====================================================

// Guarda el JWT recibido desde nuestro backend.
export const guardarToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// =====================================================
// OBTENER TOKEN
// =====================================================

// Recupera el JWT almacenado.
//
// Si no existe una sesión,
// devuelve null.
export const obtenerToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// =====================================================
// GUARDAR USUARIO
// =====================================================

// Guardamos información básica del usuario.
//
// Como localStorage solamente almacena texto,
// convertimos el objeto a JSON.
export const guardarUsuario = (usuario) => {
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
};

// =====================================================
// OBTENER USUARIO
// =====================================================

// Recuperamos el usuario guardado
// durante el inicio de sesión.
export const obtenerUsuario = () => {
  const usuarioGuardado = localStorage.getItem(USUARIO_KEY);

  // Si no existe información guardada,
  // devolvemos null.
  if (!usuarioGuardado) {
    return null;
  }

  try {
    // Convertimos nuevamente el texto JSON
    // en un objeto JavaScript.
    return JSON.parse(usuarioGuardado);
  } catch {
    // Si por alguna razón el contenido guardado
    // no es JSON válido, devolvemos null.
    return null;
  }
};

// =====================================================
// CERRAR SESIÓN
// =====================================================

// Eliminamos toda la información correspondiente
// a la sesión actual.
export const cerrarSesion = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
};

// =====================================================
// COMPROBAR SESIÓN
// =====================================================

// Consideramos que existe una sesión
// cuando encontramos un JWT almacenado.
//
// El backend seguirá siendo quien realmente
// valide el token en las rutas protegidas.
export const estaAutenticado = () => {
  return Boolean(obtenerToken());
};
