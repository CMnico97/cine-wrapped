// Importamos las herramientas necesarias.
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// =====================================================
// CARPETA DE ALMACENAMIENTO
// =====================================================

// Definimos la ubicación donde se guardarán
// las portadas de las películas.
const carpetaPortadas = path.join(
  __dirname,
  "..",
  "uploads",
  "posters",
);

// Creamos la carpeta automáticamente si no existe.
fs.mkdirSync(carpetaPortadas, { recursive: true });

// =====================================================
// CONFIGURAR ALMACENAMIENTO
// =====================================================

const almacenamiento = multer.diskStorage({
  // Indicamos dónde se guardará cada imagen.
  destination: (req, file, callback) => {
    callback(null, carpetaPortadas);
  },

  // Generamos un nombre único para evitar
  // que dos imágenes tengan el mismo nombre.
  filename: (req, file, callback) => {
    const extensiones = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
    };

    const nombreUnico = crypto.randomBytes(16).toString("hex");
    const extension = extensiones[file.mimetype];

    callback(null, `${nombreUnico}${extension}`);
  },
});

// =====================================================
// VALIDAR TIPO DE IMAGEN
// =====================================================

const filtroImagen = (req, file, callback) => {
  // Permitimos únicamente imágenes JPG y PNG.
  const tiposPermitidos = ["image/jpeg", "image/png"];

  if (!tiposPermitidos.includes(file.mimetype)) {
    return callback(new Error("Solo se permiten imágenes JPG o PNG."));
  }

  callback(null, true);
};

// =====================================================
// CONFIGURAR MULTER
// =====================================================

const subirImagen = multer({
  storage: almacenamiento,
  fileFilter: filtroImagen,

  // Limitamos el tamaño máximo a 5 MB.
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================================================
// MIDDLEWARE PARA RECIBIR LA PORTADA
// =====================================================

// Recibimos un solo archivo cuyo campo se llama "poster".
const subirPortada = (req, res, next) => {
  subirImagen.single("poster")(req, res, (error) => {
    // Si Multer encuentra un error, respondemos
    // con un mensaje entendible para React.
    if (error) {
      return res.status(400).json({
        ok: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "La imagen no puede superar los 5 MB."
            : error.message,
      });
    }

    // Si no hay errores, continuamos al controlador.
    next();
  });
};

// Exportamos el middleware para utilizarlo en las rutas.
module.exports = subirPortada;