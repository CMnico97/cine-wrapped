// Importamos jsonwebtoken para poder verificar
// los tokens enviados por los usuarios.
const jwt = require('jsonwebtoken');


// =====================================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================================

// Este middleware comprobará si una petición contiene
// un token JWT válido.
//
// Si el token es correcto:
// - permitimos continuar hacia la ruta solicitada.
//
// Si el token no existe o es inválido:
// - rechazamos la petición con HTTP 401.
const verificarToken = (req, res, next) => {
  try {
    // Obtenemos el contenido del encabezado Authorization.
    //
    // Esperamos recibir algo parecido a:
    //
    // Authorization: Bearer eyJhbGciOiJIUzI1Ni...
    const authorization = req.headers.authorization;


    // =================================================
    // COMPROBAR QUE EXISTE EL TOKEN
    // =================================================

    // Si no existe el encabezado Authorization,
    // el usuario no está enviando sus credenciales.
    if (!authorization) {
      return res.status(401).json({
        ok: false,
        message: 'Token de autenticación requerido'
      });
    }


    // =================================================
    // COMPROBAR FORMATO BEARER
    // =================================================

    // Separamos el encabezado utilizando el espacio.
    //
    // Ejemplo:
    //
    // "Bearer abc123"
    //
    // se transforma en:
    //
    // ["Bearer", "abc123"]
    const partes = authorization.split(' ');

    // Comprobamos que el encabezado tenga exactamente
    // las dos partes esperadas y utilice Bearer.
    if (
      partes.length !== 2 ||
      partes[0] !== 'Bearer'
    ) {
      return res.status(401).json({
        ok: false,
        message: 'Formato de token inválido'
      });
    }


    // La segunda parte contiene el JWT.
    const token = partes[1];


    // =================================================
    // VERIFICAR JWT
    // =================================================

    // jwt.verify() comprueba:
    //
    // - que el token haya sido firmado con nuestro secret
    // - que el token no haya sido modificado
    // - que el token no haya expirado
    //
    // Si algo no es válido, jwt.verify() genera un error
    // que será capturado por nuestro catch.
    const datosToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // =================================================
    // GUARDAR USUARIO EN LA PETICIÓN
    // =================================================

    // Al crear el token durante el login guardamos:
    //
    // {
    //   id: usuario.id,
    //   rol: usuario.rol
    // }
    //
    // Ahora recuperamos esos datos y los agregamos
    // al objeto req.
    //
    // Las rutas posteriores podrán utilizar:
    //
    // req.usuario.id
    // req.usuario.rol
    req.usuario = {
      id: datosToken.id,
      rol: datosToken.rol
    };


    // =================================================
    // CONTINUAR
    // =================================================

    // El token es válido.
    //
    // next() permite que Express continúe ejecutando
    // el siguiente controlador de la ruta.
    next();

  } catch (error) {
    // Si el JWT es inválido, fue alterado o expiró,
    // rechazamos la petición.
    return res.status(401).json({
      ok: false,
      message: 'Token inválido o expirado'
    });
  }
};

// =====================================================
// VERIFICAR ROL DE ADMINISTRADOR
// =====================================================

// Este middleware se utilizará después de verificarToken.
//
// Por lo tanto, cuando esta función se ejecute,
// req.usuario ya debería contener:
//
// {
//   id: ...,
//   rol: ...
// }
//
// Solamente permitiremos continuar si el usuario
// tiene el rol "admin".
const verificarAdmin = (req, res, next) => {
  // Comprobamos que exista información del usuario.
  //
  // Normalmente siempre existirá porque este middleware
  // se utilizará después de verificarToken.
  if (!req.usuario) {
    return res.status(401).json({
      ok: false,
      message: 'Usuario no autenticado'
    });
  }


  // ===================================================
  // COMPROBAR ROL
  // ===================================================

  // Si el usuario no tiene rol de administrador,
  // rechazamos el acceso.
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      ok: false,
      message:
        'No tiene permisos para realizar esta operación'
    });
  }


  // ===================================================
  // ACCESO AUTORIZADO
  // ===================================================

  // Si llegamos hasta aquí significa que:
  //
  // 1. El usuario está autenticado.
  // 2. Su rol es admin.
  //
  // Permitimos que Express continúe con
  // el siguiente middleware o controlador.
  next();
};

// =====================================================
// EXPORTACIÓN DE MIDDLEWARES
// =====================================================

module.exports = {
  verificarToken,
  verificarAdmin
};