
const {
  obtenerSaldoPuntos,
  obtenerMovimientosPuntos,
} = require("../services/billetera.service");

// =====================================================
// CONSULTAR MIS PUNTOS
// =====================================================

// Controlador del endpoint GET /usuarios/me/puntos.
//
// El usuario se identifica mediante el JWT.
// No aceptamos un ID enviado desde el frontend.
const consultarMisPuntos = async (req, res) => {
  try {
    // Obtenemos el ID del usuario autenticado.
    const usuarioId = req.usuario.id;

    // Consultamos el saldo almacenado en MySQL.
    const saldo = await obtenerSaldoPuntos(usuarioId);

    // Enviamos el resultado al frontend.
    return res.status(200).json({
      ok: true,
      puntos: {
        saldo,
        valor_por_punto: 10,
        pesos_por_punto_ganado: 100,
        descuento_maximo_porcentaje: 50,
      },
    });
  } catch (error) {
    console.error("Error al consultar puntos:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar los puntos",
    });
  }
};

// =====================================================
// CONSULTAR HISTORIAL DE MOVIMIENTOS DE PUNTOS
// =====================================================

// Controlador del endpoint:
// GET /usuarios/me/puntos/movimientos
//
// Devuelve los puntos acumulados y canjeados
// por el usuario autenticado.
const consultarMovimientosPuntos = async (req, res) => {
  try {
    // Recuperamos el usuario desde el JWT validado.
    const usuarioId = req.usuario.id;

    // Consultamos los movimientos almacenados
    // en la tabla movimientos_puntos.
    const movimientos = await obtenerMovimientosPuntos(usuarioId);

    // Devolvemos el historial al frontend.
    return res.status(200).json({
      ok: true,
      movimientos,
    });
  } catch (error) {
    // Registramos el error en el backend.
    console.error(
      "Error al consultar movimientos de puntos:",
      error.message
    );

    // Ocultamos detalles internos de MySQL.
    return res.status(500).json({
      ok: false,
      message: "No fue posible obtener el historial de puntos",
    });
  }
};

// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
  consultarMisPuntos,
  consultarMovimientosPuntos,
};
