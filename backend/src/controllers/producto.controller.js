// Importamos el servicio que consulta
// los productos almacenados en MySQL.
const { obtenerProductosDisponibles } = require("../services/producto.service");

// =====================================================
// CONTROLADOR: LISTAR PRODUCTOS
// =====================================================

const listarProductos = async (req, res) => {
  try {
    // Consultamos los productos disponibles.
    const productos = await obtenerProductosDisponibles();

    // Enviamos el listado al frontend.
    return res.status(200).json({
      ok: true,
      productos,
    });
  } catch (error) {
    // Mostramos el error en la terminal.
    console.error("Error al obtener productos:", error.message);

    // Respondemos sin exponer detalles internos.
    return res.status(500).json({
      ok: false,
      message: "No fue posible obtener los productos",
    });
  }
};

// =====================================================
// EXPORTACIÓN DEL CONTROLADOR
// =====================================================

module.exports = {
  listarProductos,
};
