// Importamos las funciones relacionadas con películas
// desde nuestro servicio.
const {
  obtenerPeliculas,
  obtenerPeliculaPorId
} = require('../services/pelicula.service');


// =====================================================
// LISTAR PELÍCULAS
// =====================================================

// Este controlador será ejecutado cuando recibamos:
//
// GET /peliculas
const listarPeliculas = async (req, res) => {
  try {
    // Solicitamos al servicio todas las películas
    // almacenadas actualmente en MySQL.
    const peliculas = await obtenerPeliculas();

    // Respondemos con código HTTP 200 y la lista
    // de películas obtenida.
    return res.status(200).json({
      ok: true,
      peliculas
    });

  } catch (error) {
    // Mostramos el error técnico únicamente
    // en la terminal del backend.
    console.error(
      'Error al obtener películas:',
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
// OBTENER DETALLE DE UNA PELÍCULA
// =====================================================

// Este controlador será ejecutado cuando recibamos:
//
// GET /peliculas/:id
//
// Por ejemplo:
//
// GET /peliculas/1
const obtenerDetallePelicula = async (req, res) => {
  try {
    // Obtenemos el id enviado como parámetro
    // dentro de la URL.
    const { id } = req.params;

    // Convertimos el parámetro recibido a número.
    const peliculaId = Number(id);

    // Comprobamos que el id sea un número entero
    // positivo antes de consultar la base de datos.
    if (
      !Number.isInteger(peliculaId) ||
      peliculaId <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El id de la película no es válido'
      });
    }

    // Solicitamos al servicio la película
    // correspondiente al id recibido.
    const pelicula = await obtenerPeliculaPorId(
      peliculaId
    );

    // Si el servicio no encontró ninguna película,
    // respondemos con HTTP 404.
    if (!pelicula) {
      return res.status(404).json({
        ok: false,
        message: 'Película no encontrada'
      });
    }

    // Si encontramos la película correctamente,
    // respondemos con HTTP 200 y sus datos.
    return res.status(200).json({
      ok: true,
      pelicula
    });

  } catch (error) {
    // Mostramos el error técnico en la terminal
    // para poder identificar problemas durante
    // el desarrollo.
    console.error(
      'Error al obtener el detalle de la película:',
      error.message
    );

    // Al cliente solamente le enviamos
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
// posteriormente desde pelicula.routes.js.
module.exports = {
  listarPeliculas,
  obtenerDetallePelicula
};