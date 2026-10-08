// Importamos bcrypt para generar y comparar
// hashes de contraseñas.
const bcrypt = require("bcrypt");

// Importamos jsonwebtoken para generar tokens JWT
// cuando un usuario inicia sesión correctamente.
const jwt = require("jsonwebtoken");

// Importamos las funciones relacionadas con usuarios
// desde nuestro servicio de autenticación.
const {
  buscarUsuarioPorEmail,
  crearUsuario,
  obtenerUsuarioPorId,
} = require("../services/auth.service");

// =====================================================
// REGISTRO DE USUARIOS
// =====================================================

// Esta función será ejecutada cuando recibamos:
//
// POST /auth/register
const register = async (req, res) => {
  try {
    // Extraemos los datos enviados en el cuerpo
    // de la petición HTTP.
    const { nombre, email, password } = req.body;

    // =================================================
    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    // =================================================

    // Comprobamos que todos los campos necesarios
    // hayan sido enviados.
    if (!nombre || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, email y contraseña son obligatorios",
      });
    }

    // =================================================
    // VALIDACIÓN BÁSICA DE CONTRASEÑA
    // =================================================

    // Para esta primera versión exigiremos
    // un mínimo de 6 caracteres.
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // =================================================
    // NORMALIZAR EMAIL
    // =================================================

    // Eliminamos espacios externos y convertimos
    // el correo electrónico a minúsculas.
    const emailNormalizado = email.trim().toLowerCase();

    // =================================================
    // COMPROBAR EMAIL
    // =================================================

    // Buscamos si ya existe un usuario registrado
    // con el mismo correo electrónico.
    const usuarioExistente = await buscarUsuarioPorEmail(emailNormalizado);

    // Si encontramos un usuario, rechazamos
    // el nuevo registro.
    if (usuarioExistente) {
      return res.status(409).json({
        ok: false,
        message: "El email ya se encuentra registrado",
      });
    }

    // =================================================
    // HASH DE LA CONTRASEÑA
    // =================================================

    // Transformamos la contraseña utilizando bcrypt
    // antes de almacenarla en MySQL.
    //
    // El número 10 representa el costo utilizado
    // para generar el hash.
    const passwordHash = await bcrypt.hash(password, 10);

    // =================================================
    // CREAR USUARIO
    // =================================================

    // Guardamos el nuevo usuario en MySQL.
    //
    // Enviamos passwordHash en lugar de almacenar
    // directamente la contraseña original.
    const usuarioId = await crearUsuario(
      nombre.trim(),
      emailNormalizado,
      passwordHash,
    );

    // =================================================
    // RESPUESTA
    // =================================================

    // HTTP 201 indica que el usuario fue
    // creado correctamente.
    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",

      usuario: {
        id: usuarioId,
        nombre: nombre.trim(),
        email: emailNormalizado,
        rol: "usuario",
      },
    });
  } catch (error) {
    // Mostramos el error en la terminal del backend.
    console.error("Error al registrar usuario:", error.message);

    // Enviamos una respuesta genérica al cliente.
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// INICIO DE SESIÓN
// =====================================================

// Esta función será ejecutada cuando recibamos:
//
// POST /auth/login
//
// Esperamos recibir:
//
// {
//   "email": "usuario@correo.cl",
//   "password": "123456"
// }
const login = async (req, res) => {
  try {
    // Extraemos email y contraseña del cuerpo
    // de la petición HTTP.
    const { email, password } = req.body;

    // =================================================
    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    // =================================================

    // Ambos datos son necesarios para iniciar sesión.
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email y contraseña son obligatorios",
      });
    }

    // =================================================
    // NORMALIZAR EMAIL
    // =================================================

    // Eliminamos espacios externos y convertimos
    // el correo electrónico a minúsculas.
    const emailNormalizado = email.trim().toLowerCase();

    // =================================================
    // BUSCAR USUARIO
    // =================================================

    // Consultamos MySQL para comprobar si existe
    // una cuenta asociada al correo recibido.
    const usuario = await buscarUsuarioPorEmail(emailNormalizado);

    // Si el usuario no existe, rechazamos el login.
    //
    // Utilizamos un mensaje genérico para no revelar
    // si el correo está registrado o no.
    if (!usuario) {
      return res.status(401).json({
        ok: false,
        message: "Email o contraseña incorrectos",
      });
    }

    // =================================================
    // COMPROBAR CONTRASEÑA
    // =================================================

    // Comparamos la contraseña recibida con el hash
    // almacenado en la base de datos.
    const passwordCorrecta = await bcrypt.compare(password, usuario.password);

    // Si bcrypt determina que no corresponden,
    // rechazamos el inicio de sesión.
    if (!passwordCorrecta) {
      return res.status(401).json({
        ok: false,
        message: "Email o contraseña incorrectos",
      });
    }

    // =================================================
    // GENERAR TOKEN JWT
    // =================================================

    // Creamos un token que permitirá identificar
    // al usuario en futuras peticiones protegidas.
    //
    // Dentro del token solamente guardamos:
    //
    // - id del usuario
    // - rol del usuario
    //
    // Nunca incluimos la contraseña.
    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
      },

      // Clave secreta almacenada en nuestro archivo .env.
      process.env.JWT_SECRET,

      {
        // Tiempo durante el cual será válido el token.
        //
        // Si JWT_EXPIRES_IN no existe en .env,
        // utilizamos 2 horas como valor predeterminado.
        expiresIn: process.env.JWT_EXPIRES_IN || "2h",
      },
    );

    // =================================================
    // RESPUESTA
    // =================================================

    // Si llegamos hasta aquí significa que:
    //
    // 1. El usuario existe.
    // 2. La contraseña es correcta.
    // 3. El token fue generado correctamente.
    return res.status(200).json({
      ok: true,
      message: "Inicio de sesión correcto",

      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },

      token,
    });
  } catch (error) {
    // Mostramos el error en la terminal del backend.
    console.error("Error al iniciar sesión:", error.message);

    // Enviamos una respuesta genérica al cliente.
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// OBTENER PERFIL DEL USUARIO
// =====================================================

// Esta función será ejecutada cuando recibamos:
//
// GET /auth/me
const obtenerPerfil = async (req, res) => {
  try {
    // Obtenemos el id del usuario que fue
    // extraído previamente desde el JWT.
    const usuarioId = req.usuario.id;

    // Consultamos los datos actualizados
    // del usuario en MySQL.
    const usuario = await obtenerUsuarioPorId(usuarioId);

    // Si el usuario ya no existe,
    // devolvemos un error 404.
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Devolvemos solamente información pública.
    // Nunca devolvemos la contraseña.
    return res.status(200).json({
      ok: true,

      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro,
      },
    });
  } catch (error) {
    // Mostramos el error en la terminal
    // para facilitar la depuración.
    console.error("Error al obtener perfil:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// EXPORTACIÓN DE CONTROLADORES
// =====================================================

module.exports = {
  register,
  login,
  obtenerPerfil,
};
