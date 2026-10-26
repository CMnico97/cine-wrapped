// =====================================================
// SERVICIOS DE ESTADÍSTICAS DE PELÍCULAS
// =====================================================

// Importamos las consultas existentes de Cine Wrapped.
const {
  obtenerResumenGeneral,
  obtenerGeneroMasVisto,
  obtenerMesMasActivo,
  obtenerUltimaPelicula,
} = require("../services/wrapped.service");

// =====================================================
// SERVICIO DE ESTADÍSTICAS DE CONFITERÍA
// =====================================================

// Importamos la nueva función que calcula:
// - Cantidad de compras.
// - Total gastado.
// - Producto favorito.
const {
  obtenerWrappedConfiteria,
} = require("../services/wrappedConfiteria.service");

// =====================================================
// OBTENER CINE WRAPPED
// =====================================================

// Endpoint:
// GET /usuarios/me/wrapped
//
// La ruta debe estar protegida por verificarToken.
// El ID del usuario se obtiene desde el JWT.
const obtenerWrapped = async (req, res) => {
  try {
    // Obtenemos el ID del usuario autenticado.
    const usuarioId = req.usuario.id;

    // =================================================
    // EJECUTAR CONSULTAS EN PARALELO
    // =================================================

    // Ejecutamos las cuatro consultas de películas
    // y la nueva consulta de confitería.
    //
    // Promise.all permite obtener todos los datos
    // sin esperar una consulta antes de iniciar otra.
    const [resumen, generoMasVisto, mesMasActivo, ultimaPelicula, confiteria] =
      await Promise.all([
        obtenerResumenGeneral(usuarioId),
        obtenerGeneroMasVisto(usuarioId),
        obtenerMesMasActivo(usuarioId),
        obtenerUltimaPelicula(usuarioId),
        obtenerWrappedConfiteria(usuarioId),
      ]);

    // =================================================
    // CONSTRUIR RESPUESTA DE CINE WRAPPED
    // =================================================

    const wrapped = {
      // ===============================================
      // ESTADÍSTICAS DE PELÍCULAS
      // ===============================================

      // Cantidad de entradas confirmadas.
      peliculasVistas: Number(resumen.peliculas_vistas),

      // Minutos acumulados según las películas vistas.
      minutosEnCine: Number(resumen.minutos_en_cine),

      // Género más visto.
      generoMasVisto: generoMasVisto ? generoMasVisto.genero : null,

      // Mes con mayor actividad.
      mesMasActivo: mesMasActivo
        ? {
            anio: Number(mesMasActivo.anio),
            mes: Number(mesMasActivo.mes),
            cantidad: Number(mesMasActivo.cantidad),
          }
        : null,

      // Película correspondiente a la función más reciente.
      ultimaPelicula: ultimaPelicula
        ? {
            id: ultimaPelicula.id,
            titulo: ultimaPelicula.titulo,
            poster: ultimaPelicula.poster,
            fecha: ultimaPelicula.fecha,
            hora: ultimaPelicula.hora,
          }
        : null,

      // ===============================================
      // ESTADÍSTICAS DE CONFITERÍA
      // ===============================================

      // Agregamos el resumen de confitería sin
      // modificar las propiedades existentes.
      confiteria: {
        cantidadCompras: confiteria.cantidadCompras,

        totalGastado: confiteria.totalGastado,

        productoFavorito: confiteria.productoFavorito,
      },
    };

    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(200).json({
      ok: true,
      wrapped,
    });
  } catch (error) {
    // Mostramos el error en la terminal del backend.
    console.error("Error al obtener Cine Wrapped:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// =====================================================
// EXPORTACIÓN DEL CONTROLADOR
// =====================================================

module.exports = {
  obtenerWrapped,
};
