// Importamos las funciones relacionadas
// con las funciones del cine.
const {
  obtenerFuncionesPorPelicula,
  obtenerFuncionPorId,
  obtenerAsientosPorFuncion
} = require('../services/funcion.service');

// =====================================================
// LISTAR FUNCIONES DE UNA PELÍCULA
// =====================================================

// Este controlador responderá a:
//
// GET /peliculas/:id/funciones
//
// Por ejemplo:
//
// GET /peliculas/1/funciones
const listarFuncionesPorPelicula = async (req, res) => {
  try {
    // Obtenemos el identificador de la película
    // desde los parámetros de la URL.
    const { id } = req.params;

    // Convertimos el identificador recibido
    // desde texto a número.
    const peliculaId = Number(id);

    // Validamos que sea un número entero positivo.
    if (
      !Number.isInteger(peliculaId) ||
      peliculaId <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El id de la película no es válido'
      });
    }

    // Primero comprobamos que la película exista.
    const pelicula = await obtenerPeliculaPorId(
      peliculaId
    );

    // Si no existe, devolvemos HTTP 404.
    if (!pelicula) {
      return res.status(404).json({
        ok: false,
        message: 'Película no encontrada'
      });
    }

    // Si la película existe, obtenemos
    // todas sus funciones.
    const funciones = await obtenerFuncionesPorPelicula(
      peliculaId
    );

    // Respondemos con la información obtenida.
    return res.status(200).json({
      ok: true,
      pelicula: {
        id: pelicula.id,
        titulo: pelicula.titulo
      },
      funciones
    });

  } catch (error) {
    // Mostramos el error técnico únicamente
    // en la terminal del backend.
    console.error(
      'Error al obtener las funciones:',
      error.message
    );

    // Enviamos una respuesta genérica al cliente.
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// =====================================================
// LISTAR ASIENTOS DE UNA FUNCIÓN
// =====================================================

// Este controlador responderá a:
//
// GET /funciones/:id/asientos
//
// Por ejemplo:
//
// GET /funciones/1/asientos
const listarAsientosPorFuncion = async (req, res) => {
  try {
    // Obtenemos el id de la función desde la URL.
    const { id } = req.params;

    // Convertimos el valor recibido a número.
    const funcionId = Number(id);

    // Validamos que el identificador sea
    // un número entero positivo.
    if (
      !Number.isInteger(funcionId) ||
      funcionId <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El id de la función no es válido'
      });
    }

    // Comprobamos que la función realmente exista.
    const funcion = await obtenerFuncionPorId(
      funcionId
    );

    // Si no encontramos la función,
    // respondemos con HTTP 404.
    if (!funcion) {
      return res.status(404).json({
        ok: false,
        message: 'Función no encontrada'
      });
    }

    // Buscamos los asientos pertenecientes a
    // la sala donde se realizará esta función.
    //
    // También calcularemos su disponibilidad
    // específicamente para esta función.
    const asientos = await obtenerAsientosPorFuncion(
      funcion.id,
      funcion.sala
    );

    // Respondemos con información básica de la función
    // y todos sus asientos.
    return res.status(200).json({
      ok: true,
      funcion: {
        id: funcion.id,
        pelicula_id: funcion.pelicula_id,
        fecha: funcion.fecha,
        hora: funcion.hora,
        sala: funcion.sala
      },
      asientos
    });

  } catch (error) {
    // Mostramos el error técnico en la terminal
    // para facilitar la depuración.
    console.error(
      'Error al obtener los asientos de la función:',
      error.message
    );

    // Al cliente enviamos solamente
    // un mensaje genérico.
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// =====================================================
// EXPORTACIÓN DEL CONTROLADOR
// =====================================================

// Exportamos los controladores para utilizarlos
// desde nuestras rutas.
module.exports = {
  listarFuncionesPorPelicula,
  listarAsientosPorFuncion
};