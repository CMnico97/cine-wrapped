// Importamos la conexión MySQL del proyecto.
const pool = require("../config/database");

// =====================================================
// LISTAR TODOS LOS PRODUCTOS
// =====================================================

const listarProductosAdmin = async () => {
  // A diferencia del catálogo público, incluimos
  // los productos disponibles y los desactivados.
  const [productos] = await pool.query(`
    SELECT
      id,
      nombre,
      descripcion,
      categoria,
      precio,
      imagen,
      disponible,
      fecha_creacion
    FROM productos
    ORDER BY id DESC
  `);

  return productos;
};

// =====================================================
// CREAR PRODUCTO
// =====================================================

const crearProductoAdmin = async (producto) => {
  const { nombre, descripcion, categoria, precio, imagen } = producto;

  // Registramos el nuevo producto como disponible.
  const [resultado] = await pool.query(
    `
    INSERT INTO productos
      (nombre, descripcion, categoria, precio, imagen, disponible)
    VALUES (?, ?, ?, ?, ?, 1)
    `,
    [nombre, descripcion, categoria, precio, imagen],
  );

  return resultado.insertId;
};

// =====================================================
// EDITAR PRODUCTO
// =====================================================

const editarProductoAdmin = async (id, producto) => {
  const { nombre, descripcion, categoria, precio, imagen } = producto;

  // Actualizamos la información sin modificar
  // la disponibilidad actual del producto.
  const [resultado] = await pool.query(
    `
    UPDATE productos
    SET
      nombre = ?,
      descripcion = ?,
      categoria = ?,
      precio = ?,
      imagen = ?
    WHERE id = ?
    `,
    [nombre, descripcion, categoria, precio, imagen, id],
  );

  // Indica si existía un producto con ese ID.
  return resultado.affectedRows > 0;
};

// =====================================================
// ACTIVAR O DESACTIVAR PRODUCTO
// =====================================================

const cambiarDisponibilidadProducto = async (id, disponible) => {
  // No eliminamos el producto para conservar
  // las referencias del historial de compras.
  const [resultado] = await pool.query(
    `
    UPDATE productos
    SET disponible = ?
    WHERE id = ?
    `,
    [disponible ? 1 : 0, id],
  );

  return resultado.affectedRows > 0;
};

// Exportamos las operaciones de administración.
module.exports = {
  listarProductosAdmin,
  crearProductoAdmin,
  editarProductoAdmin,
  cambiarDisponibilidadProducto,
};
