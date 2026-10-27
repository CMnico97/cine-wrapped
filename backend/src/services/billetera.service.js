
const pool = require("../config/database");

// =====================================================
// CONSULTAR SALDO DE PUNTOS
// =====================================================

// Obtiene el saldo actual del usuario autenticado.
//
// Si todavía no tiene una billetera creada,
// devuelve 0 puntos disponibles.
const obtenerSaldoPuntos = async (usuarioId) => {
  const [filas] = await pool.query(
    `
      SELECT saldo
      FROM billeteras_puntos
      WHERE usuario_id = ?
    `,
    [usuarioId],
  );

  // Si el usuario aún no tiene billetera,
  // consideramos que su saldo es 0.
  if (filas.length === 0) {
    return 0;
  }

  return Number(filas[0].saldo);
};

// =====================================================
// CONSULTAR HISTORIAL DE MOVIMIENTOS DE PUNTOS
// =====================================================

// Obtiene los movimientos de puntos del usuario.
//
// Incluye tanto acumulaciones como canjes
// realizados al comprar entradas o confitería.
const obtenerMovimientosPuntos = async (usuarioId) => {
  // Consultamos únicamente los movimientos
  // pertenecientes al usuario autenticado.
  const [filas] = await pool.query(
    `
      SELECT
        id,
        tipo,
        origen,
        compra_id,
        puntos,
        fecha_movimiento
      FROM movimientos_puntos
      WHERE usuario_id = ?
      ORDER BY fecha_movimiento DESC, id DESC
    `,
    [usuarioId],
  );

  // Convertimos los puntos a números para
  // facilitar su utilización en React.
  return filas.map((movimiento) => ({
    id: movimiento.id,
    tipo: movimiento.tipo,
    origen: movimiento.origen,
    compra_id: movimiento.compra_id,
    puntos: Number(movimiento.puntos),
    fecha_movimiento: movimiento.fecha_movimiento,
  }));
};

// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
  obtenerSaldoPuntos,
  obtenerMovimientosPuntos,
};
