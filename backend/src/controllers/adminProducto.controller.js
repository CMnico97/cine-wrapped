// Importamos las operaciones de MySQL.
const {
  listarProductosAdmin,
  crearProductoAdmin,
  editarProductoAdmin,
  cambiarDisponibilidadProducto,
} = require("../services/adminProducto.service");

// =====================================================
// VALIDAR INFORMACIÓN DE UN PRODUCTO
// =====================================================

const validarProducto = (datos) => {
  // Comprobamos que recibimos un objeto.
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return null;
  }

  const {
    nombre,
    descripcion = null,
    categoria,
    precio,
    imagen = null,
  } = datos;

  // Validamos el nombre del producto.
  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    nombre.trim().length > 150
  ) {
    return null;
  }

  // Solo permitimos las categorías de nuestra BD.
  if (!["popcorn", "bebida"].includes(categoria)) {
    return null;
  }

  // El precio debe ser un número positivo.
  if (
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio <= 0 ||
    precio > 99999999.99 ||
    Math.round(precio * 100) !== precio * 100
  ) {
    return null;
  }

  // Validamos la descripción opcional.
  if (descripcion !== null && typeof descripcion !== "string") {
    return null;
  }

  // Validamos la imagen opcional.
  if (imagen !== null && (typeof imagen !== "string" || imagen.length > 500)) {
    return null;
  }

  // Devolvemos únicamente los campos permitidos.
  return {
    nombre: nombre.trim(),
    descripcion,
    categoria,
    precio,
    imagen,
  };
};

// =====================================================
// VALIDAR ID DE PRODUCTO
// =====================================================

const obtenerIdValido = (valor) => {
  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

// =====================================================
// LISTAR PRODUCTOS
// =====================================================

const obtenerProductosAdmin = async (req, res) => {
  try {
    const productos = await listarProductosAdmin();

    return res.status(200).json({
      ok: true,
      productos,
    });
  } catch (error) {
    console.error("Error al listar productos:", error);

    return res.status(500).json({
      ok: false,
      message: "No fue posible obtener los productos",
    });
  }
};

// =====================================================
// CREAR PRODUCTO
// =====================================================

const agregarProductoAdmin = async (req, res) => {
  try {
    const producto = validarProducto(req.body);

    if (!producto) {
      return res.status(400).json({
        ok: false,
        message: "Los datos del producto son inválidos",
      });
    }

    const id = await crearProductoAdmin(producto);

    return res.status(201).json({
      ok: true,
      message: "Producto creado correctamente",
      producto: {
        id,
        ...producto,
        disponible: true,
      },
    });
  } catch (error) {
    console.error("Error al crear producto:", error);

    return res.status(500).json({
      ok: false,
      message: "No fue posible crear el producto",
    });
  }
};

// =====================================================
// EDITAR PRODUCTO
// =====================================================

const actualizarProductoAdmin = async (req, res) => {
  try {
    const id = obtenerIdValido(req.params.id);
    const producto = validarProducto(req.body);

    if (!id || !producto) {
      return res.status(400).json({
        ok: false,
        message: "El ID o los datos son inválidos",
      });
    }

    const actualizado = await editarProductoAdmin(id, producto);

    if (!actualizado) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Producto actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al editar producto:", error);

    return res.status(500).json({
      ok: false,
      message: "No fue posible actualizar el producto",
    });
  }
};

// =====================================================
// CAMBIAR DISPONIBILIDAD
// =====================================================

const actualizarDisponibilidadAdmin = async (req, res) => {
  try {
    const id = obtenerIdValido(req.params.id);
    const { disponible } = req.body || {};

    // Exigimos un booleano real: true o false.
    if (!id || typeof disponible !== "boolean") {
      return res.status(400).json({
        ok: false,
        message: "El ID o la disponibilidad son inválidos",
      });
    }

    const actualizado = await cambiarDisponibilidadProducto(id, disponible);

    if (!actualizado) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      message: disponible
        ? "Producto activado correctamente"
        : "Producto desactivado correctamente",
    });
  } catch (error) {
    console.error("Error al cambiar disponibilidad:", error);

    return res.status(500).json({
      ok: false,
      message: "No fue posible cambiar la disponibilidad",
    });
  }
};

// Exportamos los controladores.
module.exports = {
  obtenerProductosAdmin,
  agregarProductoAdmin,
  actualizarProductoAdmin,
  actualizarDisponibilidadAdmin,
};
