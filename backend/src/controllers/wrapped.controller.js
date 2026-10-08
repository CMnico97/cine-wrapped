// Importamos todas las consultas necesarias
// para construir Cine Wrapped.
const {
  obtenerResumenGeneral,
  obtenerGeneroMasVisto,
  obtenerMesMasActivo,
  obtenerUltimaPelicula,
} = require("../services/wrapped.service");

// =====================================================
// OBTENER CINE WRAPPED
// =====================================================

// Este controlador manejará:
//
// GET /usuarios/me/wrapped
//
// El usuario deberá estar autenticado.
// Su identificador será obtenido desde el JWT.
const obtenerWrapped = async (req, res) => {
  try {
    // Obtenemos el identificador del usuario
    // que fue guardado por verificarToken.
    const usuarioId = req.usuario.id;

    // =================================================
    // EJECUTAR CONSULTAS
    // =================================================

    // Ejecutamos las consultas de Wrapped.
    //
    // Promise.all permite ejecutarlas en paralelo
    // porque ninguna depende del resultado de otra.
    const [resumen, generoMasVisto, mesMasActivo, ultimaPelicula] =
      await Promise.all([
        obtenerResumenGeneral(usuarioId),
        obtenerGeneroMasVisto(usuarioId),
        obtenerMesMasActivo(usuarioId),
        obtenerUltimaPelicula(usuarioId),
      ]);

    // =================================================
    // CONSTRUIR RESPUESTA
    // =================================================

    // mysql2 puede devolver algunos resultados de
    // agregación como valores numéricos o strings
    // dependiendo de la configuración.
    //
    // Number() garantiza que nuestra API entregue
    // números en estas propiedades.
    const wrapped = {
      peliculasVistas: Number(resumen.peliculas_vistas),

      minutosEnCine: Number(resumen.minutos_en_cine),

      // Si todavía no existe actividad,
      // devolvemos null.
      generoMasVisto: generoMasVisto ? generoMasVisto.genero : null,

      // Guardamos año y mes por separado.
      //
      // Esto será más sencillo de presentar
      // posteriormente desde React.
      mesMasActivo: mesMasActivo
        ? {
            anio: Number(mesMasActivo.anio),
            mes: Number(mesMasActivo.mes),
            cantidad: Number(mesMasActivo.cantidad),
          }
        : null,

      // Si el usuario todavía no ha visto ninguna
      // película, devolvemos null.
      ultimaPelicula: ultimaPelicula
        ? {
            id: ultimaPelicula.id,
            titulo: ultimaPelicula.titulo,
            poster: ultimaPelicula.poster,
            fecha: ultimaPelicula.fecha,
            hora: ultimaPelicula.hora,
          }
        : null,
    };

    // =================================================
    // RESPUESTA EXITOSA
    // =================================================

    return res.status(200).json({
      ok: true,
      wrapped,
    });
  } catch (error) {
    // Mostramos el error técnico en la terminal
    // para facilitar el desarrollo.
    console.error("Error al obtener Cine Wrapped:", error.message);

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
