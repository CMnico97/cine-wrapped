// Importamos los servicios necesarios para
// administrar las películas.
const {
  crearPelicula: crearPeliculaService,
  obtenerPeliculaPorId,
  actualizarPelicula: actualizarPeliculaService,
  eliminarPelicula: eliminarPeliculaService
} = require('../services/pelicula.service');

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
      fecha_estreno
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
        message: 'Faltan datos obligatorios de la película'
      });
    }


    // =================================================
    // VALIDAR DURACIÓN
    // =================================================

    // Convertimos la duración a número para evitar
    // almacenar valores inválidos.
    const duracionNumero = Number(duracion);

    // La duración debe ser un número entero positivo.
    if (
      !Number.isInteger(duracionNumero) ||
      duracionNumero <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message:
          'La duración debe ser un número entero mayor que 0'
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
      fecha_estreno || null
    );


    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(201).json({
      ok: true,
      message: 'Película creada correctamente',
      pelicula: {
        id: peliculaId,
        titulo: titulo.trim(),
        sinopsis: sinopsis.trim(),
        duracion: duracionNumero,
        genero: genero.trim(),
        director: director.trim(),
        poster: poster || null,
        fecha_estreno: fecha_estreno || null
      }
    });

  } catch (error) {
    // Mostramos el error en la terminal para facilitar
    // la depuración durante el desarrollo.
    console.error(
      'Error al crear película:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
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

    if (
      !Number.isInteger(peliculaId) ||
      peliculaId <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El id de la película no es válido'
      });
    }


    // =================================================
    // COMPROBAR QUE LA PELÍCULA EXISTA
    // =================================================

    const peliculaExistente =
      await obtenerPeliculaPorId(peliculaId);

    if (!peliculaExistente) {
      return res.status(404).json({
        ok: false,
        message: 'Película no encontrada'
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
      fecha_estreno
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
        message: 'Faltan datos obligatorios de la película'
      });
    }


    // =================================================
    // VALIDAR DURACIÓN
    // =================================================

    const duracionNumero = Number(duracion);

    if (
      !Number.isInteger(duracionNumero) ||
      duracionNumero <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message:
          'La duración debe ser un número entero mayor que 0'
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
      fecha_estreno || null
    );


    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(200).json({
      ok: true,
      message: 'Película actualizada correctamente',
      pelicula: {
        id: peliculaId,
        titulo: titulo.trim(),
        sinopsis: sinopsis.trim(),
        duracion: duracionNumero,
        genero: genero.trim(),
        director: director.trim(),
        poster: poster || null,
        fecha_estreno: fecha_estreno || null
      }
    });

  } catch (error) {
    console.error(
      'Error al actualizar película:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
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

    if (
      !Number.isInteger(peliculaId) ||
      peliculaId <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El id de la película no es válido'
      });
    }


    // =================================================
    // COMPROBAR EXISTENCIA
    // =================================================

    // Antes de intentar eliminar, comprobamos
    // que exista una película con ese identificador.
    const peliculaExistente =
      await obtenerPeliculaPorId(peliculaId);

    if (!peliculaExistente) {
      return res.status(404).json({
        ok: false,
        message: 'Película no encontrada'
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
      message: 'Película eliminada correctamente'
    });

  } catch (error) {
    console.error(
      'Error al eliminar película:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// =====================================================
// EXPORTACIÓN DE CONTROLADORES
// =====================================================

module.exports = {
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula
};