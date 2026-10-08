// Importamos los servicios necesarios para
// administrar las películas.
const {
  crearPelicula: crearPeliculaService,
  obtenerPeliculaPorId,
  actualizarPelicula: actualizarPeliculaService,
  eliminarPelicula: eliminarPeliculaService,
} = require("../services/pelicula.service");

// Importamos los servicios necesarios para
// administrar las funciones del cine.
const {
  crearFuncion: crearFuncionService,
  obtenerFuncionPorId,
  actualizarFuncion: actualizarFuncionService,
  eliminarFuncion: eliminarFuncionService,
} = require("../services/funcion.service");

// =====================================================
// CREAR PELÍCULA
// =====================================================

// Controlador correspondiente a:
//
// POST /admin/peliculas
//
// Esta ruta solamente podrá ejecutarse si:
//
// 1. El usuario tiene un JWT válido.
// 2. El usuario tiene rol "admin".
const crearPelicula = async (req, res) => {
  try {
    // Obtenemos los datos enviados mediante JSON.
    const {
      titulo,
      sinopsis,
      duracion,
      genero,
      director,
      poster,
      fecha_estreno,
    } = req.body;

    // =================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // =================================================

    // Estos campos son NOT NULL en nuestra
    // base de datos y forman parte de la información
    // mínima necesaria para una película.
    if (
      !titulo ||
      !sinopsis ||
      duracion === undefined ||
      !genero ||
      !director
    ) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos obligatorios de la película",
      });
    }

    // =================================================
    // VALIDAR DURACIÓN
    // =================================================

    // Convertimos la duración a número para evitar
    // almacenar valores inválidos.
    const duracionNumero = Number(duracion);

    // La duración debe ser un número entero positivo.
    if (!Number.isInteger(duracionNumero) || duracionNumero <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La duración debe ser un número entero mayor que 0",
      });
    }

    // =================================================
    // CREAR PELÍCULA
    // =================================================

    // poster y fecha_estreno pueden no ser enviados.
    //
    // En ese caso guardamos NULL en MySQL.
    const peliculaId = await crearPeliculaService(
      titulo.trim(),
      sinopsis.trim(),
      duracionNumero,
      genero.trim(),
      director.trim(),
      poster || null,
      fecha_estreno || null,
    );

    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(201).json({
      ok: true,
      message: "Película creada correctamente",
      pelicula: {
        id: peliculaId,
        titulo: titulo.trim(),
        sinopsis: sinopsis.trim(),
        duracion: duracionNumero,
        genero: genero.trim(),
        director: director.trim(),
        poster: poster || null,
        fecha_estreno: fecha_estreno || null,
      },
    });
  } catch (error) {
    // Mostramos el error en la terminal para facilitar
    // la depuración durante el desarrollo.
    console.error("Error al crear película:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// ACTUALIZAR PELÍCULA
// =====================================================

// Controlador correspondiente a:
//
// PUT /admin/peliculas/:id
//
// Permite modificar una película existente.
const actualizarPelicula = async (req, res) => {
  try {
    // Convertimos el parámetro recibido en la URL
    // a un número.
    const peliculaId = Number(req.params.id);

    // =================================================
    // VALIDAR ID
    // =================================================

    if (!Number.isInteger(peliculaId) || peliculaId <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El id de la película no es válido",
      });
    }

    // =================================================
    // COMPROBAR QUE LA PELÍCULA EXISTA
    // =================================================

    const peliculaExistente = await obtenerPeliculaPorId(peliculaId);

    if (!peliculaExistente) {
      return res.status(404).json({
        ok: false,
        message: "Película no encontrada",
      });
    }

    // =================================================
    // OBTENER DATOS
    // =================================================

    const {
      titulo,
      sinopsis,
      duracion,
      genero,
      director,
      poster,
      fecha_estreno,
    } = req.body;

    // =================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // =================================================

    if (
      !titulo ||
      !sinopsis ||
      duracion === undefined ||
      !genero ||
      !director
    ) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos obligatorios de la película",
      });
    }

    // =================================================
    // VALIDAR DURACIÓN
    // =================================================

    const duracionNumero = Number(duracion);

    if (!Number.isInteger(duracionNumero) || duracionNumero <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La duración debe ser un número entero mayor que 0",
      });
    }

    // =================================================
    // ACTUALIZAR EN LA BASE DE DATOS
    // =================================================

    await actualizarPeliculaService(
      peliculaId,
      titulo.trim(),
      sinopsis.trim(),
      duracionNumero,
      genero.trim(),
      director.trim(),
      poster || null,
      fecha_estreno || null,
    );

    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(200).json({
      ok: true,
      message: "Película actualizada correctamente",
      pelicula: {
        id: peliculaId,
        titulo: titulo.trim(),
        sinopsis: sinopsis.trim(),
        duracion: duracionNumero,
        genero: genero.trim(),
        director: director.trim(),
        poster: poster || null,
        fecha_estreno: fecha_estreno || null,
      },
    });
  } catch (error) {
    console.error("Error al actualizar película:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// ELIMINAR PELÍCULA
// =====================================================

// Controlador correspondiente a:
//
// DELETE /admin/peliculas/:id
//
// Permite eliminar una película existente.
const eliminarPelicula = async (req, res) => {
  try {
    // Obtenemos el identificador desde la URL
    // y lo convertimos a número.
    const peliculaId = Number(req.params.id);

    // =================================================
    // VALIDAR ID
    // =================================================

    if (!Number.isInteger(peliculaId) || peliculaId <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El id de la película no es válido",
      });
    }

    // =================================================
    // COMPROBAR EXISTENCIA
    // =================================================

    // Antes de intentar eliminar, comprobamos
    // que exista una película con ese identificador.
    const peliculaExistente = await obtenerPeliculaPorId(peliculaId);

    if (!peliculaExistente) {
      return res.status(404).json({
        ok: false,
        message: "Película no encontrada",
      });
    }

    // =================================================
    // ELIMINAR PELÍCULA
    // =================================================

    await eliminarPeliculaService(peliculaId);

    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(200).json({
      ok: true,
      message: "Película eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar película:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// CREAR FUNCIÓN
// =====================================================

// Controlador correspondiente a:
//
// POST /admin/funciones
//
// Esta operación solamente puede ser realizada
// por un usuario administrador.
const crearFuncion = async (req, res) => {
  try {
    // Obtenemos los datos enviados por el administrador.
    const { pelicula_id, fecha, hora, sala } = req.body;

    // =================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // =================================================

    if (pelicula_id === undefined || !fecha || !hora || sala === undefined) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos obligatorios de la función",
      });
    }

    // =================================================
    // VALIDAR PELÍCULA
    // =================================================

    // Convertimos el identificador recibido
    // a un número.
    const peliculaId = Number(pelicula_id);

    if (!Number.isInteger(peliculaId) || peliculaId <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El id de la película no es válido",
      });
    }

    // =================================================
    // COMPROBAR QUE LA PELÍCULA EXISTA
    // =================================================

    // Ya tenemos este servicio porque lo utilizamos
    // anteriormente en el CRUD de películas.
    const pelicula = await obtenerPeliculaPorId(peliculaId);

    if (!pelicula) {
      return res.status(404).json({
        ok: false,
        message: "Película no encontrada",
      });
    }

    // =================================================
    // VALIDAR SALA
    // =================================================

    // En nuestro modelo actual la sala se representa
    // simplemente mediante un número entero positivo.
    const salaNumero = Number(sala);

    if (!Number.isInteger(salaNumero) || salaNumero <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La sala debe ser un número entero mayor que 0",
      });
    }

    // =================================================
    // VALIDAR FECHA
    // =================================================

    // Esperamos una fecha con formato:
    //
    // YYYY-MM-DD
    //
    // Ejemplo:
    //
    // 2026-10-15
    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatoFecha.test(fecha)) {
      return res.status(400).json({
        ok: false,
        message: "La fecha debe tener formato YYYY-MM-DD",
      });
    }

    // =================================================
    // VALIDAR HORA
    // =================================================

    // Aceptamos:
    //
    // HH:MM
    //
    // o:
    //
    // HH:MM:SS
    //
    // y además limitamos las horas a 00-23
    // y los minutos/segundos a 00-59.
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (!formatoHora.test(hora)) {
      return res.status(400).json({
        ok: false,
        message: "La hora debe tener formato HH:MM o HH:MM:SS",
      });
    }

    // =================================================
    // CREAR FUNCIÓN
    // =================================================

    const funcionId = await crearFuncionService(
      peliculaId,
      fecha,
      hora,
      salaNumero,
    );

    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(201).json({
      ok: true,
      message: "Función creada correctamente",
      funcion: {
        id: funcionId,
        pelicula_id: peliculaId,
        fecha,
        hora,
        sala: salaNumero,
      },
    });
  } catch (error) {
    console.error("Error al crear función:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// ACTUALIZAR FUNCIÓN
// =====================================================

// Controlador correspondiente a:
//
// PUT /admin/funciones/:id
//
// Permite modificar una función existente.
const actualizarFuncion = async (req, res) => {
  try {
    // Obtenemos el identificador de la función
    // desde la URL.
    const funcionId = Number(req.params.id);

    // =================================================
    // VALIDAR ID DE LA FUNCIÓN
    // =================================================

    if (!Number.isInteger(funcionId) || funcionId <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El id de la función no es válido",
      });
    }

    // =================================================
    // COMPROBAR QUE LA FUNCIÓN EXISTA
    // =================================================

    const funcionExistente = await obtenerFuncionPorId(funcionId);

    if (!funcionExistente) {
      return res.status(404).json({
        ok: false,
        message: "Función no encontrada",
      });
    }

    // =================================================
    // OBTENER DATOS
    // =================================================

    const { pelicula_id, fecha, hora, sala } = req.body;

    // =================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // =================================================

    if (pelicula_id === undefined || !fecha || !hora || sala === undefined) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos obligatorios de la función",
      });
    }

    // =================================================
    // VALIDAR PELÍCULA
    // =================================================

    const peliculaId = Number(pelicula_id);

    if (!Number.isInteger(peliculaId) || peliculaId <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El id de la película no es válido",
      });
    }

    // Comprobamos que la película indicada
    // realmente exista.
    const pelicula = await obtenerPeliculaPorId(peliculaId);

    if (!pelicula) {
      return res.status(404).json({
        ok: false,
        message: "Película no encontrada",
      });
    }

    // =================================================
    // VALIDAR SALA
    // =================================================

    const salaNumero = Number(sala);

    if (!Number.isInteger(salaNumero) || salaNumero <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La sala debe ser un número entero mayor que 0",
      });
    }

    // =================================================
    // VALIDIDAR FECHA
    // =================================================

    // Esperamos el formato YYYY-MM-DD.
    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatoFecha.test(fecha)) {
      return res.status(400).json({
        ok: false,
        message: "La fecha debe tener formato YYYY-MM-DD",
      });
    }

    // =================================================
    // VALIDAR HORA
    // =================================================

    // Permitimos HH:MM o HH:MM:SS.
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (!formatoHora.test(hora)) {
      return res.status(400).json({
        ok: false,
        message: "La hora debe tener formato HH:MM o HH:MM:SS",
      });
    }

    // =================================================
    // ACTUALIZAR FUNCIÓN
    // =================================================

    await actualizarFuncionService(
      funcionId,
      peliculaId,
      fecha,
      hora,
      salaNumero,
    );

    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(200).json({
      ok: true,
      message: "Función actualizada correctamente",
      funcion: {
        id: funcionId,
        pelicula_id: peliculaId,
        fecha,
        hora,
        sala: salaNumero,
      },
    });
  } catch (error) {
    console.error("Error al actualizar función:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// ELIMINAR FUNCIÓN
// =====================================================

// Controlador correspondiente a:
//
// DELETE /admin/funciones/:id
//
// Solamente los administradores pueden acceder
// a esta operación.
const eliminarFuncion = async (req, res) => {
  try {
    // Obtenemos el identificador enviado
    // mediante la URL.
    const funcionId = Number(req.params.id);

    // =================================================
    // VALIDAR ID
    // =====================================================

    if (!Number.isInteger(funcionId) || funcionId <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El id de la función no es válido",
      });
    }

    // =================================================
    // COMPROBAR EXISTENCIA
    // =====================================================

    // Antes de eliminar comprobamos que la función
    // realmente exista.
    const funcionExistente = await obtenerFuncionPorId(funcionId);

    if (!funcionExistente) {
      return res.status(404).json({
        ok: false,
        message: "Función no encontrada",
      });
    }

    // =================================================
    // ELIMINAR FUNCIÓN
    // =====================================================

    await eliminarFuncionService(funcionId);

    // =================================================
    // RESPUESTA EXITOSA
    // =====================================================

    return res.status(200).json({
      ok: true,
      message: "Función eliminada correctamente",
    });
  } catch (error) {
    // Mostramos el error técnico en la terminal
    // durante el desarrollo.
    console.error("Error al eliminar función:", error.message);

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
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
  crearFuncion,
  actualizarFuncion,
  eliminarFuncion,
};
