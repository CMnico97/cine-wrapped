const pool = require("../config/database");

// =====================================================
// OBTENER ESTADÍSTICAS DE CONFITERÍA POR USUARIO
// =====================================================

const obtenerWrappedConfiteria = async (usuarioId) => {
  // Consultamos solamente las compras confirmadas.
  // COUNT cuenta las compras y SUM acumula el dinero gastado.
  const [resumen] = await pool.query(
    `
    SELECT
      COUNT(*) AS cantidadCompras,
      COALESCE(SUM(total), 0) AS totalGastado
    FROM compras_confiteria
    WHERE usuario_id = ?
      AND estado = 'confirmada'
    `,
    [usuarioId],
  );

  // Buscamos el producto más comprado por cantidad
  // de unidades, no por cantidad de compras distintas.
  const [favoritos] = await pool.query(
    `
    SELECT
      p.id,
      p.nombre,
      SUM(d.cantidad) AS cantidad
    FROM detalle_compra_confiteria AS d
    INNER JOIN compras_confiteria AS c
      ON c.id = d.compra_id
    INNER JOIN productos AS p
      ON p.id = d.producto_id
    WHERE c.usuario_id = ?
      AND c.estado = 'confirmada'
    GROUP BY p.id, p.nombre
    ORDER BY cantidad DESC, p.id ASC
    LIMIT 1
    `,
    [usuarioId],
  );

  // Si el usuario todavía no compra confitería,
  // devolvemos valores iniciales en lugar de errores.
  return {
    cantidadCompras: Number(resumen[0].cantidadCompras),
    totalGastado: Number(resumen[0].totalGastado),
    productoFavorito: favoritos.length
      ? {
          nombre: favoritos[0].nombre,
          cantidad: Number(favoritos[0].cantidad),
        }
      : null,
  };
};

module.exports = {
  obtenerWrappedConfiteria,
};
